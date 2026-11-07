"use client";
import React, { useState } from "react";
import { LineChart, BarChart3, TrendingUp, AlertTriangle, ShieldCheck, Users, Search, RefreshCw, CheckCircle2, ArrowUpRight, ArrowDownRight, Layers } from "lucide-react";
import { useStore } from "@/lib/store";
import type { Role } from "@/lib/types";

export default function Analytics() {
  const { L, lang, role, setRole, unresolved, setUnresolvedStatus, policies, addPolicy } = useStore();
  const [selectedRoleView, setSelectedRoleView] = useState<Role>(role);
  const [showGovModal, setShowGovModal] = useState(false);
  const [patchText, setPatchText] = useState("");

  return (
    <div className="p-4 space-y-4 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="panel p-4 bg-gradient-to-r from-navy to-slate-900 text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
        <div>
          <div className="text-base font-bold flex items-center gap-2">
            <LineChart className="text-nama-teal" size={20} />
            {L("Role-Based Predictive Analytics & Continuous Knowledge Loop (Sec 13)", "التحليلات التنبؤية القائمة على الأدوار وحلقة سد الفجوات المعرفية (البند 13)")}
          </div>
          <div className="text-xs text-slate-300 mt-0.5">
            {L("4-Role Tailored Dashboards, Governed Decision-Support AI & Unresolved Query Patching", "لوحات مخصصة لـ 4 أدوار، ذكاء اصطناعي داعم للقرار، وحلقة معالجة الأسئلة غير المجابة")}
          </div>
        </div>

        {/* 4-Role Dashboard Switcher */}
        <div className="flex bg-slate-800 p-1 rounded-xl text-xs gap-1">
          <button
            onClick={() => setSelectedRoleView("employee")}
            className={`px-2.5 py-1.5 rounded-lg font-semibold transition ${
              selectedRoleView === "employee" ? "bg-nama-teal text-white" : "text-slate-300 hover:text-white"
            }`}
          >
            {L("Employee", "موظف")}
          </button>
          <button
            onClick={() => setSelectedRoleView("manager")}
            className={`px-2.5 py-1.5 rounded-lg font-semibold transition ${
              selectedRoleView === "manager" ? "bg-nama-teal text-white" : "text-slate-300 hover:text-white"
            }`}
          >
            {L("Line Manager", "مدير مباشر")}
          </button>
          <button
            onClick={() => setSelectedRoleView("hr")}
            className={`px-2.5 py-1.5 rounded-lg font-semibold transition ${
              selectedRoleView === "hr" ? "bg-nama-teal text-white" : "text-slate-300 hover:text-white"
            }`}
          >
            {L("HR Operations", "عمليات الموارد")}
          </button>
          <button
            onClick={() => setSelectedRoleView("executive")}
            className={`px-2.5 py-1.5 rounded-lg font-semibold transition ${
              selectedRoleView === "executive" ? "bg-nama-teal text-white" : "text-slate-300 hover:text-white"
            }`}
          >
            {L("Executive View", "الإدارة العليا")}
          </button>
        </div>
      </div>

      {/* Governed Human-in-the-Loop Predictive Banner (Sec 13.9 - 13.11) */}
      <div className="panel p-3.5 bg-amber-50 border-amber-300 flex items-center justify-between text-xs text-amber-900">
        <div className="flex items-center gap-2">
          <ShieldCheck className="text-amber-700 shrink-0" size={18} />
          <div>
            <span className="font-bold">{L("Governed Human-in-the-Loop Predictive Guarantee (Sec 13.9):", "ضمان حوكمة النماذج التنبؤية بالتدخل البشري (البند 13.9):")}</span>{" "}
            {L(
              "Predictive AI indicators provide decision support only. The system is architecturally prohibited from automatically terminating, demoting, or altering employee compensation.",
              "النماذج التنبؤية توفر دعماً استشارياً فقط، وممنوعة معمارياً من إنهاء الخدمة أو النقل أو تعديل الراتب تلقائياً."
            )}
          </div>
        </div>
        <button
          onClick={() => setShowGovModal(true)}
          className="btn-ghost !py-1 text-xs text-amber-800 bg-white border border-amber-200 shrink-0 font-semibold"
        >
          {L("13-Step Model Governance", "دورة حوكمة النماذج الـ 13")}
        </button>
      </div>

      {/* VIEW 1: Employee View */}
      {selectedRoleView === "employee" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="panel p-4 bg-white">
            <div className="text-slate-500 text-xs font-semibold">{L("Annual Leave Utilization", "استهلاك الإجازة السنوية")}</div>
            <div className="text-2xl font-black text-navy mt-1">22.5 <span className="text-xs font-normal text-slate-500">/ 30 {L("days remaining", "يوم متبقي")}</span></div>
            <div className="w-full bg-slate-100 h-2 rounded-full mt-3 overflow-hidden">
              <div className="bg-nama-teal h-full w-[25%]" />
            </div>
            <div className="text-[11px] text-slate-400 mt-2">7.5 days taken (25% utilized)</div>
          </div>
          <div className="panel p-4 bg-white">
            <div className="text-slate-500 text-xs font-semibold">{L("Mandatory Certifications", "شهادات السلامة الإلزامية")}</div>
            <div className="text-2xl font-black text-emerald-600 mt-1">100% <span className="text-xs font-normal text-slate-500">{L("Compliance", "امتثال")}</span></div>
            <div className="text-[11px] text-slate-500 mt-2">HV Substation Safety v4 certified until Dec 2026</div>
          </div>
          <div className="panel p-4 bg-white">
            <div className="text-slate-500 text-xs font-semibold">{L("Self-Service Requests (2026)", "طلبات الخدمة الذاتية")}</div>
            <div className="text-2xl font-black text-navy mt-1">14 <span className="text-xs font-normal text-slate-500">{L("completed", "مكتملة")}</span></div>
            <div className="text-[11px] text-slate-500 mt-2">Average Oracle AME turnaround: 4.2 hours</div>
          </div>
        </div>
      )}

      {/* VIEW 2: Line Manager View */}
      {selectedRoleView === "manager" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="panel p-4 bg-white">
              <div className="text-slate-500 text-xs">{L("Direct Reports in Grid Ops", "فريق العمل المباشر")}</div>
              <div className="text-2xl font-black text-navy mt-1">18 <span className="text-xs font-normal text-slate-500">Engineers</span></div>
              <div className="text-[11px] text-emerald-600 mt-1 font-semibold">100% on active duty</div>
            </div>
            <div className="panel p-4 bg-white">
              <div className="text-slate-500 text-xs">{L("Team Leave Coverage", "تغطية مناوبات الإجازات")}</div>
              <div className="text-2xl font-black text-emerald-600 mt-1">94%</div>
              <div className="text-[11px] text-slate-500 mt-1">No overlapping shift gaps</div>
            </div>
            <div className="panel p-4 bg-white">
              <div className="text-slate-500 text-xs">{L("Avg Approval Turnaround", "متوسط وقت الاعتماد")}</div>
              <div className="text-2xl font-black text-nama-teal mt-1">2.8h</div>
              <div className="text-[11px] text-emerald-600 mt-1">↓ 68% faster with AI</div>
            </div>
            <div className="panel p-4 bg-white">
              <div className="text-slate-500 text-xs">{L("Team Overtime Cap", "سقف الساعات الإضافية")}</div>
              <div className="text-2xl font-black text-navy mt-1">8.4h <span className="text-xs font-normal text-slate-500">/ 12h max</span></div>
              <div className="text-[11px] text-slate-500 mt-1">Compliant with Labour Law</div>
            </div>
          </div>

          {/* Department Absence Forecaster */}
          <div className="panel p-4 bg-white">
            <div className="font-bold text-sm text-navy mb-2 flex items-center justify-between">
              <span>{L("Predictive Absence Forecaster — Ramadan & Summer 2026", "التنبؤ بنمط الإجازات والغياب — رمضان وصيف 2026")}</span>
              <span className="chip bg-teal-50 text-teal-800">ML Model v2.4 (Oman In-Country)</span>
            </div>
            <div className="text-xs text-slate-500 mb-3">
              {L("Forecasts seasonal grid operation staffing requirements based on historical EBS leave trends and holiday calendars.", "يتنبأ باحتياجات التغطية لمحطات التوزيع بناءً على بيانات الإجازات التاريخية في Oracle EBS.")}
            </div>
            <div className="grid grid-cols-4 gap-2 text-center text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="font-bold text-slate-700">Muscat Grid</div>
                <div className="text-lg font-black text-nama-teal mt-1">12% Peak</div>
                <div className="text-[10px] text-slate-400">Risk: Low</div>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="font-bold text-slate-700">Sohar Operations</div>
                <div className="text-lg font-black text-amber-600 mt-1">28% Peak</div>
                <div className="text-[10px] text-amber-700">Risk: Moderate (Standby buffer needed)</div>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="font-bold text-slate-700">Nizwa Substation</div>
                <div className="text-lg font-black text-nama-teal mt-1">9% Peak</div>
                <div className="text-[10px] text-slate-400">Risk: Low</div>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="font-bold text-slate-700">Rustaq & Ibri</div>
                <div className="text-lg font-black text-nama-teal mt-1">14% Peak</div>
                <div className="text-[10px] text-slate-400">Risk: Low</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 3: HR Operations View */}
      {selectedRoleView === "hr" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="panel p-4 bg-white">
              <div className="text-slate-500 text-xs">{L("Total Workforce (~1,300)", "إجمالي القوى العاملة")}</div>
              <div className="text-2xl font-black text-navy mt-1">1,342</div>
              <div className="text-[11px] text-slate-500 mt-1">Concurrent in Oracle HRMS</div>
            </div>
            <div className="panel p-4 bg-white">
              <div className="text-slate-500 text-xs">{L("AI Self-Service Deflection", "نسبة معالجة المساعد الذكي")}</div>
              <div className="text-2xl font-black text-emerald-600 mt-1">87.4%</div>
              <div className="text-[11px] text-emerald-700 mt-1">Handled without HR agent</div>
            </div>
            <div className="panel p-4 bg-white">
              <div className="text-slate-500 text-xs">{L("Avg Inquiry Resolution", "زمن إنجاز الاستفسار")}</div>
              <div className="text-2xl font-black text-nama-teal mt-1">1.4s</div>
              <div className="text-[11px] text-slate-500 mt-1">Groq Serverless + RAG</div>
            </div>
            <div className="panel p-4 bg-white">
              <div className="text-slate-500 text-xs">{L("Unresolved Queries (Action Loop)", "استفسارات بانتظار التحسين")}</div>
              <div className="text-2xl font-black text-amber-600 mt-1">{unresolved.filter((u) => u.status === "NEW").length}</div>
              <div className="text-[11px] text-amber-700 mt-1">Requires KB patching</div>
            </div>
          </div>

          {/* Unresolved Query Loop & Fix System (Sec 13.8 & 13.14) */}
          <div className="panel p-4 bg-white space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <div>
                <div className="font-bold text-sm text-navy">{L("Unresolved Query Analytics & Knowledge Patching Loop (Sec 13.8)", "تحليل الأسئلة غير المجابة وحلقة التحديث المعرفي (البند 13.8)")}</div>
                <div className="text-xs text-slate-500">{L("Breakdown of low-confidence intents, knowledge gaps, and timeouts with 1-click promotion to UAT", "حصر الاستفسارات المنخفضة الثقة وفجوات السياسات مع إمكانية الترقية لبيئة الاختبار بضغطة واحدة")}</div>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              {unresolved.map((item) => (
                <div key={item.id} className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className={`chip ${
                        item.reason === "Knowledge Gap" ? "bg-amber-100 text-amber-800" :
                        item.reason === "RBAC Refusal" ? "bg-rose-100 text-rose-800" :
                        item.reason === "EBS API Timeout" ? "bg-purple-100 text-purple-800" :
                        "bg-blue-100 text-blue-800"
                      }`}>
                        {item.reason}
                      </span>
                      <span className="mono text-[11px] text-slate-400">Conf: {item.confidence.toFixed(2)}</span>
                    </div>
                    <div className="font-bold text-slate-800 text-sm">"{item.text}"</div>
                    <div className="text-[10px] text-slate-400">{new Date(item.ts).toLocaleString()}</div>
                  </div>

                  <div className="flex items-center gap-2">
                    {item.status === "NEW" ? (
                      <>
                        <button
                          onClick={() => setUnresolvedStatus(item.id, "PATCHED")}
                          className="btn-ghost text-xs !py-1 text-teal-700 bg-teal-50 border border-teal-200"
                        >
                          {L("Patch Knowledge Base", "تحديث وتغذية القاعدة")}
                        </button>
                        <button
                          onClick={() => setUnresolvedStatus(item.id, "PROMOTED_TO_UAT")}
                          className="btn-primary text-xs !py-1"
                        >
                          {L("Promote Intent to UAT", "ترقية النموذج لـ UAT")}
                        </button>
                      </>
                    ) : (
                      <span className="chip bg-emerald-100 text-emerald-800 font-semibold">
                        {item.status}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* VIEW 4: Senior Management / Executive View */}
      {selectedRoleView === "executive" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="panel p-4 bg-white">
              <div className="text-slate-500 text-xs">{L("Workforce Across Oman Grids", "توزيع القوى العاملة بالشبكات")}</div>
              <div className="text-2xl font-black text-navy mt-1">1,342</div>
              <div className="text-[11px] text-slate-500 mt-1">Muscat (580), Sohar (340), Nizwa/Others (422)</div>
            </div>
            <div className="panel p-4 bg-white">
              <div className="text-slate-500 text-xs">{L("Omanisation Ratio in Engineering", "نسبة التعمين في الهندسة")}</div>
              <div className="text-2xl font-black text-emerald-600 mt-1">96.8%</div>
              <div className="text-[11px] text-emerald-700 mt-1">Exceeds national utility target</div>
            </div>
            <div className="panel p-4 bg-white">
              <div className="text-slate-500 text-xs">{L("5-Year Retirement Forecast", "توقعات التقاعد لخمس سنوات")}</div>
              <div className="text-2xl font-black text-amber-600 mt-1">64 <span className="text-xs font-normal text-slate-500">Engineers</span></div>
              <div className="text-[11px] text-slate-500 mt-1">Succession planning active</div>
            </div>
            <div className="panel p-4 bg-white">
              <div className="text-slate-500 text-xs">{L("Annual HR Operational Savings", "الوفر التشغيلي السنوي")}</div>
              <div className="text-2xl font-black text-nama-teal mt-1">OMR 184K</div>
              <div className="text-[11px] text-emerald-700 mt-1">Via zero-touch automated ESS</div>
            </div>
          </div>

          <div className="panel p-4 bg-white">
            <div className="font-bold text-sm text-navy mb-2">{L("Lean Workforce Span of Control & Grid Distribution", "نطاق الإشراف وتوزيع شبكات التوزيع بالسلطنة")}</div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs mt-3">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="font-bold text-slate-700">{L("Capital Region (Muscat)", "محافظة مسقط")}</div>
                <div className="text-xs text-slate-500 mt-1">Span of Control: 1:7.2 (Optimal)</div>
                <div className="text-xs text-slate-500">Grid Substations: 42 active</div>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="font-bold text-slate-700">{L("North Al Batinah (Sohar)", "شمال الباطنة (صحار)")}</div>
                <div className="text-xs text-slate-500 mt-1">Span of Control: 1:6.8</div>
                <div className="text-xs text-slate-500">Industrial Grid Peak Capacity: 98%</div>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="font-bold text-slate-700">{L("Al Dakhiliyah & Al Dhahirah (Nizwa/Ibri)", "الداخلية والظاهرة (نزوى/عبري)")}</div>
                <div className="text-xs text-slate-500 mt-1">Span of Control: 1:5.9</div>
                <div className="text-xs text-slate-500">Rural Grid Coverage: 100%</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 13-Step Model Governance Modal */}
      {showGovModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="panel p-5 w-full max-w-2xl bg-white space-y-3">
            <div className="flex justify-between items-center font-bold text-base text-navy pb-2 border-b">
              <span>{L("13-Step Predictive Model Governance Lifecycle (Sec 13.9)", "دورة حوكمة النماذج التنبؤية الـ 13 خطوة (البند 13.9)")}</span>
              <button onClick={() => setShowGovModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <div className="space-y-2 text-xs max-h-96 overflow-y-auto scroll-thin">
              {[
                "1. Problem Definition & Ethical Utility Review",
                "2. Oman PDPL Data Minimisation & Anonymisation Check",
                "3. In-Country Data Extraction from Oracle EBS Replica (read-only)",
                "4. Bias & Demographic Parity Auditing (Omanisation protected)",
                "5. Supervised Training on Local GPU Cluster (OM-MCT-1)",
                "6. Offline Performance Validation (AUC ≥ 0.88, F1 ≥ 0.84)",
                "7. Explainability & SHAP Feature Attribution Verification",
                "8. Human-in-the-Loop Safeguard: Mandatory Human Approver Gate",
                "9. Security Penetration & Adversarial Prompt Testing",
                "10. Staging in NEDC UAT Environment with HR Committee Sign-off",
                "11. Canary Deployment (10% of Workforce, Read-Only Advisory)",
                "12. Continuous Drift & Performance Monitoring via SIEM",
                "13. Scheduled Quarterly Re-training and Retiring Policy",
              ].map((step, idx) => (
                <div key={idx} className="p-2 bg-slate-50 rounded border border-slate-200 font-medium text-slate-800">
                  {step}
                </div>
              ))}
            </div>
            <div className="flex justify-end pt-2">
              <button onClick={() => setShowGovModal(false)} className="btn-primary text-xs">
                {L("Close Governance Charter", "إغلاق وثيقة الحوكمة")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
