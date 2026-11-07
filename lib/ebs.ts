// Simulated Oracle EBS HRMS R12.2 System of Record (read-only mock) + NEDC ecosystem adapters.
// In production these calls are brokered through API Gateway -> OIC -> ISG / SSHR / AME. No direct DB writes.

export interface Employee {
  id: string;
  personId: number;
  fndUser: string;
  nameEn: string;
  nameAr: string;
  titleEn: string;
  titleAr: string;
  grade: string;
  department: string;
  departmentAr: string;
  location: string;
  locationAr: string;
  managerId: string | null;
  responsibility: string;
  mobile: string;
  email: string;
  emergencyAddress: string;
  emergencyContact: string;
  hireDate: string;
  role: "employee" | "manager" | "hr" | "executive";
  initials: string;
}

export const EMPLOYEES: Record<string, Employee> = {
  E10231: {
    id: "E10231", personId: 410231, fndUser: "SALIM.HARTHY",
    nameEn: "Eng. Salim Al-Harthy", nameAr: "م. سالم الحارثي",
    titleEn: "Senior Distribution Engineer", titleAr: "مهندس توزيع أول",
    grade: "NEDC-G09 (Engineering)", department: "Distribution Network - Muscat Grid", departmentAr: "شبكة التوزيع - مسقط",
    location: "Muscat Grid HQ, Al Khuwair", locationAr: "مقر شبكة مسقط، الخوير",
    managerId: "E20015", responsibility: "NEDC Employee Self-Service",
    mobile: "+968 9211 4478", email: "salim.harthy@nedc.example.om",
    emergencyAddress: "Way 3021, Bawshar, Muscat", emergencyContact: "Hamad Al-Harthy (+968 9900 1122)",
    hireDate: "2014-03-02", role: "employee", initials: "SH",
  },
  E10388: {
    id: "E10388", personId: 410388, fndUser: "FATMA.BALUSHI",
    nameEn: "Fatma Al-Balushi", nameAr: "فاطمة البلوشية",
    titleEn: "Grid Operations Supervisor", titleAr: "مشرفة عمليات الشبكة",
    grade: "NEDC-G08 (Operations)", department: "Grid Operations - Sohar", departmentAr: "عمليات الشبكة - صحار",
    location: "Sohar Control Centre", locationAr: "مركز التحكم بصحار",
    managerId: "E20015", responsibility: "NEDC Employee Self-Service",
    mobile: "+968 9533 2210", email: "fatma.balushi@nedc.example.om",
    emergencyAddress: "Falaj Al Qabail, Sohar", emergencyContact: "Mariam Al-Balushi (+968 9876 5501)",
    hireDate: "2016-09-11", role: "employee", initials: "FB",
  },
  E20015: {
    id: "E20015", personId: 420015, fndUser: "KHALID.HINAI",
    nameEn: "Khalid Al-Hinai", nameAr: "خالد الهنائي",
    titleEn: "Line Manager - Distribution Operations", titleAr: "مدير مباشر - عمليات التوزيع",
    grade: "NEDC-M03 (Management)", department: "Distribution Operations", departmentAr: "عمليات التوزيع",
    location: "Muscat Grid HQ", locationAr: "مقر شبكة مسقط",
    managerId: null, responsibility: "NEDC Manager Self-Service",
    mobile: "+968 9100 3344", email: "khalid.hinai@nedc.example.om",
    emergencyAddress: "Al Mawaleh South, Seeb", emergencyContact: "Said Al-Hinai (+968 9222 7788)",
    hireDate: "2009-01-18", role: "manager", initials: "KH",
  },
  E30007: {
    id: "E30007", personId: 430007, fndUser: "AISHA.BUSAIDI",
    nameEn: "Aisha Al-Busaidi", nameAr: "عائشة البوسعيدية",
    titleEn: "HR Operations Specialist", titleAr: "أخصائية عمليات الموارد البشرية",
    grade: "NEDC-G08 (HR)", department: "Human Capital Directorate", departmentAr: "مديرية رأس المال البشري",
    location: "NEDC Head Office, Muscat", locationAr: "المكتب الرئيسي، مسقط",
    managerId: null, responsibility: "NEDC HRMS Manager / HR Service Desk",
    mobile: "+968 9644 1290", email: "aisha.busaidi@nedc.example.om",
    emergencyAddress: "Madinat Sultan Qaboos, Muscat", emergencyContact: "Ahmed Al-Busaidi (+968 9311 4455)",
    hireDate: "2012-05-06", role: "hr", initials: "AB",
  },
  E40001: {
    id: "E40001", personId: 440001, fndUser: "EXEC.DIRECTOR",
    nameEn: "Executive Director, Distribution", nameAr: "المدير التنفيذي للتوزيع",
    titleEn: "Senior Management (Persona)", titleAr: "الإدارة العليا (شخصية تجريبية)",
    grade: "NEDC-E01 (Executive)", department: "Executive Office", departmentAr: "المكتب التنفيذي",
    location: "NEDC Head Office, Muscat", locationAr: "المكتب الرئيسي، مسقط",
    managerId: null, responsibility: "NEDC Executive Analytics",
    mobile: "+968 9000 0001", email: "exec.office@nedc.example.om",
    emergencyAddress: "-", emergencyContact: "-",
    hireDate: "2005-02-01", role: "executive", initials: "ED",
  },
};

