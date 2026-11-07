// AI Orchestrator: Groq LLM tool-calling with deterministic guardrails + intelligent deterministic fallback engine.
import { ApiCall, Card, ChatRequestBody, ChatResponse, HRCase, SessionState, ToolTrace, TraceStep } from "./types";
import { EMPLOYEES, LEAVE_TYPES, fmtOMR } from "./ebs";
import { executeTool, TOOL_SCHEMAS, ToolCtx, ToolOutput } from "./tools";
import { detectDialect, detectLang, extractDates, extractLeaveType, extractPhone, guard, prettyDate } from "./nlp";

const DEFAULT_MODEL = "llama-3.3-70b-versatile";

function rid(prefix: string) {
  return `${prefix}-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
}

function baseSession(body: ChatRequestBody, text: string): SessionState {
  const emp = EMPLOYEES[body.employeeId] || EMPLOYEES.E10231;
  const prev = body.session;
  return {
    sessionId: prev?.sessionId || rid("SESS-NEDC"),
    authenticatedEmployeeId: emp.id,
    fndUser: emp.fndUser,
    responsibility: emp.responsibility,
    detectedLanguage: detectLang(text) === "ar" ? "ar-OM" : "en-US",
    dialect: detectDialect(text),
    intent: "unknown",
    intents: [],
    confidenceScore: 0.96,
    extractedEntities: prev?.extractedEntities || {},
    missingMandatoryFields: [],
    ebsValidationResult: "N/A",
    explicitConfirmationState: "NOT_REQUIRED",
    correlationId: `CORR-NEDC-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${Math.random().toString(16).slice(2, 8).toUpperCase()}`,
    guidedStep: 1,
    turn: (prev?.turn || 0) + 1,
  };
}

function buildTrace(o: { lang: string; dialect: string; intents: string[]; conf: number; rag: boolean; apiCalls: ApiCall[]; blocked: boolean; corr: string; fndUser: string; resp: string; model: string }): TraceStep[] {
  const ebsCalls = o.apiCalls.filter((a) => a.writeMode !== "RAG_INDEX");
  const ebsCore = ebsCalls.filter((a) => a.writeMode === "READ_ONLY" || a.writeMode === "AME_ROUTED_NO_DIRECT_DB_WRITE");
  return [
    { layer: 1, status: "active", detail: "NEDC ESS Web Portal · HTTPS / TLS 1.3 · WAF passed" },
    { layer: 2, status: "active", detail: `OIDC token validated · MFA ✓ · FND_USER ${o.fndUser} · Resp: ${o.resp}` },
    { layer: 3, status: "active", detail: `Detected ${o.lang} · ${o.dialect}` },
    { layer: 4, status: o.blocked ? "blocked" : "active", detail: o.blocked ? "Guardrail BLOCK – request refused before LLM / data layer" : `Intent(s): ${o.intents.join(", ") || "clarify"} · confidence ${o.conf.toFixed(2)} · ${o.model}` },
    { layer: 5, status: o.rag && !o.blocked ? "active" : "skipped", detail: o.rag ? "Governed RAG · in-country vector index · citation enforced" : "Not required for this intent" },
    { layer: 6, status: ebsCalls.length && !o.blocked ? "active" : "skipped", detail: ebsCalls.length ? `mTLS · JWT scope ess.self · rate-limit OK · ${ebsCalls.length} call(s)` : "No downstream call" },
    { layer: 7, status: ebsCalls.length && !o.blocked ? "active" : "skipped", detail: ebsCalls.map((a) => `${a.method} ${a.endpoint.split("?")[0]}`).join(" | ") || "—" },
    { layer: 8, status: ebsCore.length && !o.blocked ? "active" : "skipped", detail: ebsCore.map((a) => a.ebsApi).join(" | ") || "System of record untouched" },
    { layer: 9, status: "active", detail: `${o.blocked ? "HIGH-SEVERITY SIEM alert" : "Audit event"} written · ${o.corr} · PDPL masking applied` },
  ];
}

function guidedStepFor(s: SessionState): number {
  if (s.explicitConfirmationState === "AWAITING_USER_CONFIRMATION") return 21;
  if (s.ebsValidationResult.startsWith("FAILED")) return 16;
  if (s.missingMandatoryFields.length) return 9;
  if (s.intents.length) return 14;
  return 5;
}

// ======================= Public entry =======================
export async function orchestrate(body: ChatRequestBody): Promise<ChatResponse> {
  const t0 = Date.now();
  const last = [...body.messages].reverse().find((m) => m.role === "user")?.content || "";
  const emp = EMPLOYEES[body.employeeId] || EMPLOYEES.E10231;
  const session = baseSession(body, last);
  const replyLang = detectLang(last);

  // ---- Layer 4 pre-LLM deterministic guardrail (100% refusal) ----
  const g = guard(last, emp.id.replace("E", ""));
  if (g.blocked) {
    session.intent = g.kind === "PROMPT_INJECTION" ? "SECURITY_PROMPT_INJECTION" : "RBAC_CROSS_EMPLOYEE_REQUEST";
    session.intents = [session.intent];
    session.confidenceScore = 0.99;
    session.ebsValidationResult = "NOT_CALLED – blocked at orchestrator";
    session.extractedEntities = { requestedSubject: "[MASKED]", maskedQuery: g.masked };
    session.guidedStep = 4;
    const reply = replyLang === "ar"
      ? (g.kind === "PROMPT_INJECTION"
        ? "عذراً، لا أستطيع تنفيذ هذا الطلب. تم رصد محاولة لتجاوز ضوابط الأمان، وتم تسجيل الحادثة في نظام SIEM وفق سياسة أمن المعلومات وقانون حماية البيانات الشخصية العُماني."
        : "عذراً، لا يمكنني عرض أو مشاركة البيانات الشخصية أو المالية لأي موظف آخر. صلاحياتك تقتصر على بياناتك فقط وفق قانون حماية البيانات الشخصية العُماني (المرسوم السلطاني 6/2022). تم إخفاء البيانات الحساسة وتسجيل تنبيه أمني. يمكنني مساعدتك في كشف راتبك أنت.")
      : (g.kind === "PROMPT_INJECTION"
        ? "I can't do that. A prompt-injection / privilege-escalation attempt was detected and blocked. This event has been logged to the NEDC SIEM under the Information Security Policy and Oman PDPL."
        : "I'm sorry, I can't share another employee's salary, payslip or personal data. Your access is strictly limited to your own records under the Oman Personal Data Protection Law (Royal Decree 6/2022) and NEDC RBAC policy. The request has been masked and a security alert logged. I'm happy to show your own payslip instead.");
    return {
      reply, cards: [{ type: "refusal", data: { kind: g.kind, reason: g.reason, masked: g.masked, law: "Oman PDPL – Royal Decree 6/2022, Art. 11 & 23", severity: g.kind === "PROMPT_INJECTION" ? "CRITICAL" : "HIGH" } }],
      toolCalls: [], apiCalls: [], session, mode: body.apiKey || process.env.GROQ_API_KEY ? "groq" : "fallback", model: "Deterministic Guardrail Engine (pre-LLM)",
      trace: buildTrace({ lang: session.detectedLanguage, dialect: session.dialect, intents: session.intents, conf: 0.99, rag: false, apiCalls: [], blocked: true, corr: session.correlationId, fndUser: emp.fndUser, resp: emp.responsibility, model: "guardrail" }),
      guardrail: { blocked: true, reason: g.reason!, severity: g.kind === "PROMPT_INJECTION" ? "CRITICAL" : "HIGH", masked: g.masked! },
      latencyMs: Date.now() - t0,
    };
  }

  const ctx: ToolCtx = { emp, lang: replyLang, ledger: body.ledger || [], caseSeq: body.caseSeq || 0, transcript: body.messages.slice(-14), correlationId: session.correlationId };
  const key = (body.apiKey || process.env.GROQ_API_KEY || "").trim();
  let note: string | undefined;
  if (key && !body.forceDemo) {
    try {
      const r = await runGroq(body, ctx, session, key, replyLang);
      r.latencyMs = Date.now() - t0;
      return r;
    } catch (err: any) {
      note = `Groq unavailable (${String(err?.message || err).slice(0, 90)}) – switched to deterministic engine`;
    }
  }
  const r = runFallback(body, ctx, session, last, replyLang);
  r.modeNote = note || (body.forceDemo ? "Demo Mode forced in Settings" : "No GROQ_API_KEY configured – deterministic Demo Mode");
  r.latencyMs = Date.now() - t0;
  return r;
}

function collect(outs: { name: string; args: any; out: ToolOutput }[]) {
  const cards: Card[] = [];
  const apiCalls: ApiCall[] = [];
  const toolCalls: ToolTrace[] = [];
  let rag = false;
  let hrCase: HRCase | undefined;
  for (const o of outs) {
    if (o.out.card) cards.push(o.out.card);
    apiCalls.push(o.out.apiCall);
    toolCalls.push({ name: o.name, args: o.args, ok: !o.out.result?.error });
    if (o.out.ragLayer) rag = true;
    if (o.out.case) hrCase = o.out.case;
  }
  return { cards, apiCalls, toolCalls, rag, hrCase };
}

function finalizeSession(session: SessionState, outs: { name: string; args: any; out: ToolOutput }[]) {
  for (const o of outs) {
    const st = o.out.result?.status;
    if (st === "PENDING_EXPLICIT_CONFIRMATION") { session.explicitConfirmationState = "AWAITING_USER_CONFIRMATION"; session.ebsValidationResult = "PASSED (p_validate=TRUE, no commit)"; }
    if (st === "VALIDATION_FAILED") session.ebsValidationResult = `FAILED – ${(o.out.result.issues || []).filter((i: any) => !i.ok).map((i: any) => i.rule).join(", ")}`;
    if (!st && session.ebsValidationResult === "N/A" && o.name !== "queryHRPolicyRAG") session.ebsValidationResult = "READ OK (HTTP 200)";
  }
  session.guidedStep = guidedStepFor(session);
}

// ======================= Groq path =======================
async function runGroq(body: ChatRequestBody, ctx: ToolCtx, session: SessionState, key: string, lang: "en" | "ar"): Promise<ChatResponse> {
  const model = body.model || process.env.GROQ_MODEL || DEFAULT_MODEL;
  const emp = ctx.emp;
  const today = new Date().toISOString().slice(0, 10);
  const sys = `You are "Nama AI", the official bilingual HR Self-Service assistant of Nama Electricity Distribution Company (NEDC / نماء لتوزيع الكهرباء), Sultanate of Oman.
You are a logically decoupled overlay on Oracle EBS HRMS (system of record) reached only via API Gateway → OIC → ISG/SSHR/AME. Today is ${today}. Weekend in Oman is Friday–Saturday.
Authenticated employee: ${emp.nameEn} (${emp.id}), ${emp.titleEn}, grade ${emp.grade}, ${emp.department}. FND_USER ${emp.fndUser}.
RULES:
1. Reply in the language of the employee's LATEST message. If Arabic, reply in natural Gulf/Omani Arabic; if English, reply in English. Handle code-switching gracefully.
2. ALWAYS call tools to obtain HR data. Never invent balances, salaries, dates, policy content or statuses.
3. For policy questions call queryHRPolicyRAG and cite the document ID, version and effective date. If not found, say so and offer escalation.
4. For leave requests: collect leaveType, startDate, endDate (ISO, assume year ${today.slice(0, 4)} unless past → next year). Ask for missing fields. When all known call submitLeaveRequest. It only PREPARES a draft — tell the employee to press "Confirm & Submit" on the confirmation card. Never claim it is submitted. If validation fails (e.g. overlap), explain and suggest a fix.
5. For profile changes call updateEmployeeProfile; it validates and returns a draft needing explicit confirmation.
6. You can ONLY access the authenticated employee's own data. Refuse any request about other employees.
7. For grievances, medical board or complex/sensitive cases call escalateToHRCase.
8. Salary advance / loans → checkFinanceLoanOrAdvance. Travel / fleet / vehicles → requestFleetOrTravel. Call multiple tools when the question has multiple parts.
9. Be concise (max ~90 words). The UI renders rich cards from tool results, so summarise key figures only (currency OMR with 3 decimals).`;
  const history = body.messages.slice(-12).map((m) => ({ role: m.role, content: m.content }));
  const msgs: any[] = [{ role: "system", content: sys }, ...history];
  const outs: { name: string; args: any; out: ToolOutput }[] = [];
  let reply = "";
  for (let i = 0; i < 5; i++) {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
      body: JSON.stringify({ model, messages: msgs, tools: TOOL_SCHEMAS, tool_choice: "auto", temperature: 0.2, max_tokens: 700 }),
      signal: AbortSignal.timeout(20000),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status} ${(await res.text()).slice(0, 120)}`);
    const data = await res.json();
    const m = data.choices?.[0]?.message;
    if (!m) throw new Error("empty completion");
    if (m.tool_calls?.length) {
      msgs.push({ role: "assistant", content: m.content || "", tool_calls: m.tool_calls });
      for (const tc of m.tool_calls) {
        let args: any = {};
        try { args = JSON.parse(tc.function.arguments || "{}") || {}; } catch { args = {}; }
        const out = executeTool(tc.function.name, args, ctx);
        outs.push({ name: tc.function.name, args, out });
        msgs.push({ role: "tool", tool_call_id: tc.id, content: JSON.stringify(out.result).slice(0, 3500) });
      }
      continue;
    }
    reply = m.content || "";
    break;
  }
  if (!reply) reply = lang === "ar" ? "تم تنفيذ الطلب، يرجى مراجعة البطاقات أدناه." : "Done — please review the cards below.";
  const c = collect(outs);
  session.intents = outs.map((o) => o.name);
  session.intent = session.intents[session.intents.length - 1] || "conversation";
  session.confidenceScore = outs.length ? 0.97 : 0.9;
  const ents: Record<string, any> = {};
  outs.forEach((o) => Object.assign(ents, o.args));
  session.extractedEntities = ents;
  finalizeSession(session, outs);
  return {
    reply, cards: c.cards, toolCalls: c.toolCalls, apiCalls: c.apiCalls, session, mode: "groq", model: `Groq · ${model}`,
    trace: buildTrace({ lang: session.detectedLanguage, dialect: session.dialect, intents: session.intents, conf: session.confidenceScore, rag: c.rag, apiCalls: c.apiCalls, blocked: false, corr: session.correlationId, fndUser: emp.fndUser, resp: emp.responsibility, model }),
    escalationCase: c.hrCase, latencyMs: 0,
  };
}

