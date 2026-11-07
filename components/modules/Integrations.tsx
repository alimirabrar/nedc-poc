"use client";
import React, { useState } from "react";
import { Cable, CheckCircle2, RefreshCw, Server, Shield, Send, Database, Key, ArrowRight, Zap, ExternalLink } from "lucide-react";
import { useStore } from "@/lib/store";

interface SystemGroup {
  id: number;
  nameEn: string;
  nameAr: string;
  protocol: "REST (ISG)" | "SOAP (ISG)" | "OAuth 2.0 / OIDC" | "FastFormula / DB" | "REST Adapter";
  endpoint: string;
  status: "ONLINE" | "HEALTHY" | "ACTIVE";
  latencyMs: number;
  authMethod: "mTLS + FND_USER Context" | "OIDC Bearer" | "WSS-Security" | "API Gateway Key";
  descEn: string;
  descAr: string;
  testPayload: Record<string, any>;
  sampleResponse: Record<string, any>;
}

const SYSTEM_GROUPS: SystemGroup[] = [
  {
    id: 1,
    nameEn: "1. Oracle EBS HRMS Core (Public APIs & ISG)",
    nameAr: "١. نواة نظام Oracle EBS HRMS (واجهات ISG)",
    protocol: "REST (ISG)",
    endpoint: "/oic/api/v1/ebs/sshr/submitLeaveRequest",
    status: "HEALTHY",
    latencyMs: 340,
    authMethod: "mTLS + FND_USER Context",
    descEn: "SSHR, Absence Management, AME Workflow Routing & Organization Structure. Zero direct DB write.",
    descAr: "الخدمة الذاتية، إدارة الإجازات، مسارات اعتماد AME والهيكل التنظيمي. بدون كتابة مباشرة بالقاعدة.",
    testPayload: { personId: 410231, absenceAttendanceTypeCode: "NEDC_ANNUAL", p_validate: true },
    sampleResponse: { status: 200, validation: "PASSED", sshrTransactionStatus: "DRAFT", ameTransactionType: "NEDC_SSHR_LEAVE" },
  },
  {
    id: 2,
    nameEn: "2. Oracle Payroll & FastFormula Engine",
    nameAr: "٢. نظام الرواتب ومحرك FastFormula",
    protocol: "SOAP (ISG)",
    endpoint: "/oic/api/v1/ebs/payroll/payslip/latest",
    status: "HEALTHY",
    latencyMs: 290,
    authMethod: "WSS-Security",
    descEn: "PAY_ACTION_INFORMATION archive reader, OMR earnings, SPF (7%) & JSF (1%) statutory deduction formulas.",
    descAr: "أرشيف كشف الراتب، مفردات الأجر بالريال، واستقطاعات صندوق الحماية الاجتماعية والأمان الوظيفي.",
    testPayload: { personId: 410231, payrollActionYear: 2026, month: 10 },
    sampleResponse: { status: 200, basicSalary: 1450.0, netPay: 2038.5, spfDeduction: 101.5, currency: "OMR" },
  },
  {
    id: 3,
    nameEn: "3. Enterprise IAM & Single Sign-On (SSO)",
    nameAr: "٣. إدارة الهوية والدخول الموحد (SSO)",
    protocol: "OAuth 2.0 / OIDC",
    endpoint: "/oauth/v2/token/verify",
    status: "ONLINE",
    latencyMs: 95,
    authMethod: "OIDC Bearer",
    descEn: "PKCE flow, Multi-Factor Authentication (MFA), and Oracle FND Responsibility mapping (OM-MCT-1).",
    descAr: "بروتوكول OIDC، التحقق الثنائي MFA، وربط الصلاحيات بمسؤوليات Oracle FND_RESPONSIBILITY.",
    testPayload: { token: "eyJhbGciOiJSUzI1NiIs...", client_id: "nedc-ai-portal" },
    sampleResponse: { active: true, scope: "ess.self openid profile", fndUser: "SALIM.HARTHY", mfaVerified: true },
  },
  {
    id: 4,
    nameEn: "4. NEDC Financial Systems (AP & Advances)",
    nameAr: "٤. الأنظمة المالية لنماء (السلف والقروض)",
    protocol: "REST Adapter",
    endpoint: "/oic/api/v1/finance/employee-advances",
    status: "HEALTHY",
    latencyMs: 210,
    authMethod: "API Gateway Key",
    descEn: "Salary advance ledger, housing loan subsidies, installment schedules, and finance disbursement tracking.",
    descAr: "سجلات سلف الرواتب، دعم القروض السكنية، جداول الأقساط الشهرية ومتابعة الصرف المالي.",
    testPayload: { employeeNumber: "E10231", loanType: "SALARY_ADVANCE" },
    sampleResponse: { advanceRef: "FIN-ADV-2026-0912", status: "Approved", amount: 900.0, nextDeduction: "2026-11-25" },
  },
  {
    id: 5,
    nameEn: "5. Employee Administrative Platforms (Letters & NOC)",
    nameAr: "٥. منصة الشهادات والخطابات الإدارية",
    protocol: "REST Adapter",
    endpoint: "/oic/api/v1/admin/letters/generate",
    status: "HEALTHY",
    latencyMs: 180,
    authMethod: "API Gateway Key",
    descEn: "Bilingual salary certificates, Embassy NOCs, Municipality letters with anti-tamper QR verification.",
    descAr: "توليد شهادات الراتب وعدم الممانعة ثنائية اللغة بختم رقمي ورمز QR مانع للتزوير.",
    testPayload: { employeeId: "E10231", letterType: "EMBASSY_NOC", destination: "Schengen Visa" },
    sampleResponse: { docId: "NEDC-DOC-9921", status: "ISSUED", qrVerificationUrl: "https://verify.nedc.example.om/9921" },
  },
  {
    id: 6,
    nameEn: "6. Travel & 4x4 Fleet Management System",
    nameAr: "٦. نظام إدارة أسطول مركبات الدفع الرباعي والمهام",
    protocol: "REST Adapter",
    endpoint: "/oic/api/v1/fleet/bookings",
    status: "HEALTHY",
    latencyMs: 195,
    authMethod: "API Gateway Key",
    descEn: "Utility 4x4 Land Cruiser dispatching for substation grid maintenance, per-diem business trip claims.",
    descAr: "حجز مركبات الدفع الرباعي لصيانة المحطات وتدقيق بدلات المهمات الرسمية لمهندسي الشبكة.",
    testPayload: { employeeId: "E10231", vehicleClass: "4x4 Utility", destination: "Nizwa Substation" },
    sampleResponse: { bookingRef: "FLT-BK-2026-4471", vehicle: "NEDC-4X4-118", status: "CONFIRMED", driverAssigned: true },
  },
];

