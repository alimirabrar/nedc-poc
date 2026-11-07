// RFP Section 8.4 Business Services exposed as deterministic tools to the AI Orchestrator.
import { ApiCall, Card, HRCase, LedgerItem, LeaveDraft, ProfileDraft } from "./types";
import {
  BENEFITS, EMPLOYEES, Employee, EXISTING_ABSENCES, FINANCE, FLEET, LEAVE_TYPES, leaveBalanceFor, payslipFor, POLICIES, searchPolicy,
} from "./ebs";
import { daysBetween, EMAIL_RE, formatOmanMobile, OMAN_MOBILE_RE, overlaps, prettyDate, sentiment, sentimentLabel, workingDays } from "./nlp";

export const TOOL_SCHEMAS = [
  fn("getLeaveBalance", "Get the authenticated employee's current leave balances from Oracle EBS HRMS (accrual plans).", {}),
  fn("getLeaveHistory", "Get the authenticated employee's leave/absence history from Oracle EBS.", {}),
  fn("submitLeaveRequest", "Validate and PREPARE a leave request draft for Oracle EBS SSHR/AME. This NEVER submits; it returns a draft that the employee must explicitly confirm via the UI confirmation card. Only call once leaveType, startDate and endDate are all known.", {
    leaveType: { type: "string", enum: ["annual", "sick", "emergency", "study", "hajj", "compassionate"], description: "Leave type key" },
    startDate: { type: "string", description: "ISO date YYYY-MM-DD" },
    endDate: { type: "string", description: "ISO date YYYY-MM-DD" },
    reason: { type: "string", description: "Optional reason" },
  }, ["leaveType", "startDate", "endDate"]),
  fn("getEmployeeProfile", "Get the authenticated employee's profile, grade, job and assignment from Oracle EBS HRMS.", {}),
  fn("updateEmployeeProfile", "Validate and PREPARE a personal-detail change (mobile, email, emergency address, emergency contact). Returns a draft requiring explicit UI confirmation; routes to Oracle AME on confirm.", {
    field: { type: "string", enum: ["mobile", "email", "emergencyAddress", "emergencyContact"] },
    newValue: { type: "string" },
  }, ["field", "newValue"]),
  fn("getPayslip", "Get the authenticated employee's latest payslip (OMR) from the Oracle Payroll payslip archive.", {}),
  fn("getEmployeeBenefits", "Get the authenticated employee's benefits enrolments.", {}),
  fn("getApprovalStatus", "Get the status of the employee's submitted self-service transactions in Oracle Workflow/AME.", {}),
  fn("queryHRPolicyRAG", "Search governed NEDC HR policy knowledge base (in-country vector index). Returns grounded passages with document ID, version and effective date which MUST be cited.", {
    query: { type: "string" },
  }, ["query"]),
  fn("checkFinanceLoanOrAdvance", "Check the employee's salary advance / employee loan status in the NEDC Financial System.", {}),
  fn("requestFleetOrTravel", "Check status of (or request) business travel and 4x4 fleet vehicle bookings in the NEDC Travel & Fleet system.", {
    action: { type: "string", enum: ["status", "request"] },
    destination: { type: "string" },
  }),
  fn("escalateToHRCase", "Escalate a complex/sensitive matter (grievance, medical board, disputes) to a human HR agent with full conversation context.", {
    category: { type: "string", description: "e.g. Grievance, Medical Board, Payroll Dispute" },
    summary: { type: "string" },
  }, ["category", "summary"]),
];

function fn(name: string, description: string, properties: Record<string, any>, required: string[] = []) {
  return { type: "function", function: { name, description, parameters: { type: "object", properties, required } } };
}

export interface ToolCtx {
  emp: Employee;
  lang: "en" | "ar";
  ledger: LedgerItem[];
  caseSeq: number;
  transcript: { role: string; content: string }[];
  correlationId: string;
}

export interface ToolOutput {
  result: any;
  card?: Card;
  apiCall: ApiCall;
  ragLayer?: boolean;
  case?: HRCase;
}

const lat = (a: number, b: number) => Math.round(a + Math.random() * (b - a));

function api(ctx: ToolCtx, p: Partial<ApiCall> & { endpoint: string; ebsApi: string; method: string }): ApiCall {
  return {
    protocol: "REST (OIC) → ISG",
    fndUser: ctx.emp.fndUser,
    responsibility: ctx.emp.responsibility,
    request: {},
    response: {},
    latencyMs: lat(180, 620),
    writeMode: "READ_ONLY",
    ...p,
  };
}