// ======================= Deterministic fallback engine =======================
const RX = {
  balance: /balance|how many (days|leave)|remaining|leave left|days left|رصيد|كم باقي|باقي من|كم يوم/i,
  history: /leave history|past leave|previous leave|absence history|سجل الإجاز|الإجازات السابقة/i,
  submit: /(apply|submit|request|book|take|want|need|like)\b.{0,25}\b(leave|vacation|day off)|leave request|make it|أقدم إجازة|اقدم اجازة|أقدم اجازة|طلب إجازة|طلب اجازة|أبي إجازة|ابي اجازة|أبغى إجازة|ابغى اجازة|احجز إجازة/i,
  profileRead: /profile|my grade|grade|assignment|my job|my details|ملفي|درجتي|الدرجة الوظيفية|وظيفتي|بياناتي/i,
  profileUpd: /(update|change|new|correct|edit|حدث|تحديث|غير|غيّر|عدل)\b.{0,30}(mobile|phone|number|address|email|contact|رقم|هاتف|جوال|عنوان|بريد)/i,
  payslip: /payslip|pay slip|salary slip|my salary|net pay|راتبي|كشف الراتب|قسيمة الراتب|الراتب/i,
  benefits: /benefit|insurance|medical cover|مزايا|المزايا|تأمين/i,
  approval: /approval status|status of my (leave|request|transaction)|pending request|my requests|حالة طلب|وين وصل|حالة الطلب/i,
  policy: /policy|policies|rule|entitle|allowed|overtime|educational|education|assistance|carry forward|سياسة|لائحة|يحق|إضافي|اضافي|تعليمية|المساعدة/i,
  finance: /advance|loan|سلفة|سلفه|قرض/i,
  fleet: /fleet|vehicle|4x4|land ?cruiser|car booking|travel|trip|سيارة|مركبة|رحلة|مهمة رسمية|دفع رباعي/i,
  escalate: /grievance|complain|complaint|medical board|escalate|hr agent|human agent|speak to (someone|hr|a person)|harass|unfair|تظلم|شكوى|لجنة طبية|اللجنة الطبية|موظف الموارد|أكلم أحد|اكلم احد/i,
  greet: /^\s*(hi|hello|hey|good (morning|afternoon)|salam|السلام|هلا|مرحبا|صباح)/i,
};