export const ROLE_PERSONA: Record<string, string> = {
  employee: "E10231", manager: "E20015", hr: "E30007", executive: "E40001",
};

export const LEAVE_TYPES: Record<string, { en: string; ar: string; code: string; entitlement: number; taken: number }> = {
  annual: { en: "Annual Leave", ar: "إجازة سنوية", code: "NEDC_ANNUAL", entitlement: 30, taken: 7.5 },
  sick: { en: "Sick Leave", ar: "إجازة مرضية", code: "NEDC_SICK", entitlement: 182, taken: 3 },
  emergency: { en: "Emergency Leave", ar: "إجازة طارئة", code: "NEDC_EMERG", entitlement: 6, taken: 1 },
  study: { en: "Exam / Study Leave", ar: "إجازة دراسية / امتحانات", code: "NEDC_STUDY", entitlement: 15, taken: 0 },
  hajj: { en: "Hajj Leave (once in service)", ar: "إجازة الحج (مرة واحدة)", code: "NEDC_HAJJ", entitlement: 15, taken: 0 },
  compassionate: { en: "Compassionate Leave", ar: "إجازة وفاة", code: "NEDC_COMP", entitlement: 3, taken: 0 },
};

export const EXISTING_ABSENCES = [
  { employeeId: "E10231", type: "annual", start: "2026-03-15", end: "2026-03-19", days: 5, status: "Approved", ref: "ABS-2026-00412" },
  { employeeId: "E10231", type: "sick", start: "2026-06-02", end: "2026-06-04", days: 3, status: "Approved", ref: "ABS-2026-01188" },
  { employeeId: "E10231", type: "annual", start: "2026-08-09", end: "2026-08-10", days: 2.5, status: "Approved", ref: "ABS-2026-01954" },
  { employeeId: "E10231", type: "emergency", start: "2026-09-21", end: "2026-09-21", days: 1, status: "Approved", ref: "ABS-2026-02210" },
  { employeeId: "E10231", type: "training", start: "2026-11-18", end: "2026-11-19", days: 2, status: "Approved (Mandatory HV Safety Training)", ref: "OLM-2026-7731" },
];

export function payslipFor(empId: string) {
  const base: Record<string, number> = { E10231: 1450, E10388: 1180, E20015: 2350, E30007: 1120, E40001: 4200 };
  const basic = base[empId] ?? 1200;
  const housing = +(basic * 0.3).toFixed(3);
  const field = empId === "E10231" || empId === "E10388" ? 220 : 0;
  const transport = 120;
  const standby = empId === "E10231" ? 85 : empId === "E10388" ? 95 : 0;
  const gross = +(basic + housing + field + transport + standby).toFixed(3);
  const spf = +(basic * 0.07).toFixed(3);
  const jsf = +(basic * 0.01).toFixed(3);
  const loan = empId === "E10231" ? 150 : 0;
  const net = +(gross - spf - jsf - loan).toFixed(3);
  return {
    period: "October 2026", periodAr: "أكتوبر 2026", payDate: "2026-10-25", currency: "OMR",
    earnings: [
      { en: "Basic Salary", ar: "الراتب الأساسي", amt: basic },
      { en: "Housing Allowance", ar: "بدل السكن", amt: housing },
      { en: "Utility Field Allowance", ar: "بدل العمل الميداني", amt: field },
      { en: "Transport Allowance", ar: "بدل المواصلات", amt: transport },
      { en: "Standby / Shift Allowance", ar: "بدل المناوبة", amt: standby },
    ].filter((e) => e.amt > 0),
    deductions: [
      { en: "SPF / PASI Social Insurance (7%)", ar: "صندوق الحماية الاجتماعية (7%)", amt: spf },
      { en: "Job Security Fund (1%)", ar: "صندوق الأمان الوظيفي (1%)", amt: jsf },
      ...(loan ? [{ en: "Salary Advance Recovery", ar: "استقطاع سلفة الراتب", amt: loan }] : []),
    ],
    gross, net, archiveRef: `PAY_ACTION_INFORMATION#${empId}-2026-10`, payrollName: "NEDC Monthly Payroll",
  };
}

