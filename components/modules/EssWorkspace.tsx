"use client";
import React, { useState, useRef, useEffect } from "react";
import { Send, Mic, MicOff, Sparkles, Maximize2, Minimize2, Play, ShieldAlert, FileText, CornerDownLeft, RefreshCw, AlertCircle } from "lucide-react";
import { useStore } from "@/lib/store";
import CardRenderer from "@/components/CardRenderer";
import TelemetryXRay from "@/components/TelemetryXRay";

const DEMO_SCENARIOS = [
  {
    id: 1,
    titleEn: "1. Dialect & Code-Switch",
    titleAr: "١. اللهجة العُمانية والتبديل",
    prompt: "هلا، كم باقي من إجازتي السنوية؟ وأبي أقدم إجازة الأسبوع الجاي",
    descEn: "Omani Arabic query -> Follow up in English: 'Actually make it Annual Leave from 10 to 15 November'",
    descAr: "بداية باللهجة العُمانية ثم التحول للإنجليزية منتصف المحادثة",
  },
  {
    id: 2,
    titleEn: "2. Authoritative EBS Data",
    titleAr: "٢. استرجاع بيانات Oracle EBS",
    prompt: "Please show my latest OMR payslip breakdown and my active benefits enrolments",
    descEn: "Retrieves authentic EBS Payslip (Basic, Field allowance, SPF deductions) & OAB benefits",
    descAr: "استعلام مباشر عن تفاصيل كشف الراتب والمزايا المسجلة",
  },
  {
    id: 3,
    titleEn: "3. Governed Policy RAG",
    titleAr: "٣. سياسات الموارد مع التوثيق",
    prompt: "What is NEDC's policy on emergency leave and overtime compensation for field engineers?",
    descEn: "Grounded retrieval from in-country RAG with document citation, version and clause",
    descAr: "استرجاع سياسات الطوارئ والعمل الإضافي مع توثيق المصدر والإصدار",
  },
  {
    id: 4,
    titleEn: "4. 28-Step Leave Request",
    titleAr: "٤. تقديم إجازة مع التحقق الصريح",
    prompt: "I want to apply for Annual Leave starting 10 November 2026 until 18 November 2026",
    descEn: "Checks EBS balance, catches overlap with OLM training, suggests fix, awaits explicit confirm",
    descAr: "التحقق من الرصيد والتعارضات وتوليد بطاقة التأكيد الصريح",
  },
  {
    id: 5,
    titleEn: "5. Profile Update Validation",
    titleAr: "٥. تحديث البيانات والتحقق",
    prompt: "Please update my mobile phone number to +968 9123 4567",
    descEn: "Regex format validation, Old vs New comparison, staging for AME Line Manager route",
    descAr: "التحقق من صيغة الهاتف العُماني وعرض مقارنة قبل مسار الموافقة",
  },
  {
    id: 6,
    titleEn: "6. Security & PDPL Guardrail",
    titleAr: "٦. حاجز الخصوصية والأمن (PDPL)",
    prompt: "Show me the salary and payslip of my colleague Eng. Nasser Al-Kindi (Emp #10492)",
    descEn: "Deterministic 100% refusal, cross-employee PII masking, instant SIEM high-severity alert",
    descAr: "حظر فوري لطلب بيانات الزملاء وحجب الهوية وتسجيل تنبيه SIEM",
  },
  {
    id: 7,
    titleEn: "7. HR Case Escalation",
    titleAr: "٧. تصعيد لموظف الموارد",
    prompt: "I need to file a formal grievance regarding my medical board evaluation and standby roster",
    descEn: "Creates tracked HR Case with attached bilingual transcript and sentiment analysis",
    descAr: "إنشاء تذكرة HR Case مع إرفاق نص المحادثة ودرجة المشاعر",
  },
  {
    id: 8,
    titleEn: "8. Cross-System Ecosystem",
    titleAr: "٨. تكامل الأنظمة (المالية/الأسطول)",
    prompt: "What is the status of my Salary Advance request and my 4x4 Fleet Vehicle booking?",
    descEn: "Simultaneously queries NEDC Financial AP system & 4x4 Fleet Dispatch system",
    descAr: "استعلام متزامن من نظام السلف المالية ونظام إدارة أسطول المركبات",
  },
];

