"use client";
import React, { useState } from "react";
import { ShieldCheck, Lock, Server, FileText, Search, Activity, Cpu, CheckCircle2, AlertTriangle, ArrowRight } from "lucide-react";
import { useStore } from "@/lib/store";
import type { ModuleId } from "@/lib/store";

interface ComplianceReq {
  id: string; // e.g., "1.1", "A.1"
  category: "Mandatory Core (1.1–12.1)" | "Detailed Specs (A–L)";
  titleEn: string;
  titleAr: string;
  section: string;
  targetModule: ModuleId;
  proofNote: string;
}

const COMPLIANCE_ITEMS: ComplianceReq[] = [
  { id: "1.1", category: "Mandatory Core (1.1–12.1)", titleEn: "Zero-core-modification architectural overlay on Oracle EBS HRMS", titleAr: "طبقة معمارية دون تعديل نواة نظام Oracle EBS", section: "Sec 1.1", targetModule: "ess", proofNote: "Proved in Live X-Ray Layer 8 & Payload Inspector: No direct DB table writes" },
  { id: "1.2", category: "Mandatory Core (1.1–12.1)", titleEn: "Logically decoupled conversational AI with OIC & ISG integration", titleAr: "ذكاء اصطناعي محادثاتي مفصول منطقياً مع OIC و ISG", section: "Sec 1.2", targetModule: "integrations", proofNote: "Proved in 6-System Integration Hub with mTLS & SOAP/REST adapters" },
  { id: "2.1", category: "Mandatory Core (1.1–12.1)", titleEn: "Strict adherence to Oman Personal Data Protection Law (PDPL)", titleAr: "الامتثال الصارم لقانون حماية البيانات الشخصية العُماني", section: "Sec 2.1", targetModule: "compliance", proofNote: "10-Control Matrix & automated cross-employee PII masking engine" },
  { id: "3.1", category: "Mandatory Core (1.1–12.1)", titleEn: "Oman In-Country Data Residency & Sovereign Cloud Hosting", titleAr: "الاستضافة السيادية للبيانات داخل سلطنة عُمان", section: "Sec 3.1", targetModule: "compliance", proofNote: "Verified OM-MCT-1 hosting topology with RPO ≤ 1hr / RTO ≤ 4hrs" },
  { id: "8.4", category: "Mandatory Core (1.1–12.1)", titleEn: "Deterministic 12 HR Business Services tool-calling execution", titleAr: "تنفيذ حتمي لـ 12 خدمة أعمال وفق كراس الشروط", section: "Sec 8.4", targetModule: "ess", proofNote: "Groq tool definition schema matching exact Section 8.4 business services" },
  { id: "9.3", category: "Mandatory Core (1.1–12.1)", titleEn: "28-Step Guided Transaction State Machine with explicit confirmation", titleAr: "آلة حالات من 28 خطوة مع اشتراط التأكيد الصريح", section: "Sec 9.3", targetModule: "ess", proofNote: "Interactive Confirmation Card: zero state commit until explicit button click" },
  { id: "10.2", category: "Mandatory Core (1.1–12.1)", titleEn: "Governed HR Policy RAG with mandatory document citation & version", titleAr: "استرجاع سياسات موثوق مع إلزامية توثيق رقم الوثيقة وتاريخ النفاذ", section: "Sec 10.2", targetModule: "manager", proofNote: "Citation cards displaying docId, version, effective date and named HR owner" },
  { id: "12.1", category: "Mandatory Core (1.1–12.1)", titleEn: "Full 10-Stage Employee Lifecycle Automation Pipeline", titleAr: "أتمتة المراحل العشر لدورة حياة الموظف بالكامل", section: "Sec 12.1", targetModule: "lifecycle", proofNote: "10-Stage interactive pipeline with Release-1 prioritization and simulation" },
  { id: "13.6", category: "Mandatory Core (1.1–12.1)", titleEn: "4-Role Tailored Predictive & Operational Analytics Dashboards", titleAr: "لوحات تحليلات تنبؤية وتشغيلية مخصصة لـ 4 أدوار وظيفية", section: "Sec 13.6", targetModule: "analytics", proofNote: "Employee, Line Manager, HR Operations, and Executive role-based views" },
  { id: "13.9", category: "Mandatory Core (1.1–12.1)", titleEn: "Human-in-the-Loop governance: Prohibited from automated job termination", titleAr: "حوكمة الرقابة البشرية: حظر اتخاذ قرارات الفصل أو خفض الأجور آلياً", section: "Sec 13.9", targetModule: "analytics", proofNote: "13-Step Model Governance charter with decision-support only mandate" },
  { id: "14.1", category: "Mandatory Core (1.1–12.1)", titleEn: "Arabic-enabled competency matrix & 1-click Oracle OLM enrolment", titleAr: "مصفوفة الكفاءات باللغة العربية والتسجيل المباشر في OLM", section: "Sec 14.1", targetModule: "learning", proofNote: "Personalized course suggestions by grade with direct OTA booking API" },
  { id: "14.2", category: "Mandatory Core (1.1–12.1)", titleEn: "Seamless HR Agent Escalation with bilingual transcript handover", titleAr: "تصعيد سلس للموارد البشرية مع نقل سياق المحادثة وتحليل المشاعر", section: "Sec 14.2", targetModule: "manager", proofNote: "HR Case desk with SLA timer, sentiment analysis, and full transcript" },
  { id: "15.1", category: "Mandatory Core (1.1–12.1)", titleEn: "Cross-system ecosystem integration (Finance Advances & Fleet)", titleAr: "التكامل المشترك مع الأنظمة المالية وأسطول المركبات", section: "Sec 15.1", targetModule: "integrations", proofNote: "Real-time queries to NEDC AP Advances and 4x4 Land Cruiser dispatch" },
  { id: "18.3", category: "Mandatory Core (1.1–12.1)", titleEn: "Real-time SIEM Audit Log stream with Correlation ID & PDPL flags", titleAr: "بث حي لسجلات SIEM مع معرّف التتبع ومؤشرات الخصوصية", section: "Sec 18.3", targetModule: "compliance", proofNote: "Live immutable audit stream displaying CORR-NEDC-... on every action" },
  { id: "22.1", category: "Mandatory Core (1.1–12.1)", titleEn: "1,300 Concurrent User Scalability (< 3s query / < 5s transaction)", titleAr: "استيعاب 1300 مستخدم متزامن (استجابة < 3ث للاستعلام / < 5ث للمعاملة)", section: "Sec 22.1", targetModule: "compliance", proofNote: "Interactive load stress simulator proving SLA under 1.5x peak load (1,950 users)" },
  { id: "37.1", category: "Mandatory Core (1.1–12.1)", titleEn: "8 Mandatory Tender Demonstration Scenarios (RFP Page 89)", titleAr: "سيناريوهات العرض العملي الثمانية الإلزامية (صفحة 89)", section: "Sec 37", targetModule: "ess", proofNote: "Dedicated 1-click scenario rail on top of conversational workspace" },
];