export function leaveBalanceFor(empId: string, extraTaken = 0) {
  return Object.entries(LEAVE_TYPES)
    .filter(([k]) => k !== "hajj" && k !== "compassionate")
    .map(([k, v]) => {
      const taken = empId === "E10231" ? v.taken + (k === "annual" ? extraTaken : 0) : Math.max(0, v.taken - 1);
      return { key: k, en: v.en, ar: v.ar, code: v.code, entitlement: v.entitlement, taken, balance: +(v.entitlement - taken).toFixed(1) };
    });
}

export const BENEFITS = [
  { en: "Group Medical Insurance (Class A, family)", ar: "التأمين الطبي الجماعي (فئة أ - عائلي)", status: "Enrolled", provider: "In-Country Insurer", value: "Coverage up to OMR 25,000/yr" },
  { en: "Life & Personal Accident Cover", ar: "تأمين الحياة والحوادث الشخصية", status: "Enrolled", provider: "Group Policy", value: "36 x monthly basic" },
  { en: "Educational Assistance (children)", ar: "المساعدة التعليمية (الأبناء)", status: "Eligible", provider: "NEDC-HR-POL-055", value: "Up to OMR 600 / child / year" },
  { en: "Annual Air Ticket Allowance", ar: "بدل تذاكر السفر السنوي", status: "Paid Jan 2026", provider: "Payroll", value: "OMR 350" },
  { en: "Housing Loan Subsidy Scheme", ar: "برنامج دعم قرض السكن", status: "Not Enrolled", provider: "Finance", value: "Interest subsidy up to 3%" },
];

export interface PolicyDoc {
  id: string; titleEn: string; titleAr: string; version: string; effective: string; owner: string; ownerAr: string;
  classification: "Internal" | "Restricted" | "Public"; keywords: string[]; answerEn: string; answerAr: string; clause: string; chunks: number; indexedAt: string;
}

