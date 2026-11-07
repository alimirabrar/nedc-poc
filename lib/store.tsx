"use client";
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { ApiCall, ChatMsg, ChatResponse, HRCase, Lang, LedgerItem, Notification, Role, SessionState, SiemLog, ToolTrace, TraceStep, UnresolvedQuery, Card } from "./types";
import { EMPLOYEES, Employee, POLICIES, PolicyDoc, ROLE_PERSONA } from "./ebs";
import { prettyDate } from "./nlp";

export type ModuleId = "ess" | "manager" | "lifecycle" | "analytics" | "learning" | "integrations" | "compliance";

export interface Telemetry {
  runId: number;
  trace: TraceStep[];
  apiCalls: ApiCall[];
  toolCalls: ToolTrace[];
  model: string;
  mode: "groq" | "fallback";
  modeNote?: string;
  latencyMs: number;
  guardrail?: ChatResponse["guardrail"];
}

interface Settings { apiKey: string; forceDemo: boolean; model: string }

const uid = () => Math.random().toString(36).slice(2, 10);
const corr = () => `CORR-NEDC-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${Math.random().toString(16).slice(2, 8).toUpperCase()}`;

function seedLogs(): SiemLog[] {
  const now = Date.now();
  const rows: [number, string, string, string, SiemLog["severity"], string, SiemLog["pdpl"], string][] = [
    [540, "E10388", "getLeaveBalance", "GET /oic/api/v1/ebs/hr/absences/balance", "INFO", "DATA_ACCESS", "MINIMISED", "Self-scope read – 200 OK"],
    [470, "E10512", "queryHRPolicyRAG", "POST /rag/api/v1/policy/search", "INFO", "RAG_QUERY", "N/A", "Citation NEDC-HR-POL-031 v4.0 returned"],
    [400, "E11207", "RBAC_CROSS_EMPLOYEE_REQUEST", "— (blocked at orchestrator)", "HIGH", "PDPL_GUARDRAIL", "MASKED", "Cross-employee salary request refused"],
    [330, "E10388", "submitLeaveRequest", "POST /oic/api/v1/ebs/sshr/submitLeaveRequest", "LOW", "TRANSACTION_CONFIRMED", "MINIMISED", "Explicit confirmation captured → AME"],
    [260, "SYSTEM", "OIC_HEALTHCHECK", "GET /oic/api/v1/health", "INFO", "PLATFORM", "N/A", "OIC adapters healthy (6/6)"],
    [120, "E10944", "getPayslip", "GET /oic/api/v1/ebs/payroll/payslip/latest", "INFO", "DATA_ACCESS", "MINIMISED", "Payslip archive read – 200 OK"],
  ];
  return rows.map(([ago, emp, intent, endpoint, severity, category, pdpl, message]) => ({ id: uid(), ts: now - ago * 1000, correlationId: corr(), employeeId: emp, intent, endpoint, severity, category, pdpl, message }));
}

function seedLedger(): LedgerItem[] {
  return [
    { id: "SSHR-TXN-77310", itemKey: "HRSSA-2026-188214", type: "LEAVE", employeeId: "E10388", employeeName: "Fatma Al-Balushi", employeeNameAr: "فاطمة البلوشية", summary: "Annual Leave · 22 Nov – 26 Nov 2026 (5 WD)", summaryAr: "إجازة سنوية · 22 – 26 نوفمبر 2026 (5 أيام عمل)", details: { leaveType: "Annual Leave", startDate: "2026-11-22", endDate: "2026-11-26", workingDays: 5 }, status: "PENDING_APPROVAL", submittedAt: Date.now() - 3600 * 1000 * 5, approver: "Khalid Al-Hinai (KHALID.HINAI)", correlationId: corr() },
    { id: "SSHR-TXN-77298", itemKey: "HRSSA-2026-188190", type: "PROFILE", employeeId: "E10388", employeeName: "Fatma Al-Balushi", employeeNameAr: "فاطمة البلوشية", summary: "Emergency Address → Al Hambar, Sohar", summaryAr: "عنوان الطوارئ ← الهمبار، صحار", details: { field: "Emergency Address", oldValue: "Falaj Al Qabail, Sohar", newValue: "Al Hambar, Sohar" }, status: "PENDING_APPROVAL", submittedAt: Date.now() - 3600 * 1000 * 26, approver: "Khalid Al-Hinai (KHALID.HINAI)", correlationId: corr() },
  ];
}