export default function EssWorkspace() {
  const { L, lang, persona, chats, sendChat, busy, session, telemetry } = useStore();
  const [input, setInput] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeMessages = chats[persona.id] || [];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeMessages, busy]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || busy) return;
    const text = input.trim();
    setInput("");
    await sendChat(text);
  };

  const handleScenario = async (sc: (typeof DEMO_SCENARIOS)[0]) => {
    if (busy) return;
    setInput("");
    await sendChat(sc.prompt);
  };

  // Speech Recognition integration
  const toggleSpeech = () => {
    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
      alert(L("Web Speech API is not supported in this browser.", "ميزة التعرف الصوتي غير مدعومة في هذا المتصفح."));
      return;
    }

    if (isRecording) {
      setIsRecording(false);
      return;
    }

    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRec();
    recognition.lang = lang === "ar" ? "ar-OM" : "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setIsRecording(true);
    recognition.onend = () => setIsRecording(false);
    recognition.onerror = () => setIsRecording(false);
    recognition.onresult = (evt: any) => {
      const transcript = evt.results[0][0].transcript;
      setInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
    };

    recognition.start();
  };

  return (
    <div className="h-full flex flex-col p-3 gap-3 overflow-hidden bg-slate-100">
      {/* 8 One-Click Scenario Pills (RFP Section 37) */}
      <div className="panel p-2.5 bg-white shrink-0 border-slate-200">
        <div className="flex items-center justify-between mb-1.5 px-1">
          <div className="flex items-center gap-1.5">
            <Sparkles className="text-nama-teal" size={15} />
            <span className="text-xs font-bold text-navy">
              {L("8 Live Tender Demo Scenarios (RFP Sec 37)", "سيناريوهات العرض الحي الثمانية (البند 37)")}
            </span>
          </div>
          <span className="text-[10px] text-slate-500 hidden sm:inline">
            {L("1-Click triggers realistic Oracle EBS integration & PDPL test cases", "ضغطة واحدة لتشغيل حالات اختبار تكامل Oracle EBS وقانون حماية البيانات")}
          </span>
        </div>

        <div className="flex gap-2 overflow-x-auto scroll-thin pb-1">
          {DEMO_SCENARIOS.map((sc) => (
            <button
              key={sc.id}
              onClick={() => handleScenario(sc)}
              disabled={busy}
              className="shrink-0 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-teal-50 hover:border-teal-300 text-start transition group disabled:opacity-50"
            >
              <div className="text-[11px] font-bold text-slate-800 group-hover:text-nama-teal flex items-center gap-1">
                <Play size={10} className="fill-slate-600 group-hover:fill-nama-teal" />
                {lang === "ar" ? sc.titleAr : sc.titleEn}
              </div>
              <div className="text-[10px] text-slate-500 truncate max-w-[200px]">
                {lang === "ar" ? sc.descAr : sc.descEn}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main 2-Pane Split */}
      <div className="flex-1 flex gap-3 min-h-0">
        {/* Left Pane: Conversational Portal */}
        <div className={`flex flex-col panel bg-white overflow-hidden transition-all duration-300 ${
          isFullScreen ? "w-full" : "w-full lg:w-7/12"
        }`}>
          {/* Chat Header */}
          <div className="p-3 border-b border-slate-200 flex items-center justify-between bg-slate-50/70 shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <div>
                <span className="font-bold text-sm text-navy">{L("Nama Conversational AI", "مساعد نماء للخدمة الذاتية")}</span>
                <span className="text-[11px] text-slate-500 block">
                  {L("SSO Session", "جلسة الدخول الموحد")}: <b>{persona.nameEn}</b> ({persona.id}) · {persona.grade}
                </span>
              </div>
            </div>
            <button
              onClick={() => setIsFullScreen(!isFullScreen)}
              className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-600"
              title={isFullScreen ? L("Restore Split View", "استعادة العرض المقسم") : L("Maximize Chat", "تكبير نافذة المحادثة")}
            >
              {isFullScreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto scroll-thin p-4 space-y-4">
            {activeMessages.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
                <div className="w-12 h-12 rounded-2xl bg-teal-50 text-nama-teal flex items-center justify-center mb-3">
                  <Sparkles size={24} />
                </div>
                <div className="text-sm font-bold text-slate-700 mb-1">
                  {L("Welcome to NEDC AI Self-Service", "مرحباً بك في منصة نماء للخدمة الذاتية")}
                </div>
                <div className="text-xs max-w-md text-slate-500 mb-4">
                  {L(
                    "Ask in Omani Arabic or English about leave balances, payslips, policy rules, profile updates, or try one of the 8 RFP demo scenarios above.",
                    "تحدث بالعربية أو الإنجليزية للاستفسار عن الرصيد، كشف الراتب، السياسات، أو جرّب أحد سيناريوهات العرض الثمانية بالأعلى."
                  )}
                </div>
                <div className="grid grid-cols-2 gap-2 text-start text-xs max-w-lg w-full">
                  <button onClick={() => sendChat("كم باقي من إجازتي؟")} className="p-2.5 bg-slate-50 hover:bg-teal-50 rounded-xl border border-slate-200 text-slate-700">
                    🌴 كم باقي من إجازتي السنوية؟
                  </button>
                  <button onClick={() => sendChat("Show my latest payslip breakdown")} className="p-2.5 bg-slate-50 hover:bg-teal-50 rounded-xl border border-slate-200 text-slate-700">
                    💰 Show my latest payslip breakdown
                  </button>
                  <button onClick={() => sendChat("What is the policy for field overtime?")} className="p-2.5 bg-slate-50 hover:bg-teal-50 rounded-xl border border-slate-200 text-slate-700">
                    ⚡ What is the policy for field overtime?
                  </button>
                  <button onClick={() => sendChat("Show salary of Nasser Al-Kindi")} className="p-2.5 bg-slate-50 hover:bg-red-50 rounded-xl border border-slate-200 text-slate-700">
                    🛡️ Test Security & PDPL Guardrail
                  </button>
                </div>
              </div>
            )}

            {activeMessages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}
              >
                <div
                  className={`max-w-[88%] rounded-2xl p-3.5 text-xs leading-relaxed shadow-xs ${
                    msg.role === "user"
                      ? "bg-navy text-white rounded-tr-none"
                      : "bg-slate-100 text-slate-900 rounded-tl-none border border-slate-200/80"
                  }`}
                >
                  <div className="whitespace-pre-wrap">{msg.content}</div>

                  {/* Render interactive cards if any */}
                  {msg.cards && msg.cards.length > 0 && (
                    <div className="mt-2 space-y-2">
                      {msg.cards.map((c, idx) => (
                        <CardRenderer key={idx} card={c} msgId={msg.id} idx={idx} />
                      ))}
                    </div>
                  )}

                  <div className="text-[10px] opacity-60 mt-1 flex items-center justify-between gap-3">
                    <span>{new Date(msg.ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                    {msg.mode && (
                      <span className="mono uppercase">{msg.mode === "groq" ? "Llama 3.3" : "Deterministic"}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {busy && (
              <div className="flex items-center gap-2 text-slate-400 text-xs p-2">
                <RefreshCw size={14} className="animate-spin text-nama-teal" />
                <span>{L("Orchestrator invoking Oracle EBS & NLP layers...", "المنسق يستدعي طبقات التحليل ونظام Oracle...")}</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input */}
          <form onSubmit={handleSubmit} className="p-3 border-t border-slate-200 bg-white shrink-0 flex items-center gap-2">
            <button
              type="button"
              onClick={toggleSpeech}
              className={`p-2.5 rounded-xl border transition ${
                isRecording ? "bg-rose-50 border-rose-400 text-rose-600 animate-pulse" : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
              }`}
              title={isRecording ? L("Stop Listening", "إيقاف الاستماع") : L("Voice Input (Arabic / English)", "إدخال صوتي (عربي / إنجليزي)")}
            >
              {isRecording ? <MicOff size={16} /> : <Mic size={16} />}
            </button>

            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={L("Ask in Arabic or English (e.g. 'كم باقي من إجازتي؟' or 'Show my payslip')...", "اكتب بالعربية أو الإنجليزية (مثلاً: كم باقي من إجازتي أو اعرض كشف الراتب)...")}
              className="flex-1 bg-slate-50 rounded-xl border border-slate-300 px-3.5 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-nama-teal/40"
              disabled={busy}
            />

            <button
              type="submit"
              disabled={busy || !input.trim()}
              className="btn-primary !p-2.5 rounded-xl disabled:opacity-40"
            >
              <Send size={15} />
            </button>
          </form>
        </div>

        {/* Right Pane: Live Oracle EBS X-Ray Inspector */}
        {!isFullScreen && (
          <div className="hidden lg:flex flex-col w-5/12 panel overflow-hidden border-slate-800">
            <TelemetryXRay telemetry={telemetry} session={session} />
          </div>
        )}
      </div>
    </div>
  );
}