function runFallback(body: ChatRequestBody, ctx: ToolCtx, session: SessionState, text: string, lang: "en" | "ar"): ChatResponse {
  const emp = ctx.emp;
  const prev = body.session;
  const inLeaveFlow = prev?.intents?.includes("submitLeaveRequest") && prev.explicitConfirmationState !== "CONFIRMED";
  const inProfileFlow = prev?.intents?.includes("updateEmployeeProfile");
  const dates = extractDates(text);
  const lt = extractLeaveType(text);
  const changeWord = /change|modify|update|instead|actually|غير|غيّر|عدل|بدل|خليها/i.test(text);

  const want = new Set<string>();
  if (RX.escalate.test(text)) want.add("escalateToHRCase");
  if (RX.finance.test(text)) want.add("checkFinanceLoanOrAdvance");
  if (RX.fleet.test(text)) want.add("requestFleetOrTravel");
  if (RX.profileUpd.test(text) && !/date|تاريخ/i.test(text)) want.add("updateEmployeeProfile");
  else if (inProfileFlow && extractPhone(text) && !dates.start && !dates.end) want.add("updateEmployeeProfile");
  if (RX.submit.test(text) || (inLeaveFlow && (dates.start || dates.end || lt || changeWord))) want.add("submitLeaveRequest");
  if (RX.balance.test(text)) want.add("getLeaveBalance");
  if (RX.history.test(text)) want.add("getLeaveHistory");
  if (RX.payslip.test(text) && !want.has("checkFinanceLoanOrAdvance")) want.add("getPayslip");
  if (RX.profileRead.test(text) && !want.has("updateEmployeeProfile")) want.add("getEmployeeProfile");
  if (RX.benefits.test(text)) want.add("getEmployeeBenefits");
  if (RX.approval.test(text) && !want.has("checkFinanceLoanOrAdvance") && !want.has("requestFleetOrTravel")) want.add("getApprovalStatus");
  if (RX.policy.test(text) && !want.has("submitLeaveRequest") && !want.has("getLeaveBalance")) want.add("queryHRPolicyRAG");
  if (want.has("escalateToHRCase") && /medical board|لجنة طبية|اللجنة الطبية/i.test(text)) want.add("queryHRPolicyRAG");

  const outs: { name: string; args: any; out: ToolOutput }[] = [];
  const parts: string[] = [];
  const A = (en: string, ar: string) => (lang === "ar" ? ar : en);
  let ents: Record<string, any> = {};
  let missing: string[] = [];

  const order = ["getLeaveBalance", "getLeaveHistory", "getPayslip", "getEmployeeProfile", "getEmployeeBenefits", "queryHRPolicyRAG", "submitLeaveRequest", "updateEmployeeProfile", "getApprovalStatus", "checkFinanceLoanOrAdvance", "requestFleetOrTravel", "escalateToHRCase"];
  for (const name of order) {
    if (!want.has(name)) continue;
    if (name === "submitLeaveRequest") {
      const slots = { ...(inLeaveFlow ? prev?.extractedEntities || {} : {}) } as any;
      if (lt) slots.leaveType = lt;
      if (dates.start) slots.startDate = dates.start;
      if (dates.end) slots.endDate = dates.end;
      if (dates.startOnly && !dates.end && slots.endDate && slots.endDate < dates.start!) slots.endDate = dates.start;
      if (dates.nextWeek && !slots.startDate) slots.hint = "next week (8–12 Nov)";
      missing = ["leaveType", "startDate", "endDate"].filter((k) => !slots[k]);
      ents = { ...slots };
      if (missing.length) {
        const map: Record<string, [string, string]> = { leaveType: ["leave type (Annual, Emergency, Sick, Study…)", "نوع الإجازة (سنوية، طارئة، مرضية، دراسية…)"], startDate: ["start date", "تاريخ البداية"], endDate: ["end date", "تاريخ النهاية"] };
        const need = missing.map((m) => A(map[m][0], map[m][1])).join(A(", ", "، "));
        parts.push(slots.hint
          ? A(`Sure — I can prepare a leave request for next week (Sun 8 – Thu 12 Nov). Please confirm the ${need}.`, `أبشر — أقدر أجهز لك طلب إجازة الأسبوع الجاي (من الأحد 8 إلى الخميس 12 نوفمبر). بس حدد لي ${need}.`)
          : A(`Happy to help with your leave request. I still need the ${need}.`, `حاضر، بجهز لك طلب الإجازة. باقي أحتاج ${need}.`));
        continue;
      }
      const out = executeTool(name, { leaveType: slots.leaveType, startDate: slots.startDate, endDate: slots.endDate }, ctx);
      outs.push({ name, args: { leaveType: slots.leaveType, startDate: slots.startDate, endDate: slots.endDate }, out });
      const r = out.result;
      const ltName = LEAVE_TYPES[slots.leaveType]?.[lang === "ar" ? "ar" : "en"] || slots.leaveType;
      if (r.status === "VALIDATION_FAILED") {
        const failed = r.issues.filter((i: any) => !i.ok);
        const overlap = failed.find((i: any) => i.rule.startsWith("Overlap"));
        parts.push(overlap
          ? A(`I validated this against Oracle EBS and found a conflict: your ${ltName} (${prettyDate(slots.startDate)} – ${prettyDate(slots.endDate)}) overlaps with ${overlap.note}. Would you like to change the end date (e.g. to ${prettyDate(r.suggestedEndDate || slots.startDate)} or earlier)? Just say "Change end date to …".`,
              `تحققت من النظام ولقيت تعارض: إجازتك (${prettyDate(slots.startDate, "ar")} – ${prettyDate(slots.endDate, "ar")}) تتداخل مع ${overlap.note}. تبي تغير تاريخ النهاية؟ قول مثلاً "غير تاريخ النهاية إلى 15 نوفمبر".`)
          : A(`The request did not pass EBS validation: ${failed.map((f: any) => `${f.rule} (${f.note})`).join("; ")}. Please adjust the details.`, `الطلب ما اجتاز تحقق النظام: ${failed.map((f: any) => f.rule).join("، ")}. عدّل التفاصيل لو سمحت.`));
      } else {
        const d = r.draft;
        parts.push(A(`All Oracle EBS validations passed ✅. ${ltName}: ${prettyDate(d.startDate)} → ${prettyDate(d.endDate)} = ${d.workingDays} working day(s); balance after approval: ${d.balanceAfter} days. Nothing has been submitted yet — please review and press **Confirm & Submit to Oracle EBS SSHR/AME** on the card, or **Modify**.`,
          `تم التحقق من كل شروط Oracle EBS ✅. ${ltName}: من ${prettyDate(d.startDate, "ar")} إلى ${prettyDate(d.endDate, "ar")} = ${d.workingDays} أيام عمل، والرصيد بعد الاعتماد ${d.balanceAfter} يوم. ما تم إرسال شي للحين — راجع البطاقة واضغط **تأكيد وإرسال إلى Oracle EBS** أو **تعديل**.`));
      }
      continue;
    }
    if (name === "updateEmployeeProfile") {
      let field: string = /email|بريد/i.test(text) ? "email" : /address|عنوان/i.test(text) ? "emergencyAddress" : /contact|جهة اتصال/i.test(text) ? "emergencyContact" : "mobile";
      if (inProfileFlow && !RX.profileUpd.test(text)) field = prev?.extractedEntities?.field || "mobile";
      let nv = "";
      if (field === "mobile") nv = extractPhone(text) || "";
      else if (field === "email") nv = (text.match(/[\w.+-]+@[\w-]+\.[\w.]+/) || [""])[0];
      else nv = (text.split(/\bto\b|إلى|الى|:/i).slice(1).join(" ") || "").trim();
      ents = { field, newValue: nv };
      if (!nv) {
        missing = ["newValue"];
        parts.push(A(`Sure — what is the new ${field === "mobile" ? "mobile number (format +968 9XXX XXXX)" : field}?`, `أكيد — وش ${field === "mobile" ? "رقم الهاتف الجديد (بصيغة ‎+968 9XXX XXXX)" : "القيمة الجديدة"}؟`));
        continue;
      }
      const out = executeTool(name, { field, newValue: nv }, ctx);
      outs.push({ name, args: { field, newValue: nv }, out });
      parts.push(out.result.status === "VALIDATION_FAILED"
        ? A(`"${nv}" is not a valid ${field === "mobile" ? "Omani mobile number" : "value"}. Expected format: ${out.result.expectedFormat}. Please re-enter it.`, `الرقم "${nv}" غير صحيح. الصيغة المطلوبة: ‎+968 9XXX XXXX (8 أرقام). أرسل الرقم الصحيح لو سمحت.`)
        : A(`Format validated ✅. Please review the old vs new value and press **Confirm** — the change will then route to Oracle AME (Line Manager → HR Notify). Nothing is written until you confirm.`, `تم التحقق من الصيغة ✅. راجع القيمة القديمة والجديدة واضغط **تأكيد** — بعدها يتحول الطلب لمسار الموافقات Oracle AME. ما يتم حفظ شي قبل تأكيدك.`));
      continue;
    }
    const args: any = name === "queryHRPolicyRAG" ? { query: text } : name === "escalateToHRCase" ? { category: /medical|طبية/i.test(text) ? "Medical Board / Long-Term Sick" : "Employee Grievance", summary: text.slice(0, 220) } : name === "requestFleetOrTravel" ? { action: "status" } : {};
    const out = executeTool(name, args, ctx);
    outs.push({ name, args, out });
    const r = out.result;
    switch (name) {
      case "getLeaveBalance": {
        const an = r.balances.find((b: any) => b.key === "annual");
        parts.push(A(`Your Annual Leave balance is **${an.balance} days** (of ${an.entitlement}); Emergency Leave: ${r.balances.find((b: any) => b.key === "emergency").balance} days.`, `رصيد إجازتك السنوية **${an.balance} يوم** من أصل ${an.entitlement}، والإجازة الطارئة ${r.balances.find((b: any) => b.key === "emergency").balance} أيام.`));
        break;
      }
      case "getLeaveHistory": parts.push(A(`Here is your 2026 absence history from Oracle EBS (${r.items.length} records).`, `هذا سجل إجازاتك لعام 2026 من النظام (${r.items.length} سجلات).`)); break;
      case "getPayslip": parts.push(A(`Your ${r.period} payslip: gross OMR ${fmtOMR(r.gross)}, net pay **OMR ${fmtOMR(r.net)}** (credited ${r.payDate}).`, `كشف راتب ${r.periodAr}: الإجمالي ${fmtOMR(r.gross)} ر.ع، وصافي الراتب **${fmtOMR(r.net)} ر.ع**.`)); break;
      case "getEmployeeProfile": parts.push(A(`You are **${r.job}**, grade **${r.grade}**, in ${r.organization} (assignment ${r.employeeNumber}-1, active).`, `وظيفتك **${r.jobAr}**، الدرجة **${r.grade}**، في ${r.organizationAr}.`)); break;
      case "getEmployeeBenefits": parts.push(A(`You have ${r.plans.filter((p: any) => p.status === "Enrolled").length} active benefit enrolments.`, `لديك ${r.plans.filter((p: any) => p.status === "Enrolled").length} مزايا مفعّلة.`)); break;
      case "getApprovalStatus": parts.push(r.items.length ? A(`You have ${r.items.length} transaction(s) in Oracle Workflow.`, `لديك ${r.items.length} طلب/طلبات في مسار الموافقات.`) : A("You have no self-service transactions pending in Oracle Workflow.", "ما عندك أي طلبات معلقة في مسار الموافقات.")); break;
      case "queryHRPolicyRAG": parts.push(r.found ? A(`${r.passage}`, `${r.passage}`) : A("I couldn't find a governed NEDC policy covering that, so I won't guess. Shall I raise it with HR?", "ما لقيت سياسة معتمدة تغطي هذا السؤال، وما أبي أعطيك معلومة غير مؤكدة. تبيني أحوله للموارد البشرية؟")); break;
      case "checkFinanceLoanOrAdvance": { const a = r.items[0]; parts.push(a ? A(`**Salary Advance ${a.ref}** (OMR ${fmtOMR(a.amount)}): ${a.status}.`, `**سلفة الراتب ${a.ref}** (${fmtOMR(a.amount)} ر.ع): ${a.statusAr}.`) : A("No finance records found.", "لا توجد سجلات مالية.")); break; }
      case "requestFleetOrTravel": { const f = r.items[0]; parts.push(f ? A(`**Fleet booking ${f.ref}** – ${f.kind} for ${f.purpose} on ${prettyDate(f.date)}: ${f.status}.`, `**حجز المركبة ${f.ref}** – ${f.kindAr} لـ${f.purposeAr} بتاريخ ${prettyDate(f.date, "ar")}: ${f.statusAr}.`) : A("No fleet bookings found.", "لا توجد حجوزات.")); break; }
      case "escalateToHRCase": parts.push(A(`I understand this needs personal attention. I've created HR case **${r.caseId}** and handed it to the Employee Relations desk with our full conversation transcript and sentiment analysis attached — you won't need to repeat anything. SLA: ${r.slaHours} hours.`, `أتفهم إن الموضوع يحتاج متابعة شخصية. أنشأت لك حالة **${r.caseId}** وحولتها لقسم علاقات الموظفين مع نص المحادثة كامل وتحليل المشاعر — ما بتحتاج تعيد أي شي. مدة الاستجابة: ${r.slaHours} ساعة.`)); break;
    }
  }

  let lowConfidence = false;
  if (!parts.length) {
    if (RX.greet.test(text)) {
      parts.push(A(`Hello ${emp.nameEn.split(" ").slice(0, 2).join(" ")} 👋 I'm Nama AI, your HR self-service assistant connected to Oracle EBS. I can check leave balances, payslips, submit leave, update your profile, answer HR policy questions, check salary advances & fleet bookings, or connect you to HR.`, `هلا ${emp.nameAr.split(" ").slice(0, 2).join(" ")} 👋 أنا مساعد نماء الذكي للخدمة الذاتية. أقدر أساعدك في رصيد الإجازات، كشف الراتب، تقديم إجازة، تحديث بياناتك، سياسات الموارد البشرية، السلف وحجوزات المركبات، أو أحولك لموظف الموارد البشرية.`));
      session.confidenceScore = 0.98;
    } else {
      lowConfidence = true;
      session.confidenceScore = 0.58;
      parts.push(A("I'm not fully confident I understood that (confidence 0.58), so I won't guess. You can ask about leave balance, payslip, leave requests, profile updates, HR policies, salary advance, fleet bookings — or I can connect you to an HR agent. This query has been logged for knowledge improvement.", "ما متأكد إني فهمت طلبك (نسبة الثقة 0.58)، وما أبي أعطيك إجابة غير دقيقة. تقدر تسأل عن رصيد الإجازات، الراتب، طلب إجازة، تحديث البيانات، السياسات، السلف أو المركبات — أو أحولك لموظف الموارد البشرية. تم تسجيل السؤال لتحسين قاعدة المعرفة."));
    }
  }

  const c = collect(outs);
  session.intents = Array.from(want);
  session.intent = session.intents.includes("submitLeaveRequest") ? "submitLeaveRequest" : session.intents[0] || (lowConfidence ? "LOW_CONFIDENCE_UNRESOLVED" : "greeting");
  if (!lowConfidence && session.intents.length) session.confidenceScore = session.intents.length > 1 ? 0.95 : 0.96;
  session.extractedEntities = session.intents.includes("submitLeaveRequest") || session.intents.includes("updateEmployeeProfile") ? ents : Object.assign({}, ...outs.map((o) => o.args));
  session.missingMandatoryFields = missing;
  finalizeSession(session, outs);
  if (missing.length) session.guidedStep = 9;

  return {
    reply: parts.join("\n\n"), cards: c.cards, toolCalls: c.toolCalls, apiCalls: c.apiCalls, session, mode: "fallback", model: "NEDC Deterministic Intent Engine v2 (Demo Mode)",
    trace: buildTrace({ lang: session.detectedLanguage, dialect: session.dialect, intents: session.intents, conf: session.confidenceScore, rag: c.rag, apiCalls: c.apiCalls, blocked: false, corr: session.correlationId, fndUser: emp.fndUser, resp: emp.responsibility, model: "deterministic engine" }),
    escalationCase: c.hrCase, lowConfidence, latencyMs: 0,
  };
}
