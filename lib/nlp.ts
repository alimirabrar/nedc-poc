// Bilingual NLP helpers: language/dialect detection, entity extraction, guardrails, sentiment.
export function detectLang(text: string): "ar" | "en" {
  const ar = (text.match(/[\u0600-\u06FF]/g) || []).length;
  const en = (text.match(/[A-Za-z]/g) || []).length;
  return ar > en * 0.6 ? "ar" : "en";
}

const OMANI_MARKERS = ["أبي", "ابي", "أبغى", "ابغى", "هلا", "شو", "وايد", "الجاي", "لين", "عاد", "زين", "كذا", "حق", "يوم الجاي", "شي", "ما شي", "باقي", "كم باقي"];
export function detectDialect(text: string): string {
  const lang = detectLang(text);
  if (lang === "en") {
    return /[\u0600-\u06FF]/.test(text) ? "English + Arabic code-switch" : "English";
  }
  const hits = OMANI_MARKERS.filter((m) => text.includes(m)).length;
  if (hits >= 1) return "Gulf Arabic – Omani dialect";
  return "Modern Standard Arabic";
}

const MONTHS: Record<string, number> = {
  january: 1, jan: 1, february: 2, feb: 2, march: 3, mar: 3, april: 4, apr: 4, may: 5, june: 6, jun: 6, july: 7, jul: 7,
  august: 8, aug: 8, september: 9, sep: 9, sept: 9, october: 10, oct: 10, november: 11, nov: 11, december: 12, dec: 12,
  "يناير": 1, "فبراير": 2, "مارس": 3, "أبريل": 4, "ابريل": 4, "مايو": 5, "يونيو": 6, "يوليو": 7, "أغسطس": 8, "اغسطس": 8,
  "سبتمبر": 9, "أكتوبر": 10, "اكتوبر": 10, "نوفمبر": 11, "ديسمبر": 12,
};
const MONTH_RE = Object.keys(MONTHS).sort((a, b) => b.length - a.length).join("|");

function toIso(day: number, month: number) {
  const now = new Date();
  let year = now.getFullYear();
  if (month < now.getMonth() + 1 - 1) year += 1;
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function normDigits(s: string) {
  return s.replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)));
}

export interface DateExtraction { start?: string; end?: string; endOnly?: boolean; startOnly?: boolean; nextWeek?: boolean }