export function executeTool(name: string, args: any, ctx: ToolCtx): ToolOutput {
  const e = ctx.emp;
  const headers = { Authorization: "Bearer eyJ…(OIDC, MFA=true)", "X-Correlation-ID": ctx.correlationId, "X-FND-User": e.fndUser, "X-Data-Residency": "OM-MCT-1" };
  switch (name) {
    case "getLeaveBalance": {
      const approvedExtra = ctx.ledger.filter((l) => l.type === "LEAVE" && l.employeeId === e.id && l.status === "APPROVED" && l.details?.leaveType === "Annual Leave").reduce((a, l) => a + (l.details?.workingDays || 0), 0);
      const pending = ctx.ledger.filter((l) => l.type === "LEAVE" && l.employeeId === e.id && l.status === "PENDING_APPROVAL").reduce((a, l) => a + (l.details?.workingDays || 0), 0);
      const bal = leaveBalanceFor(e.id, approvedExtra);
      const result = { employeeId: e.id, asOf: new Date().toISOString().slice(0, 10), balances: bal, pendingDaysInWorkflow: pending, accrualPlan: "NEDC Annual Accrual Plan (30 WD)" };
      return {
        result, card: { type: "leaveBalance", data: result },
        apiCall: api(ctx, { method: "GET", endpoint: `/oic/api/v1/ebs/hr/absences/balance?personId=${e.personId}`, ebsApi: "PER_ACCRUAL_CALC_FUNCTIONS.GET_NET_ACCRUAL", request: { headers, query: { personId: e.personId, calculationDate: result.asOf } }, response: { status: 200, items: bal.map((b) => ({ planCode: b.code, netAccrual: b.balance })) } }),
      };
    }
    case "getLeaveHistory": {
      const hist = EXISTING_ABSENCES.filter((a) => a.employeeId === e.id || e.id !== "E10231").slice(0, 5);
      const result = { employeeId: e.id, items: hist };
      return { result, card: { type: "leaveHistory", data: result }, apiCall: api(ctx, { method: "GET", endpoint: `/oic/api/v1/ebs/hr/absences/history?personId=${e.personId}&year=2026`, ebsApi: "PER_ABSENCE_ATTENDANCES (ISG read service)", request: { headers }, response: { status: 200, count: hist.length } }) };
    }
    case "submitLeaveRequest": {
      const key = String(args.leaveType || "annual").toLowerCase();
      const lt = LEAVE_TYPES[key] || LEAVE_TYPES.annual;
      const start = args.startDate, end = args.endDate;
      const issues: { rule: string; ok: boolean; note: string }[] = [];
      const validDates = /^\d{4}-\d{2}-\d{2}$/.test(start) && /^\d{4}-\d{2}-\d{2}$/.test(end) && end >= start;
      issues.push({ rule: "Date format & sequence", ok: validDates, note: validDates ? `${prettyDate(start)} → ${prettyDate(end)}` : "End date must be on/after start date" });
      const today = new Date().toISOString().slice(0, 10);
      const future = validDates && start >= today;
      issues.push({ rule: "Not in the past (non-retroactive type)", ok: future || key === "sick" || key === "emergency", note: future ? "OK" : "Start date is in the past" });
      const wd = validDates ? workingDays(start, end) : 0;
      const cd = validDates ? daysBetween(start, end) : 0;
      const bal = leaveBalanceFor(e.id).find((b) => b.key === key);
      const balance = bal ? bal.balance : lt.entitlement;
      const enough = wd <= balance;
      issues.push({ rule: "EBS accrual balance check", ok: enough, note: `${wd} working day(s) requested vs ${balance} available` });
      const clash = validDates ? EXISTING_ABSENCES.filter((a) => a.employeeId === e.id && overlaps(start, end, a.start, a.end)) : [];
      const ledgerClash = validDates ? ctx.ledger.filter((l) => l.type === "LEAVE" && l.employeeId === e.id && l.status !== "REJECTED" && overlaps(start, end, l.details.startDate, l.details.endDate)) : [];
      const overlapOk = clash.length === 0 && ledgerClash.length === 0;
      issues.push({ rule: "Overlap rule (existing absences / OLM training)", ok: overlapOk, note: overlapOk ? "No conflicts" : [...clash.map((c) => `${c.ref} ${c.status} ${prettyDate(c.start)}–${prettyDate(c.end)}`), ...ledgerClash.map((l) => `${l.id} ${l.status}`)].join("; ") });
      issues.push({ rule: "Advance notice ≥ 7 days (POL-031 §5.1)", ok: true, note: key === "annual" && validDates && daysBetween(today, start) - 1 < 7 ? "Short notice – flagged to approver (non-blocking)" : "OK" });
      const mgr = e.managerId ? EMPLOYEES[e.managerId] : null;
      const allOk = issues.filter((i) => i.rule !== "Advance notice ≥ 7 days (POL-031 §5.1)").every((i) => i.ok);
      const ap = api(ctx, {
        method: "POST", protocol: "REST (OIC) → ISG → SSHR", endpoint: "/oic/api/v1/ebs/sshr/submitLeaveRequest", ebsApi: "HR_PERSON_ABSENCE_API.CREATE_PERSON_ABSENCE (p_validate=TRUE)",
        writeMode: "AME_ROUTED_NO_DIRECT_DB_WRITE",
        request: { headers, body: { personId: e.personId, absenceAttendanceTypeCode: lt.code, dateStart: start, dateEnd: end, p_validate: true, transactionMode: "VALIDATE_ONLY_AWAIT_CONFIRMATION" } },
        response: allOk ? { status: 200, validation: "PASSED", sshrTransactionStatus: "DRAFT", ameTransactionType: "NEDC_SSHR_LEAVE", nextApprover: mgr?.fndUser } : { status: 422, validation: "FAILED", errors: issues.filter((i) => !i.ok).map((i) => i.rule) },
      });
      if (!allOk) {
        const conflict = clash[0];
        const suggestion = conflict ? new Date(new Date(conflict.start + "T00:00:00Z").getTime() - 86400000).toISOString().slice(0, 10) : null;
        const result = { status: "VALIDATION_FAILED", issues, suggestedEndDate: suggestion, leaveType: lt.en, startDate: start, endDate: end };
        return { result, card: { type: "validationError", data: result }, apiCall: ap };
      }
      const draft: LeaveDraft = {
        employeeId: e.id, leaveType: lt.en, leaveTypeAr: lt.ar, startDate: start, endDate: end, calendarDays: cd, workingDays: wd,
        balanceBefore: balance, balanceAfter: +(balance - wd).toFixed(1), approver: mgr ? `${mgr.nameEn} (${mgr.fndUser})` : "HR Director",
        ameRule: "NEDC_SSHR_LEAVE › Supervisor-level 1 › HR Notify", validation: issues,
      };
      return { result: { status: "PENDING_EXPLICIT_CONFIRMATION", note: "Draft prepared. Ask the employee to press Confirm on the card. Nothing has been written to Oracle EBS.", draft }, card: { type: "leaveConfirm", data: draft, state: "pending" }, apiCall: ap };
    }
    case "getEmployeeProfile": {
      const mgr = e.managerId ? EMPLOYEES[e.managerId] : null;
      const result = { employeeNumber: e.id, personId: e.personId, nameEn: e.nameEn, nameAr: e.nameAr, job: e.titleEn, jobAr: e.titleAr, grade: e.grade, organization: e.department, organizationAr: e.departmentAr, location: e.location, locationAr: e.locationAr, supervisor: mgr?.nameEn || "-", hireDate: e.hireDate, assignmentStatus: "Active Assignment", mobile: e.mobile, email: e.email, emergencyAddress: e.emergencyAddress };
      return { result, card: { type: "profile", data: result }, apiCall: api(ctx, { method: "GET", endpoint: `/oic/api/v1/ebs/hr/employees/${e.personId}?expand=assignment,grade`, ebsApi: "PER_ALL_PEOPLE_F / PER_ALL_ASSIGNMENTS_F (ISG REST read)", request: { headers }, response: { status: 200, assignmentNumber: `${e.id}-1`, grade: e.grade } }) };
    }
    case "updateEmployeeProfile": {
      const field = (args.field || "mobile") as ProfileDraft["field"];
      const labels: Record<string, [string, string]> = { mobile: ["Mobile Number", "رقم الهاتف المحمول"], email: ["Personal Email", "البريد الإلكتروني"], emergencyAddress: ["Emergency Address", "عنوان الطوارئ"], emergencyContact: ["Emergency Contact", "جهة اتصال الطوارئ"] };
      let nv = String(args.newValue || "").trim();
      let valid = true, regex = ".{5,120}";
      if (field === "mobile") { regex = OMAN_MOBILE_RE.source; valid = OMAN_MOBILE_RE.test(nv.replace(/[\s-]/g, "")); if (valid) nv = formatOmanMobile(nv); }
      else if (field === "email") { regex = EMAIL_RE.source; valid = EMAIL_RE.test(nv); }
      else valid = nv.length >= 5;
      const old = field === "mobile" ? e.mobile : field === "email" ? e.email : field === "emergencyAddress" ? e.emergencyAddress : e.emergencyContact;
      const mgr = e.managerId ? EMPLOYEES[e.managerId] : null;
      const draft: ProfileDraft = { employeeId: e.id, field, fieldLabel: labels[field][0], fieldLabelAr: labels[field][1], oldValue: old, newValue: nv, regex, valid, approver: mgr ? `${mgr.nameEn} → HR Notify` : "HR" };
      const ap = api(ctx, { method: "POST", protocol: "REST (OIC) → ISG → SSHR", endpoint: "/oic/api/v1/ebs/sshr/updatePersonalDetails", ebsApi: field === "mobile" ? "HR_PHONE_API.CREATE_OR_UPDATE_PHONE (p_validate=TRUE)" : "HR_PERSON_ADDRESS_API.UPDATE_PERSON_ADDRESS (p_validate=TRUE)", writeMode: "AME_ROUTED_NO_DIRECT_DB_WRITE", request: { headers, body: { personId: e.personId, field, newValue: nv, p_validate: true } }, response: valid ? { status: 200, validation: "PASSED", sshrTransactionStatus: "DRAFT", ameTransactionType: "NEDC_SSHR_PERSONAL_INFO" } : { status: 422, validation: "FAILED", error: `Value does not match ${regex}` } });
      if (!valid) {
        const result = { status: "VALIDATION_FAILED", field, value: nv, expectedFormat: field === "mobile" ? "+968 9XXX XXXX or 7XXX XXXX (8 digits, Omani mobile)" : regex };
        return { result, card: { type: "validationError", data: { ...result, issues: [{ rule: `Format validation (${labels[field][0]})`, ok: false, note: result.expectedFormat }] } }, apiCall: ap };
      }
      return { result: { status: "PENDING_EXPLICIT_CONFIRMATION", draft, note: "Ask the employee to confirm on the card." }, card: { type: "profileConfirm", data: draft, state: "pending" }, apiCall: ap };
    }
    case "getPayslip": {
      const p = payslipFor(e.id);
      return { result: p, card: { type: "payslip", data: { ...p, employee: e.nameEn, employeeAr: e.nameAr, grade: e.grade } }, apiCall: api(ctx, { method: "GET", protocol: "SOAP (ISG) via OIC", endpoint: `/oic/api/v1/ebs/payroll/payslip/latest?personId=${e.personId}`, ebsApi: "PAY_ACTION_INFORMATION (Payslip Archive, action_context_type='AAP')", request: { headers }, response: { status: 200, period: p.period, netPay: p.net, currency: "OMR", pdpl: "Field-level encryption in transit (TLS 1.3)" } }) };
    }
    case "getEmployeeBenefits": {
      const result = { employeeId: e.id, plans: BENEFITS };
      return { result, card: { type: "benefits", data: result }, apiCall: api(ctx, { method: "GET", endpoint: `/oic/api/v1/ebs/ben/enrollments?personId=${e.personId}`, ebsApi: "BEN_PRTT_ENRT_RSLT_F (Advanced Benefits read)", request: { headers }, response: { status: 200, count: BENEFITS.length } }) };
    }
    case "getApprovalStatus": {
      const items = ctx.ledger.filter((l) => l.employeeId === e.id).map((l) => ({ id: l.id, itemKey: l.itemKey, summary: l.summary, summaryAr: l.summaryAr, status: l.status, approver: l.approver, submittedAt: l.submittedAt }));
      const result = { employeeId: e.id, items, note: items.length ? undefined : "No self-service transactions in Oracle Workflow for this session." };
      return { result, card: { type: "approvalStatus", data: result }, apiCall: api(ctx, { method: "GET", endpoint: `/oic/api/v1/ebs/wf/approvals?itemType=HRSSA&personId=${e.personId}`, ebsApi: "AME_API2.GETPENDINGAPPROVERS / WF_NOTIFICATIONS", request: { headers }, response: { status: 200, count: items.length } }) };
    }
    case "queryHRPolicyRAG": {
      const q = String(args.query || "");
      const hits = searchPolicy(q);
      const top = hits[0];
      const result = top ? {
        found: true, docId: top.doc.id, title: top.doc.titleEn, titleAr: top.doc.titleAr, version: top.doc.version, effective: top.doc.effective, owner: top.doc.owner, ownerAr: top.doc.ownerAr, clause: top.doc.clause, classification: top.doc.classification,
        confidence: +(top.confidence * 100).toFixed(1), passage: ctx.lang === "ar" ? top.doc.answerAr : top.doc.answerEn, passageEn: top.doc.answerEn, passageAr: top.doc.answerAr,
        alsoRelevant: hits.slice(1, 3).map((h) => ({ docId: h.doc.id, title: h.doc.titleEn, version: h.doc.version })),
      } : { found: false, note: "No governed policy passage found. Do not guess; offer HR escalation." };
      return { result, ragLayer: true, card: top ? { type: "citation", data: result } : undefined, apiCall: api(ctx, { method: "POST", protocol: "REST (In-Country RAG Service)", endpoint: "/rag/api/v1/policy/search", ebsApi: "N/A – Governed Vector Index (OM-MCT-1, AES-256)", writeMode: "RAG_INDEX", request: { headers, body: { query: q, topK: 3, filters: { classification: ["Public", "Internal"], status: "EFFECTIVE" } } }, response: { status: 200, hits: hits.slice(0, 3).map((h) => ({ docId: h.doc.id, score: +h.confidence.toFixed(3) })) } }) };
    }
    case "checkFinanceLoanOrAdvance": {
      const items = (FINANCE as any)[e.id] || [];
      const result = { employeeId: e.id, items, system: "NEDC Financial System (Oracle EBS Financials – AP/Loans)" };
      return { result, card: { type: "finance", data: result }, apiCall: api(ctx, { method: "GET", protocol: "REST (OIC Finance Adapter)", endpoint: `/oic/api/v1/finance/employee-advances?employeeNumber=${e.id}`, ebsApi: "NEDC Finance Adapter – AP_INVOICES / Loan Ledger (read)", writeMode: "EXTERNAL_ADAPTER", request: { headers }, response: { status: 200, count: items.length } }) };
    }
    case "requestFleetOrTravel": {
      const items = (FLEET as any)[e.id] || [];
      const result = { employeeId: e.id, action: args.action || "status", items, system: "NEDC Travel & Fleet Management System" };
      return { result, card: { type: "fleet", data: result }, apiCall: api(ctx, { method: args.action === "request" ? "POST" : "GET", protocol: "REST (OIC Fleet Adapter)", endpoint: `/oic/api/v1/fleet/bookings?employeeNumber=${e.id}`, ebsApi: "NEDC Fleet Dispatch API (external system)", writeMode: "EXTERNAL_ADAPTER", request: { headers, body: args }, response: { status: 200, count: items.length } }) };
    }
    case "escalateToHRCase": {
      const all = ctx.transcript.map((t) => t.content).join(" ");
      const s = sentiment(all);
      const id = `NEDC-HR-CASE-${8841 + ctx.caseSeq}`;
      const cat = String(args.category || "General HR Matter");
      const hc: HRCase = {
        id, employeeId: e.id, employeeName: e.nameEn, category: cat, categoryAr: /medical/i.test(cat) ? "اللجنة الطبية" : /griev|complain/i.test(cat) ? "تظلم" : "مسألة موارد بشرية",
        summary: String(args.summary || "Escalated by AI assistant"), sentiment: s, sentimentLabel: sentimentLabel(s),
        transcript: ctx.transcript.map((t) => ({ role: t.role, content: t.content, ts: Date.now() })), createdAt: Date.now(), slaHours: /medical/i.test(cat) ? 24 : 48, status: "OPEN", priority: s < -0.4 ? "P1" : "P2",
      };
      return { result: { caseId: id, assignedQueue: "HR Service Desk – Employee Relations", slaHours: hc.slaHours, sentiment: s, transcriptAttached: true }, case: hc, card: { type: "escalation", data: hc }, apiCall: api(ctx, { method: "POST", protocol: "REST (OIC → HR Case Mgmt)", endpoint: "/oic/api/v1/hrcase/cases", ebsApi: "NEDC HR Service Console (case object) – context handover", writeMode: "EXTERNAL_ADAPTER", request: { headers, body: { category: cat, transcriptTurns: ctx.transcript.length, sentiment: s, language: ctx.lang } }, response: { status: 201, caseId: id, queue: "Employee Relations", slaHours: hc.slaHours } }) };
    }
    default:
      return { result: { error: "Unknown tool" }, apiCall: api(ctx, { method: "GET", endpoint: "/unknown", ebsApi: "-" }) };
  }
}

export { POLICIES };