function seedCases(): HRCase[] {
  return [{
    id: "NEDC-HR-CASE-8835", employeeId: "E10388", employeeName: "Fatma Al-Balushi", category: "Shift Allowance Dispute", categoryAr: "خلاف بدل المناوبة", summary: "Standby allowance for Sohar control-room night shifts not reflected in October payroll.",
    sentiment: -0.35, sentimentLabel: "Negative", transcript: [
      { role: "user", content: "بدل المناوبة الليلية ما نزل في راتب أكتوبر", ts: Date.now() - 86400000 },
      { role: "assistant", content: "I checked your October payslip archive: standby allowance OMR 95.000 is missing for 4 shifts. Escalating to HR Payroll.", ts: Date.now() - 86400000 },
    ], createdAt: Date.now() - 3600 * 1000 * 20, slaHours: 48, status: "IN_PROGRESS", priority: "P2",
  }];
}

function seedUnresolved(): UnresolvedQuery[] {
  const now = Date.now();
  return [
    { id: uid(), ts: now - 7200e3, text: "هل يحق لي بدل سكن إذا انتقلت لمحطة عبري؟", reason: "Knowledge Gap", confidence: 0.41, status: "NEW" },
    { id: uid(), ts: now - 6100e3, text: "can i swap my standby roster with a colleague", reason: "Low-Confidence Intent", confidence: 0.55, status: "NEW" },
    { id: uid(), ts: now - 5000e3, text: "Show my end-of-service gratuity estimate", reason: "EBS API Timeout", confidence: 0.88, status: "NEW" },
    { id: uid(), ts: now - 3900e3, text: "Show Hamood's leave dates", reason: "RBAC Refusal", confidence: 0.97, status: "NEW" },
    { id: uid(), ts: now - 2500e3, text: "What's the Ramadan working hours policy for field crews?", reason: "Knowledge Gap", confidence: 0.47, status: "NEW" },
  ];
}

interface Store {
  lang: Lang; setLang: (l: Lang) => void; L: (en: string, ar: string) => string;
  role: Role; setRole: (r: Role) => void; persona: Employee;
  module: ModuleId; setModule: (m: ModuleId) => void;
  chats: Record<string, ChatMsg[]>; busy: boolean;
  sendChat: (text: string) => Promise<ChatResponse | null>;
  confirmCard: (msgId: string, idx: number) => void;
  cancelCard: (msgId: string, idx: number) => void;
  session: SessionState | null; telemetry: Telemetry | null;
  logs: SiemLog[]; log: (l: Partial<SiemLog>) => void;
  ledger: LedgerItem[]; decide: (id: string, status: "APPROVED" | "REJECTED", comment?: string) => void;
  cases: HRCase[]; resolveCase: (id: string, text: string) => void;
  notifications: Notification[]; markAllRead: () => void;
  unresolved: UnresolvedQuery[]; setUnresolvedStatus: (id: string, s: UnresolvedQuery["status"]) => void;
  policies: PolicyDoc[]; addPolicy: (p: PolicyDoc) => void;
  settings: Settings; setSettings: (s: Settings) => void; groqServer: boolean;
  enrolled: string[]; enroll: (courseId: string) => void;
  highlight: string | null; jump: (m: ModuleId, anchor?: string) => void;
  settingsOpen: boolean; setSettingsOpen: (b: boolean) => void;
}