export const POLICIES: PolicyDoc[] = [
  {
    id: "NEDC-HR-POL-042", titleEn: "Emergency & Special Leave Policy", titleAr: "سياسة الإجازات الطارئة والخاصة", version: "v3.2", effective: "Jan 2026",
    owner: "HR Policy Directorate", ownerAr: "مديرية السياسات - الموارد البشرية", classification: "Internal", clause: "§4.2 – §4.6", chunks: 38, indexedAt: "2026-01-04",
    keywords: ["emergency", "urgent", "special leave", "طارئة", "طارئه", "ظرف", "وفاة", "compassionate", "bereavement"],
    answerEn: "Under NEDC-HR-POL-042 §4.2, every employee is entitled to up to 6 working days of paid Emergency Leave per calendar year, granted in blocks of max 2 consecutive days. The request may be submitted retroactively within 3 working days via Self-Service with line-manager approval through Oracle AME. Compassionate leave of 3 days (first-degree relatives) is separate and does not deduct from emergency or annual balance (§4.6).",
    answerAr: "حسب السياسة NEDC-HR-POL-042 البند 4.2، يحق لكل موظف 6 أيام عمل مدفوعة كإجازة طارئة في السنة، بحد أقصى يومين متتاليين في كل مرة. يمكن تقديم الطلب بأثر رجعي خلال 3 أيام عمل عبر الخدمة الذاتية وبموافقة المدير المباشر عبر Oracle AME. إجازة الوفاة (3 أيام للأقارب من الدرجة الأولى) منفصلة ولا تُخصم من رصيد الطارئة أو السنوية (البند 4.6).",
  },
  {
    id: "NEDC-HR-POL-017", titleEn: "Overtime & Standby Compensation for Field Engineers", titleAr: "سياسة العمل الإضافي والمناوبة للمهندسين الميدانيين", version: "v2.4", effective: "Mar 2026",
    owner: "HR Policy Directorate", ownerAr: "مديرية السياسات - الموارد البشرية", classification: "Internal", clause: "§3.1 – §3.5", chunks: 29, indexedAt: "2026-03-02",
    keywords: ["overtime", "extra hours", "standby", "call-out", "field", "إضافي", "اضافي", "مناوبة", "ساعات"],
    answerEn: "Per NEDC-HR-POL-017 §3.1, field engineers (grades G06–G10) receive overtime at 125% of hourly basic for working days and 150% for weekends/public holidays, aligned with the Oman Labour Law (Royal Decree 53/2023). Emergency grid call-outs carry a minimum 3-hour credit (§3.3). Overtime must be pre-approved by the line manager and is capped at 12 hours/week except during declared grid emergencies (§3.5).",
    answerAr: "حسب السياسة NEDC-HR-POL-017 البند 3.1، يُصرف للمهندسين الميدانيين (الدرجات G06–G10) أجر إضافي بنسبة 125% من الأجر الأساسي للساعة في أيام العمل و150% في عطلة نهاية الأسبوع والعطل الرسمية، وفق قانون العمل العُماني (المرسوم السلطاني 53/2023). استدعاءات الطوارئ تُحتسب بحد أدنى 3 ساعات (البند 3.3). يجب اعتماد العمل الإضافي مسبقاً من المدير المباشر وبحد أقصى 12 ساعة أسبوعياً إلا في حالات طوارئ الشبكة المعلنة (البند 3.5).",
  },
  {
    id: "NEDC-HR-POL-055", titleEn: "Educational Assistance & Sponsorship Policy", titleAr: "سياسة المساعدة التعليمية والابتعاث", version: "v1.8", effective: "Sep 2025",
    owner: "Learning & Development Section", ownerAr: "قسم التعلم والتطوير", classification: "Internal", clause: "§2.1 – §2.7", chunks: 24, indexedAt: "2025-09-10",
    keywords: ["education", "educational", "tuition", "study", "school", "university", "sponsorship", "تعليم", "تعليمية", "دراسة", "ابتعاث", "مدرسة", "جامعة"],
    answerEn: "Under NEDC-HR-POL-055 §2.1, permanent employees with 2+ years of service may receive educational assistance up to OMR 600 per child per academic year (max 3 children). Employee self-development sponsorship (diploma/bachelor/master in grid-relevant disciplines) covers up to 80% of tuition subject to a service bond of 1.5x the study period (§2.5).",
    answerAr: "حسب السياسة NEDC-HR-POL-055 البند 2.1، يحق للموظفين الدائمين ممن أمضوا سنتين أو أكثر الحصول على مساعدة تعليمية تصل إلى 600 ريال عُماني لكل طفل في السنة الدراسية (بحد أقصى 3 أبناء). ويغطي ابتعاث الموظف للتطوير الذاتي (دبلوم/بكالوريوس/ماجستير في تخصصات ذات صلة بالشبكة) حتى 80% من الرسوم مقابل التزام خدمة يعادل 1.5 ضعف مدة الدراسة (البند 2.5).",
  },
  {
    id: "NEDC-HR-POL-031", titleEn: "Annual Leave & Leave Encashment Policy", titleAr: "سياسة الإجازة السنوية وصرف بدل الإجازات", version: "v4.0", effective: "Jan 2026",
    owner: "HR Policy Directorate", ownerAr: "مديرية السياسات - الموارد البشرية", classification: "Internal", clause: "§5.1 – §5.8", chunks: 41, indexedAt: "2026-01-04",
    keywords: ["annual leave", "carry forward", "encash", "سنوية", "ترحيل", "صرف بدل", "carryover"],
    answerEn: "Per NEDC-HR-POL-031 §5.1, employees accrue 30 working days of annual leave per year (Oman Labour Law minimum). Up to 15 unused days may be carried forward to the next year (§5.4); encashment is limited to separation or approved operational exceptions (§5.7). Requests should be submitted at least 7 days in advance through SSHR.",
    answerAr: "حسب السياسة NEDC-HR-POL-031 البند 5.1، يستحق الموظف 30 يوم عمل إجازة سنوية. يمكن ترحيل حتى 15 يوماً غير مستخدمة للسنة التالية (البند 5.4)، ويقتصر صرف البدل على حالات انتهاء الخدمة أو الاستثناءات التشغيلية المعتمدة (البند 5.7). يجب تقديم الطلب قبل 7 أيام على الأقل عبر الخدمة الذاتية.",
  },
  {
    id: "NEDC-HR-POL-068", titleEn: "Medical Board & Long-Term Sick Leave Procedure", titleAr: "إجراءات اللجنة الطبية والإجازات المرضية الطويلة", version: "v2.1", effective: "Jun 2026",
    owner: "Employee Relations & Wellbeing", ownerAr: "علاقات الموظفين والرفاه", classification: "Restricted", clause: "§6.1 – §6.9", chunks: 33, indexedAt: "2026-06-01",
    keywords: ["medical board", "long-term sick", "sick", "مرضية", "لجنة طبية", "medical"],
    answerEn: "Per NEDC-HR-POL-068 §6.1, sick leave beyond 10 consecutive days must be certified by an MOH-accredited facility; beyond 60 days the case is referred to the NEDC Medical Board. Pay continues per the Labour Law sliding scale (§6.4). Cases are handled confidentially by Employee Relations.",
    answerAr: "حسب السياسة NEDC-HR-POL-068 البند 6.1، تتطلب الإجازة المرضية التي تزيد عن 10 أيام متتالية تصديقاً من منشأة معتمدة من وزارة الصحة، وما يزيد عن 60 يوماً يُحال إلى اللجنة الطبية بالشركة. يستمر صرف الأجر وفق السلم المتدرج في قانون العمل (البند 6.4). تُعالج الحالات بسرية تامة.",
  },
  {
    id: "NEDC-HSE-POL-009", titleEn: "Field Safety, PPE & Working-at-Height Allowance", titleAr: "سياسة السلامة الميدانية ومعدات الوقاية وبدل العمل على المرتفعات", version: "v5.1", effective: "Feb 2026",
    owner: "HSE Directorate", ownerAr: "مديرية الصحة والسلامة والبيئة", classification: "Public", clause: "§7.2", chunks: 19, indexedAt: "2026-02-15",
    keywords: ["safety", "ppe", "height", "allowance", "سلامة", "مرتفعات", "heat", "summer"],
    answerEn: "Per NEDC-HSE-POL-009 §7.2, field staff are issued PPE annually and receive OMR 40/month working-at-height allowance when certified. During the midday work ban (12:30–15:30, 1 Jun – 31 Aug) outdoor field work is suspended except for grid emergencies.",
    answerAr: "حسب السياسة NEDC-HSE-POL-009 البند 7.2، تُصرف معدات الوقاية سنوياً ويُمنح الموظفون الميدانيون المعتمدون بدل عمل على المرتفعات قدره 40 ريالاً شهرياً. خلال فترة حظر العمل وقت الظهيرة (12:30–15:30 من 1 يونيو إلى 31 أغسطس) يتوقف العمل الميداني الخارجي إلا لطوارئ الشبكة.",
  },
];

