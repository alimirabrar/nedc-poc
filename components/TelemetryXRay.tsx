"use client";
import React from "react";
import { CheckCircle2, Shield, Eye, ArrowRight, Lock, Server, Cpu, Database, Network } from "lucide-react";
import type { Telemetry } from "@/lib/store";
import type { SessionState } from "@/lib/types";
import { useStore } from "@/lib/store";

interface TelemetryXRayProps {
  telemetry: Telemetry | null;
  session: SessionState | null;
}

const LAYERS = [
  { num: 1, name: "Channel & Ingress", sub: "Web/Mobile Portal · WAF & DDoS Filter" },
  { num: 2, name: "IAM & Identity Context", sub: "OIDC / OAuth 2.0 · FND User Context" },
  { num: 3, name: "Bilingual NLP Pipeline", sub: "Arabic (Omani) / English Dialect Normalizer" },
  { num: 4, name: "AI Orchestrator & State", sub: "Llama 3.3 70B / Rule Machine & Guardrails" },
  { num: 5, name: "Governed In-Country RAG", sub: "Vector Index · Document Citation & Versioning" },
  { num: 6, name: "API Gateway (Oman Cloud)", sub: "mTLS · OAuth Token Exchange & Throttling" },
  { num: 7, name: "OIC / ISG Service Adapters", sub: "Oracle Integration Cloud & SOAP/REST ISG" },
  { num: 8, name: "Oracle EBS HRMS R12.2", sub: "SSHR APIs & AME Workflow (Zero DB Mod)" },
  { num: 9, name: "SIEM & PDPL Audit", sub: "Immutable Audit Log & PII Redaction" },
];