export function extractDates(raw: string): DateExtraction {
  const text = normDigits(raw).toLowerCase();
  const out: DateExtraction = {};
  if (/next week|الأسبوع الجاي|الاسبوع الجاي|الأسبوع القادم|الاسبوع القادم/.test(text)) out.nextWeek = true;

  // "change end date to 15 november" / "غير تاريخ النهاية إلى 15 نوفمبر"
  const endChange = text.match(new RegExp(`(?:end date|end|return|تاريخ النهاية|النهاية|ينتهي|لين)\\D{0,20}?(\\d{1,2})\\s*(?:st|nd|rd|th)?\\s*(?:of\\s*)?(${MONTH_RE})`, "i"));
  const startChange = text.match(new RegExp(`(?:start date|starting|تاريخ البداية|البداية)\\D{0,20}?(\\d{1,2})\\s*(?:st|nd|rd|th)?\\s*(?:of\\s*)?(${MONTH_RE})`, "i"));
  if (/change|modify|update|غير|غيّر|عدل|عدّل|خل|خلي/.test(text)) {
    if (endChange && !startChange) { out.end = toIso(+endChange[1], MONTHS[endChange[2]]); out.endOnly = true; return out; }
    if (startChange && !endChange) { out.start = toIso(+startChange[1], MONTHS[startChange[2]]); out.startOnly = true; return out; }
  }

  // "10 to 15 november" / "من 10 إلى 15 نوفمبر"
  const range1 = text.match(new RegExp(`(\\d{1,2})\\s*(?:st|nd|rd|th)?\\s*(?:-|–|to|till|until|through|إلى|الى|لين|حتى)\\s*(\\d{1,2})\\s*(?:st|nd|rd|th)?\\s*(?:of\\s*)?(${MONTH_RE})`, "i"));
  if (range1) { const m = MONTHS[range1[3]]; out.start = toIso(+range1[1], m); out.end = toIso(+range1[2], m); return out; }
  // "10 november to 20 november"
  const range2 = text.match(new RegExp(`(\\d{1,2})\\s*(?:st|nd|rd|th)?\\s*(?:of\\s*)?(${MONTH_RE})\\s*(?:-|–|to|till|until|through|إلى|الى|لين|حتى)\\s*(\\d{1,2})\\s*(?:st|nd|rd|th)?\\s*(?:of\\s*)?(${MONTH_RE})`, "i"));
  if (range2) { out.start = toIso(+range2[1], MONTHS[range2[2]]); out.end = toIso(+range2[3], MONTHS[range2[4]]); return out; }
  // ISO
  const iso = text.match(/(\d{4}-\d{2}-\d{2})\s*(?:to|-|–|until|إلى|الى)\s*(\d{4}-\d{2}-\d{2})/);
  if (iso) { out.start = iso[1]; out.end = iso[2]; return out; }
  // single date
  const single = text.match(new RegExp(`(\\d{1,2})\\s*(?:st|nd|rd|th)?\\s*(?:of\\s*)?(${MONTH_RE})`, "i"));
  if (single) {
    const d = toIso(+single[1], MONTHS[single[2]]);
    if (endChange) { out.end = d; out.endOnly = true; } else { out.start = d; out.startOnly = true; }
  }
  return out;
}

export function extractLeaveType(raw: string): string | undefined {
  const t = raw.toLowerCase();
  if (/annual|vacation|سنوي|سنوية|اعتيادية/.test(t)) return "annual";
  if (/sick|مرضي|مرضية/.test(t)) return "sick";
  if (/emergency|urgent|طارئ|طارئة|طارئه/.test(t)) return "emergency";
  if (/study|exam|دراسي|امتحان/.test(t)) return "study";
  if (/hajj|حج/.test(t)) return "hajj";
  if (/compassionate|bereavement|وفاة/.test(t)) return "compassionate";
  return undefined;
}

export function extractPhone(raw: string): string | undefined {
  const t = normDigits(raw);
  const m = t.match(/(\+?\d[\d\s-]{6,16}\d)/);
  return m ? m[1].trim() : undefined;
}

export const OMAN_MOBILE_RE = /^(?:\+968|00968)?\s?[79]\d{3}\s?\d{4}$/;
export const EMAIL_RE = /^[\w.+-]+@[\w-]+\.[\w.]+$/;

export function formatOmanMobile(v: string) {
  const d = v.replace(/\D/g, "").replace(/^00968|^968/, "");
  return d.length === 8 ? `+968 ${d.slice(0, 4)} ${d.slice(4)}` : v;
}

// ---------- Guardrails (deterministic, pre-LLM, 100% refusal) ----------
const INJECTION = [
  /ignore (all|any|the)? ?(previous|prior|above) (instructions|rules|prompts)/i, /system prompt/i, /developer mode/i, /jailbreak/i,
  /you are now/i, /act as (an? )?(admin|dba|root|hr director)/i, /bypass/i, /override (rbac|security|policy)/i,
  /drop table/i, /select \* from/i, /per_all_people_f/i, /union select/i, /<script/i,
  /تجاهل (كل )?(التعليمات|الأوامر|القواعد)/, /تجاوز (الصلاحيات|الحماية)/, /وضع المطور/,
];
const OTHER_DATA = [
  /colleague|co-?worker|someone else|another employee|other employee|my team ?mate|his salary|her salary|their salary/i,
  /زميل|زميلي|زميلتي|موظف آخر|راتب (فلان|زميل)|رواتب الموظفين|راتبه|راتبها/,
  /all employees'? (salar|payslip|data)/i,
];

