"use client";
import React, { useState } from "react";
import { Workflow, Play, CheckCircle2, ChevronRight, Layers, ArrowRight, Clock, Award, ShieldAlert } from "lucide-react";
import { useStore } from "@/lib/store";

interface Stage {
  id: number;
  nameEn: string;
  nameAr: string;
  descEn: string;
  descAr: string;
  score: number; // Release-1 Prioritization Score
  volume: "High" | "Medium" | "Low";
  manualEffort: "85%" | "70%" | "60%" | "75%" | "80%" | "90%";
  ebsApiReadiness: "100% ISG Ready" | "FastFormula Ready" | "AME Workflow Ready";
  steps: { step: number; titleEn: string; titleAr: string; actor: string }[];
}

const STAGES: Stage[] = [
  {
    id: 1,
    nameEn: "1. Recruitment & Applicant Intake",
    nameAr: "١. التوظيف واستقبال الطلبات",
    descEn: "Automated candidate screening, Arabic CV parsing and interview scheduling",
    descAr: "فرز السير الذاتية باللغة العربية وجدولة المقابلات آلياً",
    score: 84,
    volume: "High",
    manualEffort: "85%",
    ebsApiReadiness: "100% ISG Ready",
    steps: [
      { step: 1, titleEn: "Job requisition opened in Oracle iRecruitment", titleAr: "فتح طلب التوظيف في iRecruitment", actor: "HR Manager" },
      { step: 2, titleEn: "Bilingual vacancy broadcast on NEDC Portal", titleAr: "نشر الإعلان ثنائي اللغة في بوابة نماء", actor: "AI Bot" },
      { step: 3, titleEn: "Automated CV parsing & competency scoring", titleAr: "تحليل السير الذاتية وتحديد نسبة التطابق", actor: "NLP Engine" },
      { step: 4, titleEn: "Stage candidate into Oracle HR applicant pool", titleAr: "تسجيل المترشح في سجلات المتقدمين في EBS", actor: "OIC Adapter" },
    ],
  },
  {
    id: 2,
    nameEn: "2. New Hire Onboarding",
    nameAr: "٢. تهيئة الموظفين الجدد",
    descEn: "Digital document collection, IT asset provisioning and mandatory safety briefing",
    descAr: "جمع المستندات الرقمية وصرف الأجهزة والتدريب الإلزامي على السلامة",
    score: 92,
    volume: "High",
    manualEffort: "90%",
    ebsApiReadiness: "100% ISG Ready",
    steps: [
      { step: 1, titleEn: "Generate Oracle FND User & Employee Number", titleAr: "توليد رقم الموظف وحساب FND_USER", actor: "API Gateway" },
      { step: 2, titleEn: "Push bank IBAN & national ID to Oracle HRMS", titleAr: "إرسال الآيبان والرقم المدني إلى HRMS", actor: "ISG REST" },
      { step: 3, titleEn: "Auto-enrol in High-Voltage Substation Safety", titleAr: "التسجيل التلقائي في دورة سلامة المحطات", actor: "Oracle OLM" },
      { step: 4, titleEn: "Dispatch 1st-day briefing checklist via WhatsApp/Portal", titleAr: "إرسال قائمة مهام اليوم الأول للموظف", actor: "AI ESS" },
    ],
  },
  {
    id: 3,
    nameEn: "3. Employee Administration",
    nameAr: "٣. إدارة شؤون الموظفين",
    descEn: "Self-service letters (NOC, salary certificates), ID renewals, and personal data changes",
    descAr: "الشهادات والخطابات الرسمية (عدم ممانعة، راتب) وتحديث البيانات الشخصية",
    score: 96,
    volume: "High",
    manualEffort: "85%",
    ebsApiReadiness: "AME Workflow Ready",
    steps: [
      { step: 1, titleEn: "Employee requests Embassy/Ministry letter in chat", titleAr: "طلب خطاب سفارة أو وزارة عبر المحادثة", actor: "Employee" },
      { step: 2, titleEn: "Verify active assignment & grade in EBS", titleAr: "التحقق من سريان التعيين والدرجة في EBS", actor: "ISG Adapter" },
      { step: 3, titleEn: "Generate watermarked PDF with QR verification code", titleAr: "توليد الشهادة بختم ورمز التحقق الرقمي", actor: "AI Document Gen" },
      { step: 4, titleEn: "Log issuance in Oracle HR administrative records", titleAr: "توثيق الإصدار في سجلات الموظف الإدارية", actor: "SSHR API" },
    ],
  },
  {
    id: 4,
    nameEn: "4. Leave & Attendance Management",
    nameAr: "٤. إدارة الإجازات والدوام",
    descEn: "Multi-turn absence request, accrual calculation, overlap guardrails, AME routing",
    descAr: "تقديم الإجازات واحتساب الأرصدة وفحص التعارض ومسار الموافقات",
    score: 98,
    volume: "High",
    manualEffort: "90%",
    ebsApiReadiness: "100% ISG Ready",
    steps: [
      { step: 1, titleEn: "Multi-turn slot collection (type, dates)", titleAr: "جمع تفاصيل الإجازة عبر الحوار الذكي", actor: "AI Assistant" },
      { step: 2, titleEn: "Oracle Net Accrual Balance calculation", titleAr: "احتساب رصيد الإجازة الصافي من EBS", actor: "PER_ACCRUAL" },
      { step: 3, titleEn: "Check existing absence & OLM training overlap", titleAr: "فحص تعارض الإجازات والدورات المجدولة", actor: "Validation Engine" },
      { step: 4, titleEn: "Explicit employee confirmation click", titleAr: "التأكيد الصريح من الموظف على البطاقة", actor: "Employee" },
      { step: 5, titleEn: "Route to Line Manager via Oracle AME (Zero DB Write)", titleAr: "تحويل الطلب للمدير عبر مسار موافقات AME", actor: "OIC Gateway" },
    ],
  },
  {
    id: 5,
    nameEn: "5. Payroll & Compensation",
    nameAr: "٥. الرواتب والمستحقات",
    descEn: "Payslip archive retrieval, FastFormula deductions, loan deductions, salary advances",
    descAr: "استعراض كشف الراتب واستقطاعات الصناديق والقروض والسلف المالية",
    score: 95,
    volume: "High",
    manualEffort: "70%",
    ebsApiReadiness: "FastFormula Ready",
    steps: [
      { step: 1, titleEn: "Query Oracle Payroll action information table", titleAr: "استعلام جدول PAY_ACTION_INFORMATION", actor: "ISG Service" },
      { step: 2, titleEn: "Retrieve Basic, Field & Housing components", titleAr: "جلب مفردات الراتب الأساسي والبدلات", actor: "OIC Adapter" },
      { step: 3, titleEn: "Display OMR payslip breakdown with SPF/JSF deductions", titleAr: "عرض تفاصيل الراتب والاستقطاعات بالريال", actor: "UI Card" },
      { step: 4, titleEn: "Allow salary advance simulation & request", titleAr: "إتاحة محاكاة وطلب سلفة الراتب", actor: "Finance Adapter" },
    ],
  },
  {
    id: 6,
    nameEn: "6. Benefits & Insurance (OAB)",
    nameAr: "٦. المزايا والتأمين الصحي",
    descEn: "Medical insurance claims, child education allowance, air ticket benefit claims",
    descAr: "مطالبات التأمين الطبي وبدل تعليم الأبناء وتذاكر السفر السنوية",
    score: 88,
    volume: "Medium",
    manualEffort: "75%",
    ebsApiReadiness: "100% ISG Ready",
    steps: [
      { step: 1, titleEn: "Read Oracle Advanced Benefits enrolment records", titleAr: "قراءة اشتراكات الموظف في Oracle OAB", actor: "BEN_PRTT API" },
      { step: 2, titleEn: "Verify family dependents eligibility", titleAr: "التحقق من أهلية المعالين والتابعين", actor: "Rule Engine" },
      { step: 3, titleEn: "Submit reimbursement invoice to Finance", titleAr: "إرسال فاتورة المطالبة إلى قسم المالية", actor: "OIC Finance" },
      { step: 4, titleEn: "Credit payment in subsequent payroll cycle", titleAr: "إدراج المستحق في مسير الرواتب القادم", actor: "Payroll FastFormula" },
    ],
  },
  {
    id: 7,
    nameEn: "7. Learning & Development (OLM)",
    nameAr: "٧. التعلم وتطوير الكفاءات",
    descEn: "Competency gap identification, safety certifications, 1-click OLM course enrolment",
    descAr: "تحديد الفجوات المهارية وشهادات السلامة والتسجيل بضغطة واحدة في OLM",
    score: 90,
    volume: "Medium",
    manualEffort: "60%",
    ebsApiReadiness: "100% ISG Ready",
    steps: [
      { step: 1, titleEn: "AI evaluates engineer grade & mandatory safety certs", titleAr: "تقييم الدرجة الوظيفية ومتطلبات السلامة", actor: "AI Engine" },
      { step: 2, titleEn: "Recommend high-voltage & grid management courses", titleAr: "اقتراح دورات شبكات الجهد العالي والتحكم", actor: "Recommender" },
      { step: 3, titleEn: "Call OTA_DELEGATE_BOOKING_API for direct enrolment", titleAr: "استدعاء واجهة التسجيل المباشر في OLM", actor: "ISG Adapter" },
      { step: 4, titleEn: "Sync calendar event & dispatch QR ticket", titleAr: "مزامنة التقويم وتوليد تذكرة الحضور الرقمية", actor: "AI ESS" },
    ],
  },
  {
    id: 8,
    nameEn: "8. Performance Management",
    nameAr: "٨. إدارة الأداء والتقييم",
    descEn: "Annual KPI goal alignment, mid-year check-ins, continuous feedback sentiment",
    descAr: "مواءمة مؤشرات الأداء السنوية والتقييم النصفي ورصد انطباعات الموظف",
    score: 82,
    volume: "Medium",
    manualEffort: "80%",
    ebsApiReadiness: "AME Workflow Ready",
    steps: [
      { step: 1, titleEn: "Align department utility KPIs with employee goals", titleAr: "ربط أهداف مديرية التوزيع بأهداف المهندس", actor: "Performance API" },
      { step: 2, titleEn: "Periodic conversational milestone check-ins", titleAr: "متابعة الإنجاز عبر حوارات دورية مع المساعد", actor: "AI Bot" },
      { step: 3, titleEn: "Line Manager appraisal rating review in AME", titleAr: "تقييم المدير المباشر عبر مسار AME", actor: "Line Manager" },
      { step: 4, titleEn: "Archive score in Oracle Appraisal tables", titleAr: "أرشفة النتيجة في سجلات تقييم الأداء", actor: "EBS Core" },
    ],
  },
  {
    id: 9,
    nameEn: "9. Career Movement & Promotions",
    nameAr: "٩. التدرج الوظيفي والترقيات",
    descEn: "Internal vacancies, transfer eligibility validation, grade step progression",
    descAr: "شواغر النقل الداخلي وفحص شروط الاستحقاق والترقية للدرجة التالية",
    score: 79,
    volume: "Low",
    manualEffort: "85%",
    ebsApiReadiness: "100% ISG Ready",
    steps: [
      { step: 1, titleEn: "Verify time-in-grade eligibility (min 3 years)", titleAr: "التحقق من إكمال المدة البينية (3 سنوات)", actor: "ISG Check" },
      { step: 2, titleEn: "Submit internal mobility application", titleAr: "تقديم طلب النقل الداخلي لمحطة أخرى", actor: "Employee" },
      { step: 3, titleEn: "Dual-manager approval workflow (Releasing & Receiving)", titleAr: "اعتماد مشترك بين المدير الحالي والمستقبل", actor: "Oracle AME" },
      { step: 4, titleEn: "Update Oracle Assignment & Organization records", titleAr: "تحديث السجل الوظيفي وموقع العمل في EBS", actor: "HR Admin" },
    ],
  },
  {
    id: 10,
    nameEn: "10. Separation, Clearance & Retirement",
    nameAr: "١٠. نهاية الخدمة وإخلاء الطرف",
    descEn: "Automated exit interview, inter-department clearance (Assets/Fleet/Finance), SPF handover",
    descAr: "المقابلة الختامية وإخلاء الطرف الإلكتروني (العهد/المركبات) ونقل المعاش للحماية الاجتماعية",
    score: 87,
    volume: "Low",
    manualEffort: "90%",
    ebsApiReadiness: "FastFormula Ready",
    steps: [
      { step: 1, titleEn: "Resignation notice / retirement forecast initiated", titleAr: "تقديم إشعار التقاعد أو الاستقالة", actor: "Employee" },
      { step: 2, titleEn: "Parallel clearance tasks (IT, Fleet, Tools, Finance)", titleAr: "إخلاء طرف متزامن (الأجهزة، المركبات، المالية)", actor: "Clearance Engine" },
      { step: 3, titleEn: "Final settlement calculation (unused leave encashment)", titleAr: "احتساب مكافأة نهاية الخدمة وبدل الإجازات", actor: "FastFormula" },
      { step: 4, titleEn: "End-date Oracle FND User & notify Social Protection Fund", titleAr: "إنهاء حساب FND_USER وإشعار صندوق الحماية", actor: "OIC Adapter" },
    ],
  },
];