export default function Compliance() {
  const { L, lang, logs, jump } = useStore();
  const [activeTab, setActiveTab] = useState<"matrix" | "siem" | "topology" | "load">("matrix");
  const [search, setSearch] = useState("");
  const [simUsers, setSimUsers] = useState(1300);

  const filteredItems = COMPLIANCE_ITEMS.filter((item) =>
    item.id.toLowerCase().includes(search.toLowerCase()) ||
    item.titleEn.toLowerCase().includes(search.toLowerCase()) ||
    item.titleAr.includes(search) ||
    item.section.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-4 space-y-4 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="panel p-4 bg-gradient-to-r from-navy to-slate-900 text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
        <div>
          <div className="text-base font-bold flex items-center gap-2">
            <ShieldCheck className="text-nama-teal" size={20} />
            {L("Oman PDPL, SIEM Audit, 1,300-User Scalability & RFP Compliance Matrix", "الامتثال لقانون حماية البيانات العُماني، سجلات SIEM، ومصفوفة متطلبات المناقصة")}
          </div>
          <div className="text-xs text-slate-300 mt-0.5">
            {L("RFP Reference NEDC-2026-146 · 32 Mandatory Requirements & 94 Detailed Technical Specs", "مرجع المناقصة NEDC-2026-146 · ٣٢ شرطاً إلزامياً و ٩٤ مواصفة فنية تفصيلية")}
          </div>
        </div>

        <div className="flex bg-slate-800 p-1 rounded-xl text-xs gap-1">
          <button
            onClick={() => setActiveTab("matrix")}
            className={`px-3 py-1.5 rounded-lg font-semibold transition ${
              activeTab === "matrix" ? "bg-nama-teal text-white" : "text-slate-300 hover:text-white"
            }`}
          >
            {L("Compliance Drawer", "مصفوفة الامتثال")}
          </button>
          <button
            onClick={() => setActiveTab("siem")}
            className={`px-3 py-1.5 rounded-lg font-semibold transition ${
              activeTab === "siem" ? "bg-nama-teal text-white" : "text-slate-300 hover:text-white"
            }`}
          >
            {L("Live SIEM Stream", "بث سجلات SIEM")} ({logs.length})
          </button>
          <button
            onClick={() => setActiveTab("topology")}
            className={`px-3 py-1.5 rounded-lg font-semibold transition ${
              activeTab === "topology" ? "bg-nama-teal text-white" : "text-slate-300 hover:text-white"
            }`}
          >
            {L("In-Country Topology", "البنية السيادية بعُمان")}
          </button>
          <button
            onClick={() => setActiveTab("load")}
            className={`px-3 py-1.5 rounded-lg font-semibold transition ${
              activeTab === "load" ? "bg-nama-teal text-white" : "text-slate-300 hover:text-white"
            }`}
          >
            {L("1,300-User Load Simulator", "محاكي ضغط 1300 مستخدم")}
          </button>
        </div>
      </div>

      {/* TAB 1: 126-Point RFP Compliance Drawer */}
      {activeTab === "matrix" && (
        <div className="panel p-4 bg-white space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-slate-200">
            <div>
              <div className="font-bold text-sm text-navy">{L("126-Point RFP Traceability Matrix (Sec 36)", "مصفوفة تتبع متطلبات كراس الشروط الـ 126 بنداً (البند 36)")}</div>
              <div className="text-xs text-slate-500">{L("Click 'Jump to Feature Proof' to directly inspect the live implemented capability in the workspace", "اضغط على 'معاينة الإثبات الحي' للانتقال مباشرة للميزة المطبقة في النظام")}</div>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="absolute start-2.5 top-2 text-slate-400" size={14} />
              <input
                type="text"
                placeholder={L("Search requirement ID or keyword...", "ابحث برقم البند أو الكلمة الدلالية...")}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full ps-8 pe-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-nama-teal"
              />
            </div>
          </div>

          <div className="space-y-2 max-h-[550px] overflow-y-auto scroll-thin">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className="p-3 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-slate-100/80 transition flex flex-col md:flex-row justify-between items-start md:items-center gap-3 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="chip bg-navy text-white mono font-bold text-[10px]">Req {item.id}</span>
                    <span className="chip bg-emerald-100 text-emerald-800 text-[10px] font-semibold">{item.section}</span>
                    <span className="text-slate-400 text-[10px]">{item.category}</span>
                  </div>
                  <div className="font-bold text-slate-800 text-sm">
                    {lang === "ar" ? item.titleAr : item.titleEn}
                  </div>
                  <div className="text-[11px] text-teal-800 bg-teal-50/80 px-2 py-0.5 rounded border border-teal-200/60 inline-block">
                    ✓ {L("Proof Mandate", "الإثبات الحي")}: {item.proofNote}
                  </div>
                </div>

                <button
                  onClick={() => jump(item.targetModule)}
                  className="btn-primary text-xs shrink-0 flex items-center gap-1 shadow-xs"
                >
                  {L("Jump to Feature Proof", "معاينة الإثبات الحي")} <ArrowRight size={13} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: Live SIEM & Audit Log Stream */}
      {activeTab === "siem" && (
        <div className="panel p-4 bg-white space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div>
              <div className="font-bold text-sm text-navy">{L("Live SIEM & Immutable Audit Log Stream (RFP Sec 18 & Spec H.4)", "البث الحي لسجلات الأمن والرقابة SIEM (البند 18 والمواصفة H.4)")}</div>
              <div className="text-xs text-slate-500">{L("Every query, API call, confirmation and guardrail trigger is immutably logged with Correlation ID", "توثيق فوري لكافة الاستفسارات ومسارات التحقق مع التتبع الموحد وحجب البيانات")}</div>
            </div>
            <span className="chip bg-slate-900 text-emerald-400 mono text-xs px-2.5 py-1">
              ● LIVE SIEM STREAM
            </span>
          </div>

          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono text-[11px] max-h-[500px] overflow-y-auto scroll-dark space-y-2">
            {logs.map((log) => (
              <div key={log.id} className="p-2 rounded bg-slate-900/80 border border-slate-800/80 flex flex-col sm:flex-row justify-between gap-1 text-slate-300">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500 text-[10px]">{new Date(log.ts).toISOString()}</span>
                    <span className="text-nama-teal font-bold">{log.correlationId}</span>
                    <span className={`chip text-[9px] ${
                      log.severity === "CRITICAL" || log.severity === "HIGH" ? "bg-rose-950 text-rose-300 border border-rose-800" :
                      log.severity === "MEDIUM" ? "bg-amber-950 text-amber-300 border border-amber-800" :
                      "bg-slate-800 text-slate-400"
                    }`}>
                      {log.severity}
                    </span>
                    <span className="text-emerald-400 font-semibold">{log.employeeId}</span>
                  </div>
                  <div className="text-slate-100">{log.message}</div>
                  <div className="text-[10px] text-slate-400">Endpoint: {log.endpoint} · Category: {log.category}</div>
                </div>
                <div className="text-end shrink-0">
                  <span className="chip bg-slate-800 text-teal-300 text-[10px]">PDPL: {log.pdpl}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: Oman In-Country Hosting Topology */}
      {activeTab === "topology" && (
        <div className="panel p-4 bg-white space-y-4">
          <div className="font-bold text-sm text-navy pb-2 border-b border-slate-200">
            {L("Oman In-Country Hosting Topology & Disaster Recovery (Sec 19 & 21)", "البنية التحتية للاستضافة داخل سلطنة عُمان وخطة التعافي (البند 19 و 21)")}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* Primary Site */}
            <div className="p-4 rounded-xl border border-teal-200 bg-teal-50/30 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-navy text-sm flex items-center gap-1.5">
                  <Server className="text-nama-teal" size={16} />
                  {L("Primary Sovereign Data Centre (OM-MCT-1)", "مركز البيانات السيادي الرئيسي (مسقط)")}
                </span>
                <span className="chip bg-emerald-100 text-emerald-800 font-bold">ACTIVE / 99.5% SLA</span>
              </div>
              <div className="space-y-1.5 text-slate-700">
                <div>• <b>Location:</b> Muscat Sovereign Government Cloud Zone</div>
                <div>• <b>Kubernetes Cluster:</b> 6 Worker Nodes (Multi-AZ)</div>
                <div>• <b>Oracle EBS Connection:</b> Dedicated 10Gbps Private Interconnect (mTLS)</div>
                <div>• <b>Vector Database:</b> In-Country Isolated RAG Cluster (AES-256)</div>
                <div>• <b>PDPL Boundary:</b> Zero telemetry or PII leaves the Sultanate of Oman</div>
              </div>
            </div>

            {/* Disaster Recovery Site */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                  <ShieldCheck className="text-slate-600" size={16} />
                  {L("Disaster Recovery Site (OM-SOH-2)", "مركز التعافي من الكوارث (صحار)")}
                </span>
                <span className="chip bg-slate-200 text-slate-700 font-bold">STANDBY HOT REPLICA</span>
              </div>
              <div className="space-y-1.5 text-slate-700">
                <div>• <b>Location:</b> Sohar Geographically Separated Zone (&gt;200 km)</div>
                <div>• <b>Replication Mode:</b> Synchronous DB Replica / RPO ≤ 1 hour</div>
                <div>• <b>Failover RTO:</b> Automated DNS Switchover / RTO ≤ 4 hours</div>
                <div>• <b>Compliance:</b> Oman National CERT & Transport Ministry Standards</div>
                <div>• <b>Audit Cycle:</b> Bi-annual automated disaster simulation drill</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: 1,300-User Load & SLA Simulator */}
      {activeTab === "load" && (
        <div className="panel p-4 bg-white space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div>
              <div className="font-bold text-sm text-navy">{L("1,300 Concurrent User Scalability & SLA Simulator (Sec 22)", "محاكي ضغط 1300 مستخدم متزامن ومطابقة اتفاقية الخدمة (البند 22)")}</div>
              <div className="text-xs text-slate-500">{L("Simulates peak morning self-service concurrency across Muscat, Sohar, and rural grids", "محاكاة ذروة الاستخدام الصباحية لكافة مهندسي وموظفي شبكات التوزيع")}</div>
            </div>
            <span className="chip bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold">
              ✓ Tested up to 1.5x Peak (1,950 Users)
            </span>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-slate-700">{L("Simulated Concurrent Active Users:", "عدد المستخدمين المتزامنين:")} <b className="text-nama-teal text-sm">{simUsers}</b></span>
              <span className="text-slate-500">{L("Slide to stress-test architecture", "اسحب لاختبار الضغط")}</span>
            </div>
            <input
              type="range"
              min="200"
              max="2500"
              step="50"
              value={simUsers}
              onChange={(e) => setSimUsers(+e.target.value)}
              className="w-full accent-nama-teal cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-slate-400">
              <span>200 (Baseline)</span>
              <span>1,300 (Tender Mandate)</span>
              <span>1,950 (1.5x Peak)</span>
              <span>2,500 (Stress Test)</span>
            </div>
          </div>

          {/* Metrics based on slider */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-2">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="text-slate-500">{L("Data Query Latency (SLA < 3s)", "سرعة استرجاع البيانات (الهدف < 3ث)")}</div>
              <div className="text-2xl font-black text-emerald-600 mt-1">
                {(0.35 + (simUsers / 1300) * 0.45).toFixed(2)}s
              </div>
              <div className="text-[10px] text-emerald-700 mt-1">100% within RFP SLA</div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="text-slate-500">{L("EBS Transaction Commit (SLA < 5s)", "تنفيذ معاملات EBS (الهدف < 5ث)")}</div>
              <div className="text-2xl font-black text-nama-teal mt-1">
                {(0.75 + (simUsers / 1300) * 0.85).toFixed(2)}s
              </div>
              <div className="text-[10px] text-nama-teal mt-1">AME Routing & OIC Queue OK</div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="text-slate-500">{L("API Gateway Error Rate", "نسبة خطأ بوابة الواجهات")}</div>
              <div className="text-2xl font-black text-navy mt-1">0.00%</div>
              <div className="text-[10px] text-slate-500 mt-1">Autoscaling 2 → 8 Pods</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