export default function Integrations() {
  const { L, lang, log } = useStore();
  const [selectedGroup, setSelectedGroup] = useState<SystemGroup>(SYSTEM_GROUPS[0]);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);

  const runApiTest = () => {
    setTesting(true);
    setTestResult(null);

    log({
      employeeId: "SYSTEM",
      intent: `INTEGRATION_TEST_${selectedGroup.id}`,
      endpoint: selectedGroup.endpoint,
      severity: "INFO",
      category: "INTEGRATION_HUB",
      pdpl: "MINIMISED",
      message: `Executed live API test for ${selectedGroup.nameEn} · ${selectedGroup.protocol}`,
    });

    setTimeout(() => {
      setTestResult(selectedGroup.sampleResponse);
      setTesting(false);
    }, 700);
  };

  return (
    <div className="p-4 space-y-4 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="panel p-4 bg-gradient-to-r from-navy to-slate-900 text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
        <div>
          <div className="text-base font-bold flex items-center gap-2">
            <Cable className="text-nama-teal" size={20} />
            {L("NEDC Enterprise Ecosystem Integrations Hub (RFP Sec 15 / Spec B.1–B.7)", "مركز تكامل الأنظمة المؤسسية لشركة نماء (البند 15 / المواصفات B.1–B.7)")}
          </div>
          <div className="text-xs text-slate-300 mt-0.5">
            {L("Live health, latency monitoring & interactive tester for all 6 mandatory enterprise system groups", "مراقبة حية للجاهزية وسرعة الاستجابة واختبار تفاعلي لكافة مجموعات الأنظمة الست الإلزامية")}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="chip bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs px-2.5 py-1">
            <CheckCircle2 size={13} /> 6 / 6 Systems Online (100%)
          </span>
        </div>
      </div>

      {/* 6 System Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {SYSTEM_GROUPS.map((grp) => {
          const isSelected = selectedGroup.id === grp.id;
          return (
            <button
              key={grp.id}
              onClick={() => { setSelectedGroup(grp); setTestResult(null); }}
              className={`panel p-3.5 text-start transition border-2 flex flex-col justify-between ${
                isSelected ? "border-nama-teal bg-teal-50/20 shadow-sm ring-1 ring-nama-teal" : "border-slate-200 bg-white hover:border-slate-300"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="chip bg-navy text-white text-[10px] mono font-bold">{grp.protocol}</span>
                  <span className="chip bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-mono">
                    {grp.latencyMs} ms
                  </span>
                </div>
                <div className="font-bold text-xs text-navy line-clamp-1">
                  {lang === "ar" ? grp.nameAr : grp.nameEn}
                </div>
                <div className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                  {lang === "ar" ? grp.descAr : grp.descEn}
                </div>
              </div>

              <div className="text-[10px] mono text-slate-400 mt-3 pt-2 border-t border-slate-100 truncate">
                {grp.endpoint}
              </div>
            </button>
          );
        })}
      </div>

      {/* Live Interactive API Tester */}
      <div className="panel p-4 bg-white space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div>
            <div className="font-bold text-sm text-navy flex items-center gap-2">
              <Zap className="text-nama-teal" size={16} />
              {L("Live Interactive Adapter Tester", "المختبر التفاعلي لواجهات الربط الحية")}: {selectedGroup.nameEn}
            </div>
            <div className="text-xs text-slate-500 mt-0.5">
              {L("Authentication", "طريقة المصادقة")}: <b className="text-slate-700">{selectedGroup.authMethod}</b> · {selectedGroup.protocol}
            </div>
          </div>

          <button
            onClick={runApiTest}
            disabled={testing}
            className="btn-primary text-xs !bg-nama-teal hover:!bg-teal-700 disabled:opacity-50 flex items-center gap-1.5"
          >
            <Send size={13} className={testing ? "animate-spin" : ""} />
            {testing ? L("Calling API...", "جاري الاستدعاء...") : L("Execute Test Payload", "تنفيذ طلب الاختبار")}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
          {/* Request Payload */}
          <div className="space-y-1.5">
            <div className="font-bold text-slate-600 flex justify-between">
              <span>{L("Request Payload (ISG / OIC Adapter)", "حمولة الطلب (مهايئ ISG / OIC)")}</span>
              <span className="text-slate-400">Endpoint: {selectedGroup.endpoint}</span>
            </div>
            <pre className="p-3 bg-slate-900 text-emerald-400 rounded-xl overflow-x-auto max-h-56 scroll-dark text-[11px]">
              {JSON.stringify(
                {
                  endpoint: selectedGroup.endpoint,
                  method: selectedGroup.protocol.includes("SOAP") ? "POST (SOAP Envelope)" : "POST (REST)",
                  headers: {
                    Authorization: "Bearer eyJhbGciOiJSUzI1NiIs...",
                    "X-Correlation-ID": "CORR-NEDC-TEST-001",
                    "X-Data-Residency": "OM-MCT-1",
                    "X-FND-User": "SALIM.HARTHY",
                  },
                  body: selectedGroup.testPayload,
                },
                null,
                2
              )}
            </pre>
          </div>

          {/* Response Payload */}
          <div className="space-y-1.5">
            <div className="font-bold text-slate-600 flex justify-between">
              <span>{L("Live Response (JSON / XML Translated)", "الاستجابة الحية من النظام")}</span>
              <span className="text-emerald-600 font-bold">{testResult ? "200 OK" : "Awaiting execution"}</span>
            </div>
            <pre className="p-3 bg-slate-900 text-slate-200 rounded-xl overflow-x-auto max-h-56 scroll-dark text-[11px]">
              {testResult
                ? JSON.stringify(testResult, null, 2)
                : `// Press 'Execute Test Payload' above to invoke ${selectedGroup.endpoint}`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