export function searchPolicy(q: string, docs: PolicyDoc[] = POLICIES) {
  const t = q.toLowerCase();
  const scored = docs
    .map((d) => ({ d, s: d.keywords.reduce((a, k) => a + (t.includes(k.toLowerCase()) ? (k.length > 6 ? 2 : 1) : 0), 0) }))
    .filter((x) => x.s > 0)
    .sort((a, b) => b.s - a.s);
  return scored.map((x) => ({ doc: x.d, confidence: Math.min(0.992, 0.928 + x.s * 0.028) }));
}

export const FINANCE = {
  E10231: [
    { ref: "FIN-ADV-2026-0912", type: "Salary Advance", typeAr: "سلفة راتب", amount: 900, status: "Approved – Disbursement scheduled 12 Nov 2026", statusAr: "معتمدة – الصرف مجدول في 12 نوفمبر 2026", installments: "6 x OMR 150", stage: 3, stages: ["Submitted", "Line Manager", "Finance Controller", "Disbursement"] },
    { ref: "FIN-LN-2025-0331", type: "Employee Housing Loan", typeAr: "قرض سكني للموظف", amount: 12000, status: "Active – 41 of 60 installments remaining", statusAr: "نشط – متبقي 41 من 60 قسطاً", installments: "OMR 200 / month", stage: 4, stages: ["Submitted", "HR", "Finance", "Active"] },
  ],
};

export const FLEET = {
  E10231: [
    { ref: "FLT-BK-2026-4471", kind: "4x4 Utility Vehicle (Toyota Land Cruiser – NEDC-4X4-118)", kindAr: "مركبة دفع رباعي (لاندكروزر – NEDC-4X4-118)", purpose: "Nizwa 132/33kV Substation Inspection", purposeAr: "فحص محطة نزوى 132/33 ك.ف", date: "2026-11-11", status: "Confirmed – Driver assigned, pickup 06:30 Muscat Grid HQ", statusAr: "مؤكد – تم تعيين السائق، الانطلاق 06:30 من مقر شبكة مسقط", stage: 3 },
    { ref: "TRV-2026-0877", kind: "Business Trip Per-Diem (Nizwa, 2 nights)", kindAr: "بدل مهمة رسمية (نزوى، ليلتان)", purpose: "Substation commissioning", purposeAr: "تشغيل المحطة", date: "2026-11-11", status: "Pending Line Manager approval", statusAr: "بانتظار موافقة المدير المباشر", stage: 2 },
  ],
};

export function fmtOMR(n: number) {
  return n.toLocaleString("en-US", { minimumFractionDigits: 3, maximumFractionDigits: 3 });
}