export default function Lifecycle() {
  const { L, lang, log } = useStore();
  const [selectedStage, setSelectedStage] = useState<Stage>(STAGES[3]); // Default to Leave & Attendance
  const [simulating, setSimulating] = useState(false);
  const [activeStepIdx, setActiveStepIdx] = useState<number | null>(null);

  const runSimulation = () => {
    setSimulating(true);
    setActiveStepIdx(0);
    log({
      employeeId: "E10231",
      intent: `LIFECYCLE_SIM_${selectedStage.id}`,
      endpoint: "POST /oic/api/v1/lifecycle/simulate",
      severity: "INFO",
      category: "LIFECYCLE_AUTOMATION",
      pdpl: "MINIMISED",
      message: `Triggered 12-step standardized automation for Stage ${selectedStage.id} (${selectedStage.nameEn})`,
    });

    let current = 0;
    const interval = setInterval(() => {
      current++;
      if (current < selectedStage.steps.length) {
        setActiveStepIdx(current);
      } else {
        clearInterval(interval);
        setSimulating(false);
        setActiveStepIdx(null);
      }
    }, 1200);
  };

  return (
    <div className="p-4 space-y-4 max-w-7xl mx-auto">
      {/* Header */}
      <div className="panel p-4 bg-gradient-to-r from-navy to-slate-900 text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
        <div>
          <div className="text-base font-bold flex items-center gap-2">
            <Workflow className="text-nama-teal" size={20} />
            {L("10-Stage Employee Lifecycle Automation Hub (RFP Sec 12)", "منصة أتمتة المراحل العشر لدورة حياة الموظف (البند 12)")}
          </div>
          <div className="text-xs text-slate-300 mt-0.5">
            {L("Standardized 12-Step Automation Architecture across all stages on top of Oracle EBS HRMS", "معمارية معيارية من 12 خطوة لأتمتة كافة مراحل الخدمة فوق نظام Oracle EBS")}
          </div>
        </div>
        <button
          onClick={runSimulation}
          disabled={simulating}
          className="btn-primary text-xs !bg-nama-teal hover:!bg-teal-700 disabled:opacity-50 flex items-center gap-1.5"
        >
          <Play size={14} className={simulating ? "animate-spin" : ""} />
          {simulating ? L("Executing Workflow...", "جاري تشغيل مسار الأتمتة...") : L("Run End-to-End Simulation", "تشغيل المحاكاة الكاملة للمرحلة")}
        </button>
      </div>

      {/* 10-Stage Interactive Progression Rail */}
      <div className="panel p-3 bg-white overflow-x-auto scroll-thin">
        <div className="flex gap-2 min-w-max">
          {STAGES.map((stg) => {
            const isSelected = selectedStage.id === stg.id;
            return (
              <button
                key={stg.id}
                onClick={() => setSelectedStage(stg)}
                className={`p-2.5 rounded-xl border text-start transition min-w-[170px] ${
                  isSelected
                    ? "bg-teal-50 border-nama-teal shadow-xs ring-1 ring-nama-teal"
                    : "bg-slate-50 border-slate-200 hover:bg-slate-100"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`w-5 h-5 rounded-full text-[11px] font-bold flex items-center justify-center ${
                    isSelected ? "bg-nama-teal text-white" : "bg-slate-200 text-slate-700"
                  }`}>
                    {stg.id}
                  </span>
                  <span className="chip bg-white border border-slate-200 text-[10px] font-mono">
                    Score {stg.score}
                  </span>
                </div>
                <div className="text-xs font-bold text-slate-800 line-clamp-1">
                  {lang === "ar" ? stg.nameAr : stg.nameEn}
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  {stg.volume} Vol · {stg.manualEffort} Effort
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Stage Detail & Execution Canvas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left 2 Cols: Standardized 12-Step Automation Steps */}
        <div className="lg:col-span-2 panel p-4 bg-white space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div>
              <div className="font-bold text-base text-navy">
                {lang === "ar" ? selectedStage.nameAr : selectedStage.nameEn}
              </div>
              <div className="text-xs text-slate-500 mt-0.5">
                {lang === "ar" ? selectedStage.descAr : selectedStage.descEn}
              </div>
            </div>
            <span className="chip bg-emerald-50 text-emerald-700 border border-emerald-200">
              {selectedStage.ebsApiReadiness}
            </span>
          </div>

          <div className="space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
              {L("Standardized Automated Workflow Execution Steps", "خطوات تنفيذ المسار المؤتمت المعياري")}
            </div>

            <div className="space-y-2">
              {selectedStage.steps.map((step, idx) => {
                const isCurrent = activeStepIdx === idx;
                const isPassed = activeStepIdx !== null && activeStepIdx > idx;

                return (
                  <div
                    key={step.step}
                    className={`p-3 rounded-xl border transition-all flex items-center justify-between ${
                      isCurrent
                        ? "bg-amber-50 border-amber-400 shadow-sm"
                        : isPassed
                        ? "bg-emerald-50 border-emerald-300"
                        : "bg-slate-50 border-slate-200"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-7 h-7 rounded-lg text-xs font-bold flex items-center justify-center ${
                        isCurrent
                          ? "bg-amber-500 text-white animate-pulse"
                          : isPassed
                          ? "bg-emerald-600 text-white"
                          : "bg-slate-200 text-slate-600"
                      }`}>
                        {isPassed ? <CheckCircle2 size={16} /> : step.step}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-800">
                          {lang === "ar" ? step.titleAr : step.titleEn}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {L("Execution Actor", "المنفذ")}: <span className="mono font-semibold">{step.actor}</span>
                        </div>
                      </div>
                    </div>

                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                      isCurrent
                        ? "bg-amber-200 text-amber-900 font-bold"
                        : isPassed
                        ? "bg-emerald-200 text-emerald-900"
                        : "bg-slate-200 text-slate-600"
                    }`}>
                      {isCurrent ? "RUNNING..." : isPassed ? "COMPLETED" : "READY"}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Col: Prioritization & Release-1 Metrics */}
        <div className="panel p-4 bg-white space-y-4">
          <div className="font-bold text-sm text-navy pb-2 border-b border-slate-200">
            {L("Release-1 Automation Scoring (Sec 12.3)", "تقييم أولوية الأتمتة للإصدار الأول (البند 12.3)")}
          </div>

          <div className="space-y-3 text-xs">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex justify-between items-center">
              <div>
                <div className="text-slate-500">{L("Prioritization Score", "درجة الأولوية الكلية")}</div>
                <div className="text-2xl font-black text-nama-teal mt-0.5">{selectedStage.score} <span className="text-xs font-normal text-slate-500">/ 100</span></div>
              </div>
              <Award className="text-nama-teal" size={32} />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center p-2 rounded bg-slate-50">
                <span className="text-slate-600">{L("Annual Transaction Volume", "حجم المعاملات السنوي")}</span>
                <span className="font-bold text-slate-800">{selectedStage.volume}</span>
              </div>
              <div className="flex justify-between items-center p-2 rounded bg-slate-50">
                <span className="text-slate-600">{L("Current Manual Effort", "الجهد اليدوي الحالي")}</span>
                <span className="font-bold text-rose-600">{selectedStage.manualEffort}</span>
              </div>
              <div className="flex justify-between items-center p-2 rounded bg-slate-50">
                <span className="text-slate-600">{L("Oracle EBS API Readiness", "جاهزية واجهات Oracle")}</span>
                <span className="font-bold text-emerald-700">{selectedStage.ebsApiReadiness}</span>
              </div>
            </div>

            <div className="p-3 bg-teal-50 rounded-xl border border-teal-200 text-[11px] text-teal-900 leading-relaxed">
              <div className="font-bold mb-1">💡 {L("Architectural Guarantee:", "الضمان المعماري:")}</div>
              {L(
                "All 10 stages operate via API Gateway & Oracle Integration Cloud (OIC) with zero core database schema modification, fully compliant with Oman PDPL data sovereignty rules.",
                "كافة المراحل العشر تعمل عبر بوابة الواجهات و OIC بدون أي تعديل في قاعدة بيانات Oracle الأساسية، ومتوافقة تماماً مع قانون حماية البيانات العُماني."
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