export interface GuardResult { blocked: boolean; kind?: "PROMPT_INJECTION" | "CROSS_EMPLOYEE_PII" ; reason?: string; masked?: string }

export function maskPII(text: string) {
  return text
    .replace(/(#|emp(?:loyee)?\s*(?:no\.?|number|#|id)?\s*:?\s*)(\d{2})\d+/gi, (_m, p, d) => `${p}${d}***`)
    .replace(/\b(Eng\.|Dr\.|Mr\.|Ms\.)?\s?([A-Z])[a-z]+\s+(Al-)?([A-Z])[a-z]+/g, (_m, t, a, al, b) => `${t ? t + " " : ""}${a}***** ${al || ""}${b}****`)
    .replace(/\+?968\s?\d{4}\s?\d{4}/g, "+968 **** ****");
}

export function guard(text: string, ownEmpNumber: string): GuardResult {
  if (INJECTION.some((r) => r.test(text))) return { blocked: true, kind: "PROMPT_INJECTION", reason: "Prompt-injection / privilege-escalation pattern detected", masked: maskPII(text) };
  const empNums = normDigits(text).match(/(?:#|emp(?:loyee)?\s*(?:no\.?|number|#|id)?\s*:?\s*)(\d{4,6})/gi) || [];
  const foreignEmp = empNums.some((n) => !n.includes(ownEmpNumber));
  const asksPay = /salary|payslip|pay slip|salaries|راتب|رواتب|كشف|leave|balance|إجازة|رصيد|profile|address|phone|بيانات/i.test(text);
  if ((OTHER_DATA.some((r) => r.test(text)) && asksPay) || (foreignEmp && asksPay)) {
    return { blocked: true, kind: "CROSS_EMPLOYEE_PII", reason: "Cross-employee personal data request (RBAC: self-scope only)", masked: maskPII(text) };
  }
  return { blocked: false };
}

// ---------- Sentiment ----------
const NEG = ["unfair", "frustrat", "angry", "upset", "complain", "grievance", "harass", "discriminat", "ignored", "stress", "unacceptable", "sick", "pain", "ظلم", "زعلان", "متضايق", "شكوى", "تظلم", "تعبان", "مرهق", "غير عادل", "تحرش"];
const POS = ["thank", "great", "appreciate", "happy", "شكرا", "شكراً", "ممتاز", "تمام", "زين"];
export function sentiment(text: string) {
  const t = text.toLowerCase();
  const n = NEG.filter((w) => t.includes(w)).length;
  const p = POS.filter((w) => t.includes(w)).length;
  const s = Math.max(-1, Math.min(1, (p - n * 1.4) / 3));
  return +s.toFixed(2);
}
export function sentimentLabel(s: number) {
  return s <= -0.5 ? "Highly Negative / Distressed" : s < -0.1 ? "Negative" : s > 0.2 ? "Positive" : "Neutral";
}

// ---------- Date utils ----------
export function daysBetween(start: string, end: string) {
  const s = new Date(start + "T00:00:00Z").getTime();
  const e = new Date(end + "T00:00:00Z").getTime();
  return Math.round((e - s) / 86400000) + 1;
}
export function workingDays(start: string, end: string) {
  let n = 0;
  const d = new Date(start + "T00:00:00Z");
  const e = new Date(end + "T00:00:00Z");
  while (d <= e) { const w = d.getUTCDay(); if (w !== 5 && w !== 6) n++; d.setUTCDate(d.getUTCDate() + 1); }
  return n;
}
export function overlaps(a1: string, a2: string, b1: string, b2: string) {
  return a1 <= b2 && b1 <= a2;
}
export function prettyDate(iso: string, lang: "en" | "ar" = "en") {
  const d = new Date(iso + "T00:00:00Z");
  return d.toLocaleDateString(lang === "ar" ? "ar-OM" : "en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
}
