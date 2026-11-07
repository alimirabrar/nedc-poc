// Shared domain types for the NEDC AI Self-Service overlay
export type Lang = "en" | "ar";
export type Role = "employee" | "manager" | "hr" | "executive";

export type CardState = "pending" | "confirmed" | "cancelled";

export interface LeaveDraft {
  employeeId: string;
  leaveType: string;
  leaveTypeAr: string;
  startDate: string; // ISO yyyy-mm-dd
  endDate: string;
  calendarDays: number;
  workingDays: number;
  balanceBefore: number;
  balanceAfter: number;
  approver: string;
  ameRule: string;
  validation: { rule: string; ok: boolean; note: string }[];
}

export interface ProfileDraft {
  employeeId: string;
  field: "mobile" | "emergencyAddress" | "email" | "emergencyContact";
  fieldLabel: string;
  fieldLabelAr: string;
  oldValue: string;
  newValue: string;
  regex: string;
  valid: boolean;
  approver: string;
}

export type Card =
  | { type: "leaveBalance"; data: any }
  | { type: "leaveHistory"; data: any }
  | { type: "payslip"; data: any }
  | { type: "profile"; data: any }
  | { type: "benefits"; data: any }
  | { type: "citation"; data: any }
  | { type: "leaveConfirm"; data: LeaveDraft; state: CardState; txnId?: string }
  | { type: "profileConfirm"; data: ProfileDraft; state: CardState; txnId?: string }
  | { type: "validationError"; data: any }
  | { type: "refusal"; data: any }
  | { type: "escalation"; data: any }
  | { type: "finance"; data: any }
  | { type: "fleet"; data: any }
  | { type: "approvalStatus"; data: any };

export interface ChatMsg {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  cards?: Card[];
  ts: number;
  mode?: "groq" | "fallback";
  lang?: Lang;
}

export interface SessionState {
  sessionId: string;
  authenticatedEmployeeId: string;
  fndUser: string;
  responsibility: string;
  detectedLanguage: string;
  dialect: string;
  intent: string;
  intents: string[];
  confidenceScore: number;
  extractedEntities: Record<string, any>;
  missingMandatoryFields: string[];
  ebsValidationResult: string;
  explicitConfirmationState: "NOT_REQUIRED" | "AWAITING_USER_CONFIRMATION" | "CONFIRMED" | "CANCELLED";
  correlationId: string;
  guidedStep: number; // 1..28
  turn: number;
}

export interface TraceStep {
  layer: number; // 1..9
  status: "active" | "skipped" | "blocked";
  detail: string;
}

export interface ApiCall {
  method: string;
  protocol: string;
  endpoint: string;
  fndUser: string;
  responsibility: string;
  ebsApi: string;
  request: any;
  response: any;
  latencyMs: number;
  writeMode: "READ_ONLY" | "AME_ROUTED_NO_DIRECT_DB_WRITE" | "EXTERNAL_ADAPTER" | "RAG_INDEX";
}

export interface ToolTrace {
  name: string;
  args: any;
  ok: boolean;
}

export interface LedgerItem {
  id: string; // transaction id
  itemKey: string; // Oracle WF item key
  type: "LEAVE" | "PROFILE";
  employeeId: string;
  employeeName: string;
  employeeNameAr: string;
  summary: string;
  summaryAr: string;
  details: any;
  status: "PENDING_APPROVAL" | "APPROVED" | "REJECTED";
  submittedAt: number;
  decidedAt?: number;
  approver: string;
  correlationId: string;
}

export interface HRCase {
  id: string;
  employeeId: string;
  employeeName: string;
  category: string;
  categoryAr: string;
  summary: string;
  sentiment: number; // -1..1
  sentimentLabel: string;
  transcript: { role: string; content: string; ts: number }[];
  createdAt: number;
  slaHours: number;
  status: "OPEN" | "IN_PROGRESS" | "RESOLVED";
  resolution?: string;
  priority: "P1" | "P2" | "P3";
}

export interface SiemLog {
  id: string;
  ts: number;
  correlationId: string;
  employeeId: string;
  intent: string;
  endpoint: string;
  severity: "INFO" | "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  category: string;
  pdpl: "MASKED" | "N/A" | "REDACTED" | "MINIMISED";
  message: string;
}

export interface Notification {
  id: string;
  targetEmployeeId: string;
  ts: number;
  en: string;
  ar: string;
  read: boolean;
}

export interface UnresolvedQuery {
  id: string;
  ts: number;
  text: string;
  reason: "Low-Confidence Intent" | "Knowledge Gap" | "EBS API Timeout" | "RBAC Refusal";
  confidence: number;
  status: "NEW" | "PATCHED" | "PROMOTED_TO_UAT";
}

export interface ChatRequestBody {
  messages: { role: "user" | "assistant"; content: string }[];
  employeeId: string;
  lang: Lang;
  session?: SessionState | null;
  ledger?: LedgerItem[];
  caseSeq?: number;
  apiKey?: string;
  forceDemo?: boolean;
  model?: string;
}

export interface ChatResponse {
  reply: string;
  cards: Card[];
  toolCalls: ToolTrace[];
  trace: TraceStep[];
  apiCalls: ApiCall[];
  session: SessionState;
  mode: "groq" | "fallback";
  model: string;
  modeNote?: string;
  guardrail?: { blocked: boolean; reason: string; severity: "HIGH" | "CRITICAL"; masked: string };
  sentiment?: number;
  escalationCase?: HRCase;
  lowConfidence?: boolean;
  latencyMs: number;
}