export default function TelemetryXRay({ telemetry, session }: TelemetryXRayProps) {
  const { L, lang } = useStore();

  return (
    <div className="h-full flex flex-col bg-slate-900 text-slate-200 text-xs">
      {/* Header bar */}
      <div className="p-3 border-b border-slate-800 flex items-center justify-between bg-slate-950/60 shrink-0">
        <div className="flex items-center gap-2">
          <Cpu className="text-nama-teal" size={16} />
          <span className="font-bold text-slate-100">{L("Live Oracle EBS & AI Governance X-Ray", "مجهر الحوكمة ونظام Oracle EBS الحي")}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="chip bg-slate-800 text-slate-300 mono text-[10px]">
            {telemetry ? `${telemetry.latencyMs} ms` : "IDLE"}
          </span>
          <span className="chip bg-teal-950 text-teal-300 border border-teal-800/80 text-[10px]">
            {telemetry?.mode === "groq" ? "Groq Llama 3.3" : "Deterministic Engine"}
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scroll-dark p-3 space-y-4">
        {/* SECTION 1: 9-Layer Architecture Flow Visualizer */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              {L("9-Layer Architecture Flow (RFP Sec 7.1)", "طبقات البنية المعمارية التسع (البند 7.1)")}
            </span>
            <span className="text-[10px] text-emerald-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              {L("Live Pipeline", "خط المعالجة المباشر")}
            </span>
          </div>

          <div className="space-y-1.5">
            {LAYERS.map((layer) => {
              const traceStep = telemetry?.trace?.find((t) => t.layer === layer.num);
              const isActive = traceStep?.status === "active";
              const isBlocked = traceStep?.status === "blocked";
              const isSkipped = traceStep?.status === "skipped";

              return (
                <div
                  key={layer.num}
                  className={`p-2 rounded-lg border transition-all ${
                    isBlocked
                      ? "bg-rose-950/40 border-rose-600/80 text-rose-200"
                      : isActive
                      ? "bg-teal-950/40 border-nama-teal text-slate-100 shadow-sm"
                      : "bg-slate-950/30 border-slate-800/80 text-slate-500"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-medium">
                      <span className={`w-4 h-4 rounded-full text-[10px] flex items-center justify-center font-mono font-bold ${
                        isBlocked ? "bg-rose-600 text-white" : isActive ? "bg-nama-teal text-white" : "bg-slate-800 text-slate-400"
                      }`}>
                        {layer.num}
                      </span>
                      <span className={isActive ? "text-white font-semibold" : ""}>{layer.name}</span>
                    </div>
                    <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                      isBlocked ? "bg-rose-900/60 text-rose-300" : isActive ? "bg-teal-900/60 text-teal-300" : "text-slate-600"
                    }`}>
                      {isBlocked ? "GUARDRAIL BLOCKED" : isActive ? "PASSED" : "BYPASSED"}
                    </span>
                  </div>
                  {traceStep && (
                    <div className="text-[11px] text-slate-400 mt-1 ps-6 font-mono break-all">
                      {traceStep.detail}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* SECTION 2: 28-Step Guided Transaction State JSON */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              {L("Structured Session & State Machine (Sec 9.3)", "حالة الجلسة وآلة الحالات المنطقية (البند 9.3)")}
            </span>
            <span className="chip bg-slate-800 text-teal-400 text-[10px] font-mono">
              Step {session?.guidedStep || 1} / 28
            </span>
          </div>

          <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 font-mono text-[11px] text-emerald-400 overflow-x-auto max-h-48 scroll-dark">
            <pre>
              {JSON.stringify(
                {
                  sessionId: session?.sessionId || "SESS-WAITING",
                  authenticatedEmployeeId: session?.authenticatedEmployeeId || "E10231",
                  fndUser: session?.fndUser || "SALIM.HARTHY",
                  responsibility: session?.responsibility || "NEDC Employee Self-Service",
                  detectedLanguage: session?.detectedLanguage || "en-US",
                  dialect: session?.dialect || "Modern Standard Arabic",
                  intent: session?.intent || "IDLE",
                  intents: session?.intents || [],
                  confidenceScore: session?.confidenceScore || 0.96,
                  extractedEntities: session?.extractedEntities || {},
                  missingMandatoryFields: session?.missingMandatoryFields || [],
                  ebsValidationResult: session?.ebsValidationResult || "STANDBY",
                  explicitConfirmationState: session?.explicitConfirmationState || "NOT_REQUIRED",
                  correlationId: session?.correlationId || "CORR-STANDBY",
                },
                null,
                2
              )}
            </pre>
          </div>
        </div>

        {/* SECTION 3: Oracle EBS / OIC Payload Inspector */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              {L("Oracle EBS / OIC Payload Inspector (Sec 8.9)", "مفتش رسائل وتكامل Oracle EBS / OIC (البند 8.9)")}
            </span>
            <span className="text-[10px] text-amber-400 font-semibold flex items-center gap-1">
              <Lock size={12} />
              {L("Zero Direct DB Write — AME Routed", "حظر الكتابة المباشرة — تحويل لـ AME")}
            </span>
          </div>

          {(!telemetry?.apiCalls || telemetry.apiCalls.length === 0) ? (
            <div className="p-3 bg-slate-950/40 border border-slate-800 rounded-lg text-slate-500 text-center">
              {L("Send a query or trigger a demo scenario to inspect live REST/SOAP/ISG payloads.", "أرسل استفساراً أو شغّل سيناريو تجريبي لمعاينة نداءات REST/SOAP الحية.")}
            </div>
          ) : (
            <div className="space-y-2">
              {telemetry.apiCalls.map((call, idx) => (
                <div key={idx} className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 space-y-1.5 font-mono text-[11px]">
                  <div className="flex items-center justify-between text-slate-300">
                    <span className="text-nama-teal font-bold">{call.method}</span>
                    <span className="text-slate-500">{call.protocol} · {call.latencyMs}ms</span>
                  </div>
                  <div className="text-slate-400 break-all">{call.endpoint}</div>
                  <div className="text-slate-500 text-[10px] pt-1 border-t border-slate-900 flex justify-between">
                    <span>EBS API: <span className="text-slate-300">{call.ebsApi}</span></span>
                    <span className="text-amber-400">{call.writeMode}</span>
                  </div>
                  {call.request && (
                    <details className="mt-1">
                      <summary className="text-[10px] text-slate-400 cursor-pointer hover:text-slate-200">
                        {L("View ISG Request / Context", "عرض بيانات الطلب والسياق")}
                      </summary>
                      <pre className="p-1.5 bg-slate-900 rounded text-[10px] text-slate-300 mt-1 max-h-28 overflow-y-auto scroll-dark">
                        {JSON.stringify(call.request, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
