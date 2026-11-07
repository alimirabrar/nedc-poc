"use client";
import React, { useState } from "react";
import { Bell, Bot, Briefcase, Cable, ChevronDown, GraduationCap, KeyRound, LineChart, Settings, ShieldCheck, Workflow, X, Zap, ClipboardCheck, Languages, Server } from "lucide-react";
import { StoreProvider, useStore, ModuleId } from "@/lib/store";
import type { Role } from "@/lib/types";
import { EMPLOYEES, ROLE_PERSONA } from "@/lib/ebs";
import EssWorkspace from "./modules/EssWorkspace";
import ManagerConsole from "./modules/ManagerConsole";
import Lifecycle from "./modules/Lifecycle";
import Analytics from "./modules/Analytics";
import Learning from "./modules/Learning";
import Integrations from "./modules/Integrations";
import Compliance from "./modules/Compliance";

export default function Shell() {
  return (
    <StoreProvider>
      <App />
    </StoreProvider>
  );
}

const NAV: { id: ModuleId; icon: any; en: string; ar: string; sub: string }[] = [
  { id: "ess", icon: Bot, en: "AI Self-Service & X-Ray", ar: "الخدمة الذاتية الذكية", sub: "M1 · Sec 8–11, 37" },
  { id: "manager", icon: ClipboardCheck, en: "Approvals & HR Console", ar: "الموافقات ومكتب الموارد", sub: "M2 · Sec 11.3, 14.2" },
  { id: "lifecycle", icon: Workflow, en: "Lifecycle Automation", ar: "أتمتة دورة حياة الموظف", sub: "M3 · Sec 12" },
  { id: "analytics", icon: LineChart, en: "Analytics & Predictive", ar: "التحليلات والتنبؤ", sub: "M4 · Sec 13" },
  { id: "learning", icon: GraduationCap, en: "Learning & Competency", ar: "التعلم والكفاءات", sub: "M5 · Sec 14.1" },
  { id: "integrations", icon: Cable, en: "Integrations Hub", ar: "مركز التكامل", sub: "M6 · Sec 15" },
  { id: "compliance", icon: ShieldCheck, en: "PDPL, SIEM & Compliance", ar: "الامتثال والأمن", sub: "M7 · Sec 16–22, 36" },
];

const ROLES: { id: Role; en: string; ar: string }[] = [
  { id: "employee", en: "Employee", ar: "موظف" },
  { id: "manager", en: "Line Manager", ar: "مدير مباشر" },
  { id: "hr", en: "HR Operations", ar: "عمليات الموارد البشرية" },
  { id: "executive", en: "Senior Management", ar: "الإدارة العليا" },
];

function App() {
  const s = useStore();
  const { L, module } = s;
  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <Header />
      <div className="flex flex-1 min-h-0">
        <nav className="w-[232px] shrink-0 bg-navy text-slate-300 flex flex-col border-e border-slate-800">
          <div className="px-4 pt-4 pb-2 text-[10px] uppercase tracking-widest text-slate-500">{L("Enterprise Workspace", "مساحة العمل المؤسسية")}</div>
          <div className="flex-1 overflow-y-auto scroll-dark px-2 space-y-1">
            {NAV.map((n) => {
              const active = module === n.id;
              const pending = n.id === "manager" ? s.ledger.filter((l) => l.status === "PENDING_APPROVAL").length + s.cases.filter((c) => c.status !== "RESOLVED").length : 0;
              return (
                <button key={n.id} onClick={() => s.setModule(n.id)} className={`w-full text-start rounded-xl px-3 py-2.5 flex items-start gap-3 transition ${active ? "bg-gradient-to-r from-nama-teal/90 to-nama-emerald/80 text-white shadow-lg shadow-teal-900/30" : "hover:bg-slate-800/70"}`}>
                  <n.icon size={18} className="mt-0.5 shrink-0" />
                  <span className="flex-1 min-w-0">
                    <span className="block text-[13px] font-semibold leading-tight">{L(n.en, n.ar)}</span>
                    <span className={`block text-[10px] mt-0.5 ${active ? "text-teal-100" : "text-slate-500"}`}>{n.sub}</span>
                  </span>
                  {pending > 0 && <span className="chip bg-nama-amber text-white">{pending}</span>}
                </button>
              );
            })}
          </div>
          <div className="p-3 m-2 rounded-xl bg-slate-800/60 text-[11px] leading-relaxed">
            <div className="flex items-center gap-1.5 text-emerald-400 font-semibold"><Server size={13} /> {L("Oracle EBS R12.2 — Unchanged", "Oracle EBS R12.2 — بدون تعديل")}</div>
            <div className="text-slate-400 mt-1">{L("Zero core modification · OIC + ISG + SSHR + AME", "بدون تعديل على النواة · OIC + ISG + SSHR + AME")}</div>
            <div className="text-slate-500 mt-1 mono">NEDC-2026-146 · POC v1.0</div>
          </div>
        </nav>
        <main className="flex-1 min-w-0 overflow-y-auto scroll-thin">
          {module === "ess" && <EssWorkspace />}
          {module === "manager" && <ManagerConsole />}
          {module === "lifecycle" && <Lifecycle />}
          {module === "analytics" && <Analytics />}
          {module === "learning" && <Learning />}
          {module === "integrations" && <Integrations />}
          {module === "compliance" && <Compliance />}
        </main>
      </div>
      {s.settingsOpen && <SettingsModal />}
    </div>
  );
}