const Ctx = createContext<Store | null>(null);
export const useStore = () => {
  const c = useContext(Ctx);
  if (!c) throw new Error("StoreProvider missing");
  return c;
};

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Lang>("en");
  const [role, setRoleRaw] = useState<Role>("employee");
  const [module, setModule] = useState<ModuleId>("ess");
  const [chats, setChats] = useState<Record<string, ChatMsg[]>>({});
  const [busy, setBusy] = useState(false);
  const [session, setSession] = useState<SessionState | null>(null);
  const [telemetry, setTelemetry] = useState<Telemetry | null>(null);
  const [logs, setLogs] = useState<SiemLog[]>([]);
  const [ledger, setLedger] = useState<LedgerItem[]>([]);
  const [cases, setCases] = useState<HRCase[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unresolved, setUnresolved] = useState<UnresolvedQuery[]>([]);
  const [policies, setPolicies] = useState<PolicyDoc[]>(POLICIES);
  const [settings, setSettingsRaw] = useState<Settings>({ apiKey: "", forceDemo: false, model: "llama-3.3-70b-versatile" });
  const [groqServer, setGroqServer] = useState(false);
  const [enrolled, setEnrolled] = useState<string[]>([]);
  const [highlight, setHighlight] = useState<string | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const runRef = useRef(0);
  const sessionsRef = useRef<Record<string, SessionState | null>>({});

  const persona = EMPLOYEES[ROLE_PERSONA[role]];
  const L = useCallback((en: string, ar: string) => (lang === "ar" ? ar : en), [lang]);

  // Seed client-only data after mount (avoids hydration mismatch with Date.now())
  useEffect(() => {
    setLogs(seedLogs()); setLedger(seedLedger()); setCases(seedCases()); setUnresolved(seedUnresolved());
    try {
      const s = localStorage.getItem("nedc.settings");
      if (s) setSettingsRaw({ ...JSON.parse(s) });
      const l = localStorage.getItem("nedc.lang");
      if (l === "ar" || l === "en") setLang(l);
    } catch {}
    fetch("/api/chat").then((r) => r.json()).then((d) => setGroqServer(!!d.groqConfigured)).catch(() => {});
  }, []);

  useEffect(() => {
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = lang === "ar" ? "ar-OM" : "en";
    try { localStorage.setItem("nedc.lang", lang); } catch {}
  }, [lang]);

  const setSettings = (s: Settings) => { setSettingsRaw(s); try { localStorage.setItem("nedc.settings", JSON.stringify(s)); } catch {} };

  const setRole = (r: Role) => {
    sessionsRef.current[persona.id] = session;
    setRoleRaw(r);
    setSession(sessionsRef.current[EMPLOYEES[ROLE_PERSONA[r]].id] || null);
  };

  const log = useCallback((l: Partial<SiemLog>) => {
    setLogs((prev) => [{ id: uid(), ts: Date.now(), correlationId: l.correlationId || corr(), employeeId: l.employeeId || "SYSTEM", intent: l.intent || "-", endpoint: l.endpoint || "-", severity: l.severity || "INFO", category: l.category || "AUDIT", pdpl: l.pdpl || "MINIMISED", message: l.message || "" }, ...prev].slice(0, 400));
  }, []);

  const addMsg = (empId: string, m: ChatMsg) => setChats((p) => ({ ...p, [empId]: [...(p[empId] || []), m] }));

  const notify = (target: string, en: string, ar: string) => setNotifications((p) => [{ id: uid(), targetEmployeeId: target, ts: Date.now(), en, ar, read: false }, ...p]);

  const latest = useRef({ chats, session, ledger, cases, settings, lang, persona });
  latest.current = { chats, session, ledger, cases, settings, lang, persona };

  const sendChat = async (text: string): Promise<ChatResponse | null> => {
    const { chats, session, ledger, cases, settings, lang, persona } = latest.current;
    const empId = persona.id;
    const userMsg: ChatMsg = { id: uid(), role: "user", content: text, ts: Date.now() };
    const history = [...(chats[empId] || []), userMsg].filter((m) => m.role !== "system").map((m) => ({ role: m.role as "user" | "assistant", content: m.content }));
    addMsg(empId, userMsg);
    setBusy(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history, employeeId: empId, lang, session, ledger, caseSeq: cases.filter((c) => c.id.startsWith("NEDC-HR-CASE-88") && +c.id.slice(-4) >= 8841).length, apiKey: settings.apiKey || undefined, forceDemo: settings.forceDemo, model: settings.model }),
      });
      const data = (await res.json()) as ChatResponse;
      if (!res.ok) throw new Error((data as any).detail || "error");
      addMsg(empId, { id: uid(), role: "assistant", content: data.reply, cards: data.cards, ts: Date.now(), mode: data.mode });
      setSession(data.session);
      runRef.current += 1;
      setTelemetry({ runId: runRef.current, trace: data.trace, apiCalls: data.apiCalls, toolCalls: data.toolCalls, model: data.model, mode: data.mode, modeNote: data.modeNote, latencyMs: data.latencyMs, guardrail: data.guardrail });
      // SIEM logging
      if (data.guardrail?.blocked) {
        log({ correlationId: data.session.correlationId, employeeId: empId, intent: data.session.intent, endpoint: "— (blocked at Layer 4 orchestrator)", severity: data.guardrail.severity, category: "PDPL_GUARDRAIL", pdpl: "MASKED", message: `${data.guardrail.reason} · query: "${data.guardrail.masked.slice(0, 90)}"` });
        setUnresolved((p) => [{ id: uid(), ts: Date.now(), text: data.guardrail!.masked, reason: "RBAC Refusal", confidence: 0.99, status: "NEW" }, ...p]);
      } else {
        log({ correlationId: data.session.correlationId, employeeId: empId, intent: data.session.intents.join("+") || data.session.intent, endpoint: "POST /api/chat (AI Orchestrator)", severity: "INFO", category: "CHAT_QUERY", pdpl: "MINIMISED", message: `${data.mode === "groq" ? "Groq LLM" : "Deterministic engine"} · lang ${data.session.detectedLanguage} · conf ${data.session.confidenceScore}` });
        data.apiCalls.forEach((a) => log({ correlationId: data.session.correlationId, employeeId: empId, intent: a.ebsApi.split(" ")[0], endpoint: `${a.method} ${a.endpoint.split("?")[0]}`, severity: "INFO", category: a.writeMode === "AME_ROUTED_NO_DIRECT_DB_WRITE" ? "TXN_VALIDATE" : a.writeMode === "RAG_INDEX" ? "RAG_QUERY" : "DATA_ACCESS", pdpl: "MINIMISED", message: `${a.protocol} · ${a.latencyMs}ms · ${a.writeMode}` }));
      }
      if (data.lowConfidence) setUnresolved((p) => [{ id: uid(), ts: Date.now(), text, reason: "Low-Confidence Intent", confidence: data.session.confidenceScore, status: "NEW" }, ...p]);
      if (data.escalationCase) {
        setCases((p) => [data.escalationCase!, ...p]);
        log({ correlationId: data.session.correlationId, employeeId: empId, intent: "escalateToHRCase", endpoint: "POST /oic/api/v1/hrcase/cases", severity: "LOW", category: "HR_ESCALATION", pdpl: "MINIMISED", message: `${data.escalationCase.id} created with transcript (${data.escalationCase.transcript.length} turns), sentiment ${data.escalationCase.sentiment}` });
        notify("E30007", `New escalated case ${data.escalationCase.id} from ${persona.nameEn}`, `حالة جديدة ${data.escalationCase.id} من ${persona.nameAr}`);
      }
      return data;
    } catch (e: any) {
      addMsg(empId, { id: uid(), role: "assistant", content: L("⚠️ The orchestrator is temporarily unreachable (simulated EBS timeout). Your request was not processed and has been logged.", "⚠️ تعذر الوصول إلى المنسق مؤقتاً. لم تتم معالجة طلبك وتم تسجيله."), ts: Date.now() });
      setUnresolved((p) => [{ id: uid(), ts: Date.now(), text, reason: "EBS API Timeout", confidence: 0, status: "NEW" }, ...p]);
      return null;
    } finally {
      setBusy(false);
    }
  };

  const patchCard = (empId: string, msgId: string, idx: number, patch: Partial<Card>) =>
    setChats((p) => ({ ...p, [empId]: (p[empId] || []).map((m) => (m.id === msgId && m.cards ? { ...m, cards: m.cards.map((c, i) => (i === idx ? ({ ...c, ...patch } as Card) : c)) } : m)) }));

  const confirmCard = (msgId: string, idx: number) => {
    const empId = persona.id;
    const msg = (chats[empId] || []).find((m) => m.id === msgId);
    const card = msg?.cards?.[idx];
    if (!card || (card.type !== "leaveConfirm" && card.type !== "profileConfirm") || card.state !== "pending") return;
    const txn = `SSHR-TXN-${77400 + ledger.length + Math.floor(Math.random() * 50)}`;
    const itemKey = `HRSSA-2026-${188300 + ledger.length * 7}`;
    const c = session?.correlationId || corr();
    const mgr = persona.managerId ? EMPLOYEES[persona.managerId] : EMPLOYEES.E30007;
    let item: LedgerItem;
    if (card.type === "leaveConfirm") {
      const d = card.data;
      item = { id: txn, itemKey, type: "LEAVE", employeeId: empId, employeeName: persona.nameEn, employeeNameAr: persona.nameAr, summary: `${d.leaveType} · ${prettyDate(d.startDate)} – ${prettyDate(d.endDate)} (${d.workingDays} WD)`, summaryAr: `${d.leaveTypeAr} · ${prettyDate(d.startDate, "ar")} – ${prettyDate(d.endDate, "ar")} (${d.workingDays} أيام عمل)`, details: d, status: "PENDING_APPROVAL", submittedAt: Date.now(), approver: `${mgr.nameEn} (${mgr.fndUser})`, correlationId: c };
    } else {
      const d = card.data;
      item = { id: txn, itemKey, type: "PROFILE", employeeId: empId, employeeName: persona.nameEn, employeeNameAr: persona.nameAr, summary: `${d.fieldLabel} → ${d.newValue}`, summaryAr: `${d.fieldLabelAr} ← ${d.newValue}`, details: { field: d.fieldLabel, oldValue: d.oldValue, newValue: d.newValue }, status: "PENDING_APPROVAL", submittedAt: Date.now(), approver: `${mgr.nameEn} (${mgr.fndUser})`, correlationId: c };
    }
    setLedger((p) => [item, ...p]);
    patchCard(empId, msgId, idx, { state: "confirmed", txnId: txn } as any);
    setSession((s) => (s ? { ...s, explicitConfirmationState: "CONFIRMED", ebsValidationResult: "COMMITTED TO SSHR TRANSACTION → AME", guidedStep: 28, intents: [] } : s));
    const commit: ApiCall = {
      method: "POST", protocol: "REST (OIC) → ISG → SSHR", endpoint: card.type === "leaveConfirm" ? "/oic/api/v1/ebs/sshr/submitLeaveRequest" : "/oic/api/v1/ebs/sshr/updatePersonalDetails",
      fndUser: persona.fndUser, responsibility: persona.responsibility,
      ebsApi: card.type === "leaveConfirm" ? "HR_PERSON_ABSENCE_API via SSHR HR_API_TRANSACTIONS → AME_API2" : "HR_PHONE_API via SSHR HR_API_TRANSACTIONS → AME_API2",
      request: { headers: { "X-Correlation-ID": c, "X-Explicit-Confirmation": "true", "X-Confirmed-At": new Date().toISOString() }, body: { transactionMode: "SUBMIT_FOR_APPROVAL", ameTransactionType: card.type === "leaveConfirm" ? "NEDC_SSHR_LEAVE" : "NEDC_SSHR_PERSONAL_INFO", userConfirmation: "EXPLICIT_BUTTON_CLICK" } },
      response: { status: 202, transactionId: txn, wfItemType: "HRSSA", wfItemKey: itemKey, nextApprover: mgr.fndUser, directDbWrite: false },
      latencyMs: 640 + Math.round(Math.random() * 300), writeMode: "AME_ROUTED_NO_DIRECT_DB_WRITE",
    };
    runRef.current += 1;
    setTelemetry({ runId: runRef.current, model: telemetry?.model || "-", mode: telemetry?.mode || "fallback", latencyMs: commit.latencyMs, toolCalls: [{ name: card.type === "leaveConfirm" ? "submitLeaveRequest.commit" : "updateEmployeeProfile.commit", args: { txn }, ok: true }], apiCalls: [commit], trace: [
      { layer: 1, status: "active", detail: "Explicit Confirm button click captured" }, { layer: 2, status: "active", detail: `Step-up token re-validated · ${persona.fndUser}` },
      { layer: 3, status: "skipped", detail: "No NLP needed (structured confirmation)" }, { layer: 4, status: "active", detail: "State machine: AWAITING_USER_CONFIRMATION → CONFIRMED" },
      { layer: 5, status: "skipped", detail: "—" }, { layer: 6, status: "active", detail: "mTLS · idempotency-key " + txn },
      { layer: 7, status: "active", detail: `POST ${commit.endpoint}` }, { layer: 8, status: "active", detail: `${commit.ebsApi} · Zero direct DB write` },
      { layer: 9, status: "active", detail: `TRANSACTION_CONFIRMED audit · ${c}` },
    ] });
    log({ correlationId: c, employeeId: empId, intent: card.type === "leaveConfirm" ? "submitLeaveRequest.CONFIRMED" : "updateEmployeeProfile.CONFIRMED", endpoint: `POST ${commit.endpoint}`, severity: "LOW", category: "TRANSACTION_CONFIRMED", pdpl: "MINIMISED", message: `Explicit user confirmation → ${txn} / WF ${itemKey} routed to ${mgr.fndUser} via AME (no direct DB write)` });
    notify(mgr.id, `New approval request ${txn} from ${persona.nameEn}`, `طلب موافقة جديد ${txn} من ${persona.nameAr}`);
    addMsg(empId, { id: uid(), role: "assistant", ts: Date.now(), content: L(`✅ Submitted to Oracle EBS SSHR. Transaction **${txn}** (Workflow item ${itemKey}) has been routed via Oracle AME to **${mgr.nameEn}** for approval. You'll be notified here as soon as it's decided.`, `✅ تم الإرسال إلى Oracle EBS. رقم المعاملة **${txn}** (مسار ${itemKey}) وتم تحويلها عبر Oracle AME إلى **${mgr.nameAr}** للموافقة. بيوصلك إشعار هنا أول ما يتم اتخاذ القرار.`) });
  };

  const cancelCard = (msgId: string, idx: number) => {
    const empId = persona.id;
    patchCard(empId, msgId, idx, { state: "cancelled" } as any);
    setSession((s) => (s ? { ...s, explicitConfirmationState: "CANCELLED", guidedStep: 22 } : s));
    log({ correlationId: session?.correlationId, employeeId: empId, intent: "confirmation.MODIFY", endpoint: "— (no EBS call)", severity: "INFO", category: "TRANSACTION_CANCELLED", pdpl: "N/A", message: "User chose Modify – draft discarded, nothing written" });
    addMsg(empId, { id: uid(), role: "assistant", ts: Date.now(), content: L("No problem — nothing was submitted. Tell me what to change (e.g. \"Change end date to 15 November\").", "ولا يهمك — ما تم إرسال أي شي. قول لي وش تبي تعدل (مثلاً \"غير تاريخ النهاية إلى 15 نوفمبر\").") });
  };

  const decide = (id: string, status: "APPROVED" | "REJECTED", comment?: string) => {
    const item = ledger.find((l) => l.id === id);
    if (!item) return;
    setLedger((p) => p.map((l) => (l.id === id ? { ...l, status, decidedAt: Date.now() } : l)));
    const ok = status === "APPROVED";
    const en = `${ok ? "✅ Approved" : "❌ Rejected"}: your request ${item.id} (${item.summary}) was ${ok ? "approved" : "rejected"} by ${persona.nameEn} in Oracle Workflow.${comment ? ` Comment: "${comment}"` : ""}`;
    const ar = `${ok ? "✅ تمت الموافقة" : "❌ تم الرفض"}: طلبك ${item.id} (${item.summaryAr}) ${ok ? "تمت الموافقة عليه" : "تم رفضه"} من قبل ${persona.nameAr} في Oracle Workflow.${comment ? ` ملاحظة: "${comment}"` : ""}`;
    notify(item.employeeId, en, ar);
    addMsg(item.employeeId, { id: uid(), role: "system", ts: Date.now(), content: lang === "ar" ? `🔔 ${ar}` : `🔔 ${en}` });
    log({ correlationId: item.correlationId, employeeId: persona.id, intent: `AME.${status}`, endpoint: "POST /oic/api/v1/ebs/wf/notifications/respond", severity: "LOW", category: "WORKFLOW_DECISION", pdpl: "MINIMISED", message: `WF_NOTIFICATION.RESPOND ${item.itemKey} → ${status}; bilingual notification sent to ${item.employeeId}` });
  };

  const resolveCase = (id: string, text: string) => {
    const c = cases.find((x) => x.id === id);
    if (!c) return;
    setCases((p) => p.map((x) => (x.id === id ? { ...x, status: "RESOLVED", resolution: text } : x)));
    notify(c.employeeId, `HR resolution for ${id}: ${text}`, `رد الموارد البشرية على ${id}: ${text}`);
    addMsg(c.employeeId, { id: uid(), role: "system", ts: Date.now(), content: `🔔 ${L(`HR Resolution for ${id} from ${persona.nameEn}`, `رد الموارد البشرية على ${id} من ${persona.nameAr}`)}: ${text}` });
    log({ employeeId: persona.id, intent: "HRCase.RESOLVE", endpoint: "PATCH /oic/api/v1/hrcase/cases/" + id, severity: "INFO", category: "HR_ESCALATION", pdpl: "MINIMISED", message: `${id} resolved & employee notified` });
  };

  const markAllRead = () => setNotifications((p) => p.map((n) => (n.targetEmployeeId === persona.id ? { ...n, read: true } : n)));
  const setUnresolvedStatus = (id: string, s: UnresolvedQuery["status"]) => {
    setUnresolved((p) => p.map((u) => (u.id === id ? { ...u, status: s } : u)));
    log({ employeeId: persona.id, intent: "KB." + s, endpoint: "POST /rag/api/v1/intents/promote", severity: "INFO", category: "KNOWLEDGE_LOOP", pdpl: "N/A", message: `Unresolved query ${id} → ${s}` });
  };
  const addPolicy = (p: PolicyDoc) => {
    setPolicies((prev) => [p, ...prev.filter((x) => x.id !== p.id)]);
    log({ employeeId: persona.id, intent: "KB.REINDEX", endpoint: "POST /rag/api/v1/documents", severity: "INFO", category: "KNOWLEDGE_GOVERNANCE", pdpl: "N/A", message: `${p.id} ${p.version} indexed (${p.chunks} chunks) – owner ${p.owner}` });
  };
  const enroll = (cid: string) => {
    setEnrolled((p) => (p.includes(cid) ? p : [...p, cid]));
    log({ employeeId: persona.id, intent: "OLM.ENROL", endpoint: "POST /oic/api/v1/ebs/olm/enrollments", severity: "INFO", category: "LEARNING", pdpl: "MINIMISED", message: `OTA_DELEGATE_BOOKING_API.CREATE_DELEGATE_BOOKING ${cid}` });
  };
  const jump = (m: ModuleId, anchor?: string) => {
    setModule(m);
    setHighlight(anchor || null);
    if (anchor) setTimeout(() => { document.getElementById(anchor)?.scrollIntoView({ behavior: "smooth", block: "center" }); }, 250);
    setTimeout(() => setHighlight(null), 3500);
  };

  const value: Store = useMemo(() => ({
    lang, setLang, L, role, setRole, persona, module, setModule, chats, busy, sendChat, confirmCard, cancelCard, session, telemetry, logs, log, ledger, decide, cases, resolveCase,
    notifications, markAllRead, unresolved, setUnresolvedStatus, policies, addPolicy, settings, setSettings, groqServer, enrolled, enroll, highlight, jump, settingsOpen, setSettingsOpen,
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [lang, L, role, persona, module, chats, busy, session, telemetry, logs, ledger, cases, notifications, unresolved, policies, settings, groqServer, enrolled, highlight, settingsOpen]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