function Header() {
  const s = useStore();
  const { L, lang } = s;
  const [roleOpen, setRoleOpen] = useState(false);
  const [bellOpen, setBellOpen] = useState(false);
  const mine = s.notifications.filter((n) => n.targetEmployeeId === s.persona.id);
  const unread = mine.filter((n) => !n.read).length;
  const groqActive = !s.settings.forceDemo && (s.settings.apiKey || s.groqServer);
  return (
    <header className="h-16 shrink-0 bg-white border-b border-slate-200 flex items-center px-4 gap-4 relative z-30">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-nama-teal to-navy flex items-center justify-center text-white shadow-md"><Zap size={20} /></div>
        <div className="min-w-0 leading-tight">
          <div className="text-[15px] font-bold text-navy truncate"><span dir="rtl">نماء لتوزيع الكهرباء</span> <span className="text-slate-300 mx-1">|</span> <span className="tracking-wide">NAMA ELECTRICITY DISTRIBUTION COMPANY (NEDC)</span></div>
          <div className="text-[11px] text-slate-500 truncate">{L("AI-Powered Automation & Employee Self-Service Platform · Tender NEDC-2026-146 · ~1,300 employees", "منصة الأتمتة والخدمة الذاتية بالذكاء الاصطناعي · مناقصة NEDC-2026-146 · ~1,300 موظف")}</div>
        </div>
      </div>
      <div className="flex-1" />
      <div className="hidden xl:flex chip bg-emerald-50 text-emerald-700 border border-emerald-200 py-1 px-2.5 text-[11px]"><ShieldCheck size={13} /> {L("Oman In-Country Hosting & PDPL Verified", "استضافة داخل عُمان ومتوافق مع قانون حماية البيانات")}</div>
      <button onClick={() => s.setSettingsOpen(true)} className={`chip py-1 px-2.5 border ${groqActive ? "bg-teal-50 text-teal-700 border-teal-200" : "bg-amber-50 text-amber-700 border-amber-200"}`} title="AI engine">
        <Bot size={13} /> {groqActive ? "Groq · Llama 3.3 70B" : L("Demo Mode (deterministic)", "الوضع التجريبي")}
      </button>
      <button onClick={() => s.setLang(lang === "en" ? "ar" : "en")} className="btn-ghost !py-1.5"><Languages size={15} /> {lang === "en" ? "عربي" : "EN"}</button>
      <div className="relative">
        <button onClick={() => { setBellOpen(!bellOpen); if (!bellOpen) setTimeout(s.markAllRead, 2500); }} className="relative p-2 rounded-lg hover:bg-slate-100">
          <Bell size={18} />
          {unread > 0 && <span className="absolute -top-0.5 -end-0.5 min-w-[18px] h-[18px] rounded-full bg-nama-crimson text-white text-[10px] font-bold flex items-center justify-center animate-pulse">{unread}</span>}
        </button>
        {bellOpen && (
          <div className="absolute end-0 mt-2 w-96 panel p-2 max-h-96 overflow-y-auto scroll-thin animate-fadeUp">
            <div className="px-2 py-1 text-xs font-semibold text-slate-500">{L("Notifications", "الإشعارات")} · {s.persona.nameEn}</div>
            {mine.length === 0 && <div className="p-4 text-sm text-slate-400">{L("No notifications yet.", "لا توجد إشعارات.")}</div>}
            {mine.map((n) => (
              <div key={n.id} className={`p-2.5 rounded-lg text-[13px] ${n.read ? "" : "bg-teal-50"}`}>
                <div>{lang === "ar" ? n.ar : n.en}</div>
                <div className="text-[10px] text-slate-400 mt-0.5">{new Date(n.ts).toLocaleTimeString()}</div>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="relative">
        <button onClick={() => setRoleOpen(!roleOpen)} className="flex items-center gap-2 rounded-xl border border-slate-200 ps-1 pe-2 py-1 hover:bg-slate-50">
          <span className="w-8 h-8 rounded-lg bg-navy text-white text-xs font-bold flex items-center justify-center">{s.persona.initials}</span>
          <span className="text-start leading-tight hidden md:block">
            <span className="block text-[12px] font-semibold">{lang === "ar" ? s.persona.nameAr : s.persona.nameEn}</span>
            <span className="block text-[10px] text-nama-teal font-semibold">{L(ROLES.find((r) => r.id === s.role)!.en, ROLES.find((r) => r.id === s.role)!.ar)}</span>
          </span>
          <ChevronDown size={14} />
        </button>
        {roleOpen && (
          <div className="absolute end-0 mt-2 w-80 panel p-2 animate-fadeUp">
            <div className="px-2 py-1 text-xs font-semibold text-slate-500 flex items-center gap-1"><KeyRound size={12} /> {L("Role Switcher (SSO persona · FND Responsibility)", "تبديل الدور (هوية الدخول الموحد)")}</div>
            {ROLES.map((r) => {
              const e = EMPLOYEES[ROLE_PERSONA[r.id]];
              return (
                <button key={r.id} onClick={() => { s.setRole(r.id); setRoleOpen(false); if (r.id === "manager" || r.id === "hr") s.setModule("manager"); if (r.id === "executive") s.setModule("analytics"); if (r.id === "employee") s.setModule("ess"); }} className={`w-full text-start p-2 rounded-lg flex gap-2 items-center hover:bg-slate-50 ${s.role === r.id ? "bg-teal-50 ring-1 ring-teal-200" : ""}`}>
                  <span className="w-8 h-8 rounded-lg bg-slate-800 text-white text-xs font-bold flex items-center justify-center">{e.initials}</span>
                  <span className="leading-tight">
                    <span className="block text-[13px] font-semibold">{L(r.en, r.ar)} — {lang === "ar" ? e.nameAr : e.nameEn}</span>
                    <span className="block text-[11px] text-slate-500">{lang === "ar" ? e.titleAr : e.titleEn} · <span className="mono">{e.responsibility}</span></span>
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </header>
  );
}

function SettingsModal() {
  const s = useStore();
  const { L } = s;
  const [key, setKey] = useState(s.settings.apiKey);
  const [demo, setDemo] = useState(s.settings.forceDemo);
  const [model, setModel] = useState(s.settings.model);
  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => s.setSettingsOpen(false)}>
      <div className="panel w-full max-w-lg p-5 animate-fadeUp" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-3">
          <div className="font-bold flex items-center gap-2"><Settings size={18} /> {L("AI Engine Settings", "إعدادات محرك الذكاء الاصطناعي")}</div>
          <button onClick={() => s.setSettingsOpen(false)}><X size={18} /></button>
        </div>
        <div className="text-[13px] text-slate-600 mb-4 space-y-1">
          <div>• {L("Server key (GROQ_API_KEY)", "مفتاح الخادم")}: <b className={s.groqServer ? "text-emerald-600" : "text-amber-600"}>{s.groqServer ? L("configured", "مُعد") : L("not configured", "غير مُعد")}</b></div>
          <div>• {L("If no key is available or Groq fails, the deterministic intent engine answers instantly — the demo never breaks.", "عند غياب المفتاح أو تعطل Groq يعمل المحرك الحتمي فوراً — العرض لا يتوقف أبداً.")}</div>
        </div>
        <label className="text-xs font-semibold text-slate-500">{L("Groq API Key Override (stored only in this browser)", "مفتاح Groq البديل (يُحفظ في هذا المتصفح فقط)")}</label>
        <input value={key} onChange={(e) => setKey(e.target.value)} type="password" placeholder="gsk_..." className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm mono" />
        <label className="text-xs font-semibold text-slate-500 mt-3 block">{L("Model", "النموذج")}</label>
        <select value={model} onChange={(e) => setModel(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm">
          <option value="llama-3.3-70b-versatile">llama-3.3-70b-versatile (default)</option>
          <option value="llama-3.1-8b-instant">llama-3.1-8b-instant</option>
        </select>
        <label className="flex items-center gap-2 mt-4 text-sm">
          <input type="checkbox" checked={demo} onChange={(e) => setDemo(e.target.checked)} /> {L("Force Demo Mode (deterministic engine, no LLM calls)", "فرض الوضع التجريبي (بدون استدعاء النموذج)")}
        </label>
        <div className="flex justify-end gap-2 mt-5">
          <button className="btn-ghost" onClick={() => { setKey(""); }}>{L("Clear key", "مسح المفتاح")}</button>
          <button className="btn-primary" onClick={() => { s.setSettings({ apiKey: key.trim(), forceDemo: demo, model }); s.setSettingsOpen(false); }}>{L("Save", "حفظ")}</button>
        </div>
      </div>
    </div>
  );
}
