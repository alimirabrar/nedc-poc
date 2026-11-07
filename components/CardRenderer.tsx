"use client";
import React from "react";
import { CheckCircle2, XCircle, AlertTriangle, FileText, Calendar, DollarSign, UserCheck, ShieldAlert, Phone, MapPin, Building, ArrowRight, ExternalLink } from "lucide-react";
import type { Card } from "@/lib/types";
import { useStore } from "@/lib/store";
import { fmtOMR } from "@/lib/ebs";
import { prettyDate } from "@/lib/nlp";

interface CardRendererProps {
  card: Card;
  msgId: string;
  idx: number;
}

export default function CardRenderer({ card, msgId, idx }: CardRendererProps) {
  const { L, lang, confirmCard, cancelCard, jump } = useStore();

  switch (card.type) {
    case "leaveBalance": {
      const { balances, asOf, pendingDaysInWorkflow } = card.data;
      return (
        <div className="panel p-4 my-2 border-teal-200 bg-gradient-to-br from-white to-teal-50/30">
          <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <Calendar className="text-nama-teal" size={18} />
              <span className="font-bold text-sm text-navy">{L("Oracle EBS Accrual Balances", "أرصدة الإجازات من Oracle EBS")}</span>
            </div>
            <span className="text-[11px] mono text-slate-500">{L("As of", "كما في")} {asOf}</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {balances.map((b: any) => (
              <div key={b.key} className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-xs">
                <div className="text-[11px] text-slate-500 truncate">{lang === "ar" ? b.ar : b.en}</div>
                <div className="text-xl font-bold text-navy mt-0.5">{b.balance} <span className="text-xs font-normal text-slate-500">{L("days", "يوم")}</span></div>
                <div className="text-[10px] text-slate-400 mt-1 flex justify-between">
                  <span>{L("Taken", "مستهلك")}: {b.taken}</span>
                  <span>{L("Ent", "المستحق")}: {b.entitlement}</span>
                </div>
              </div>
            ))}
          </div>
          {pendingDaysInWorkflow > 0 && (
            <div className="mt-2 text-xs text-amber-700 bg-amber-50 p-2 rounded-lg flex items-center gap-1.5 border border-amber-200">
              <AlertTriangle size={14} />
              <span>{L(`You have ${pendingDaysInWorkflow} day(s) currently pending approval in Oracle AME`, `لديك ${pendingDaysInWorkflow} يوم قيد الموافقة حالياً في مسار Oracle AME`)}</span>
            </div>
          )}
        </div>
      );
    }

    case "leaveHistory": {
      const { items } = card.data;
      return (
        <div className="panel p-4 my-2 border-slate-200">
          <div className="flex items-center gap-2 pb-2 mb-2 border-b border-slate-200 font-bold text-sm text-navy">
            <FileText className="text-nama-teal" size={18} />
            <span>{L("Absence History (Oracle EBS SSHR)", "سجل الإجازات (Oracle EBS SSHR)")}</span>
          </div>
          <div className="space-y-1.5 text-xs">
            {items.map((item: any, i: number) => (
              <div key={i} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
                <div>
                  <div className="font-semibold text-slate-800">{item.ref} · {item.type}</div>
                  <div className="text-slate-500 text-[11px]">{prettyDate(item.start, lang)} → {prettyDate(item.end, lang)} ({item.days} {L("days", "أيام")})</div>
                </div>
                <span className="chip bg-emerald-50 text-emerald-700 border border-emerald-200">{item.status}</span>
              </div>
            ))}
          </div>
        </div>
      );
    }

    case "payslip": {
      const p = card.data;
      return (
        <div className="panel p-4 my-2 border-teal-300 bg-white shadow-sm">
          <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <DollarSign className="text-nama-emerald" size={18} />
              <div>
                <span className="font-bold text-sm text-navy">{L("Oracle Payroll Payslip Archive", "أرشيف كشف الراتب - Oracle Payroll")}</span>
                <span className="text-[11px] text-slate-500 block">{lang === "ar" ? p.periodAr : p.period} · {p.archiveRef}</span>
              </div>
            </div>
            <div className="text-end">
              <span className="text-xs text-slate-500 block">{L("Net Pay", "صافي الراتب")}</span>
              <span className="text-lg font-black text-nama-emerald">OMR {fmtOMR(p.net)}</span>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
              <div className="font-bold text-slate-700 mb-1.5 flex justify-between">
                <span>{L("Earnings", "المستحقات")}</span>
                <span className="text-slate-500">OMR {fmtOMR(p.gross)}</span>
              </div>
              <div className="space-y-1">
                {p.earnings.map((e: any, i: number) => (
                  <div key={i} className="flex justify-between text-slate-600 text-[11px]">
                    <span>{lang === "ar" ? e.ar : e.en}</span>
                    <span className="font-medium mono">{fmtOMR(e.amt)}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
              <div className="font-bold text-slate-700 mb-1.5 flex justify-between">
                <span>{L("Deductions", "الاستقطاعات")}</span>
                <span className="text-slate-500">OMR {fmtOMR(p.gross - p.net)}</span>
              </div>
              <div className="space-y-1">
                {p.deductions.map((d: any, i: number) => (
                  <div key={i} className="flex justify-between text-slate-600 text-[11px]">
                    <span>{lang === "ar" ? d.ar : d.en}</span>
                    <span className="font-medium mono text-rose-600">-{fmtOMR(d.amt)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-2 text-[10px] text-slate-400 flex items-center justify-between border-t border-slate-100 pt-1.5">
            <span>{L("Disbursed on", "تاريخ الصرف")}: {p.payDate}</span>
            <span className="chip bg-slate-100 text-slate-600">{L("TLS 1.3 / In-Country Encrypted", "مشفر ومستضاف محلياً")}</span>
          </div>
        </div>
      );
    }

    case "profile": {
      const prof = card.data;
      return (
        <div className="panel p-4 my-2 border-slate-200">
          <div className="flex items-center gap-2 pb-2 mb-3 border-b border-slate-200 font-bold text-sm text-navy">
            <UserCheck className="text-nama-teal" size={18} />
            <span>{L("Oracle EBS Employee Assignment & Profile", "بيانات الموظف والتعيين من Oracle EBS")}</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div><span className="text-slate-400 block">{L("Employee ID", "الرقم الوظيفي")}</span><span className="font-semibold mono">{prof.employeeNumber}</span></div>
            <div><span className="text-slate-400 block">{L("Grade", "الدرجة")}</span><span className="font-semibold">{prof.grade}</span></div>
            <div><span className="text-slate-400 block">{L("Job Title", "المسمى")}</span><span>{lang === "ar" ? prof.jobAr : prof.job}</span></div>
            <div><span className="text-slate-400 block">{L("Supervisor", "المدير المباشر")}</span><span>{prof.supervisor}</span></div>
            <div className="col-span-2"><span className="text-slate-400 block">{L("Department", "المديرية / القسم")}</span><span>{lang === "ar" ? prof.organizationAr : prof.organization}</span></div>
            <div className="col-span-2"><span className="text-slate-400 block">{L("Location", "موقع العمل")}</span><span>{lang === "ar" ? prof.locationAr : prof.location}</span></div>
          </div>
        </div>
      );
    }

    case "benefits": {
      const { plans } = card.data;
      return (
        <div className="panel p-4 my-2 border-slate-200">
          <div className="font-bold text-sm text-navy pb-2 mb-2 border-b border-slate-200 flex items-center gap-2">
            <Building className="text-nama-teal" size={18} />
            <span>{L("Oracle Advanced Benefits (OAB) Enrolments", "مزايا الموظف (Oracle OAB)")}</span>
          </div>
          <div className="space-y-2 text-xs">
            {plans.map((p: any, i: number) => (
              <div key={i} className="p-2 bg-slate-50 rounded-lg flex items-center justify-between">
                <div>
                  <div className="font-medium text-slate-800">{lang === "ar" ? p.ar : p.en}</div>
                  <div className="text-[11px] text-slate-500">{p.value} · {p.provider}</div>
                </div>
                <span className={`chip ${p.status === "Enrolled" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-slate-100 text-slate-600"}`}>{p.status}</span>
              </div>
            ))}
          </div>
        </div>
      );
    }

    case "citation": {
      const c = card.data;
      return (
        <div className="panel p-3.5 my-2 border-teal-300 bg-teal-50/40">
          <div className="flex items-center justify-between mb-1.5">
            <span className="chip bg-teal-600 text-white font-mono text-[10px]">{c.docId} {c.version}</span>
            <span className="text-[11px] text-teal-800 font-semibold">{L("Confidence", "نسبة التطابق")}: {c.confidence}%</span>
          </div>
          <div className="text-xs font-bold text-slate-900 mb-1">{lang === "ar" ? c.titleAr : c.title}</div>
          <div className="text-[11px] text-slate-600 mb-2 flex items-center gap-2 flex-wrap">
            <span>{L("Effective", "تاريخ النفاذ")}: {c.effective}</span>
            <span>•</span>
            <span>{L("Clause", "البند")}: {c.clause}</span>
            <span>•</span>
            <span>{L("Owner", "المالك")}: {lang === "ar" ? c.ownerAr : c.owner}</span>
          </div>
          <div className="p-2 bg-white rounded-lg border border-teal-100 text-xs text-slate-700 leading-relaxed font-sans italic">
            "{c.passage}"
          </div>
        </div>
      );
    }

    case "leaveConfirm": {
      const d = card.data;
      const isPending = card.state === "pending";
      return (
        <div className={`panel p-4 my-2 border-2 ${isPending ? "border-amber-400 bg-amber-50/20" : card.state === "confirmed" ? "border-emerald-500 bg-emerald-50/30" : "border-slate-300 opacity-60"}`}>
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <Calendar className="text-nama-amber" size={18} />
              <span className="font-bold text-sm text-navy">{L("SSHR Transaction Draft — Awaiting Explicit Confirmation", "مسودة معاملة الخدمة الذاتية — بانتظار التأكيد الصريح")}</span>
            </div>
            <span className={`chip ${isPending ? "bg-amber-100 text-amber-800" : card.state === "confirmed" ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-600"}`}>
              {isPending ? L("Pending Confirmation", "بانتظار التأكيد") : card.state === "confirmed" ? L("Committed to AME", "تم الإرسال لـ AME") : L("Cancelled", "ملغى")}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs mb-3">
            <div><span className="text-slate-500 block">{L("Leave Type", "نوع الإجازة")}</span><span className="font-bold">{lang === "ar" ? d.leaveTypeAr : d.leaveType}</span></div>
            <div><span className="text-slate-500 block">{L("Duration", "المدة")}</span><span className="font-bold text-nama-teal">{d.workingDays} {L("working days", "أيام عمل")} <span className="font-normal text-slate-400">({d.calendarDays} {L("calendar", "تقويمي")})</span></span></div>
            <div><span className="text-slate-500 block">{L("Start Date", "البداية")}</span><span className="font-medium">{prettyDate(d.startDate, lang)}</span></div>
            <div><span className="text-slate-500 block">{L("End Date", "النهاية")}</span><span className="font-medium">{prettyDate(d.endDate, lang)}</span></div>
            <div><span className="text-slate-500 block">{L("Balance Before / After", "الرصيد قبل / بعد")}</span><span>{d.balanceBefore} → <b className="text-slate-800">{d.balanceAfter}</b> {L("days", "يوم")}</span></div>
            <div><span className="text-slate-500 block">{L("AME Routing", "مسار الاعتماد")}</span><span className="text-slate-700">{d.approver}</span></div>
          </div>

          <div className="text-[11px] bg-slate-100 p-2 rounded mb-3 text-slate-600 space-y-0.5">
            <div className="font-semibold text-slate-700">{L("Zero-Direct-DB-Write Guarantee:", "ضمان عدم الكتابة المباشرة في قاعدة البيانات:")}</div>
            <div>{L("Clicking Confirm calls Oracle ISG with p_validate=FALSE, staging the request into Oracle Workflow / AME approval tables.", "الضغط على تأكيد يستدعي واجهة Oracle ISG لإدراج المعاملة في مسار اعتماد Oracle AME.")}</div>
          </div>

          {isPending && (
            <div className="flex gap-2 justify-end">
              <button onClick={() => cancelCard(msgId, idx)} className="btn-ghost text-xs">
                {L("Modify / Discard", "تعديل / إلغاء")}
              </button>
              <button onClick={() => confirmCard(msgId, idx)} className="btn-primary text-xs !bg-nama-teal hover:!bg-teal-700 shadow-sm">
                <CheckCircle2 size={14} />
                {L("Confirm & Submit to Oracle EBS SSHR/AME", "تأكيد وإرسال إلى Oracle EBS SSHR/AME")}
              </button>
            </div>
          )}

          {card.state === "confirmed" && (
            <div className="text-xs text-emerald-800 font-semibold flex items-center justify-between">
              <span>{L("Submitted successfully. Transaction ID:", "تم الإرسال بنجاح. رقم المعاملة:")} <span className="mono">{card.txnId}</span></span>
              <button onClick={() => jump("manager")} className="text-[11px] text-nama-teal underline flex items-center gap-1">
                {L("View in Manager Inbox", "عرض في صندوق المدير")} <ArrowRight size={12} />
              </button>
            </div>
          )}
        </div>
      );
    }

    case "profileConfirm": {
      const d = card.data;
      const isPending = card.state === "pending";
      return (
        <div className={`panel p-4 my-2 border-2 ${isPending ? "border-amber-400 bg-amber-50/20" : card.state === "confirmed" ? "border-emerald-500 bg-emerald-50/30" : "border-slate-300 opacity-60"}`}>
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <UserCheck className="text-nama-amber" size={18} />
              <span className="font-bold text-sm text-navy">{L("Profile Update Request — Explicit Confirmation", "طلب تحديث البيانات — تأكيد صريح")}</span>
            </div>
            <span className="chip bg-amber-100 text-amber-800">{L("Pending", "بانتظار التأكيد")}</span>
          </div>

          <div className="space-y-2 text-xs mb-3">
            <div><span className="text-slate-500 block">{L("Field", "الحقل")}</span><span className="font-bold">{lang === "ar" ? d.fieldLabelAr : d.fieldLabel}</span></div>
            <div className="flex gap-4">
              <div className="flex-1 bg-red-50 p-2 rounded border border-red-200">
                <span className="text-[10px] text-red-600 font-bold block">{L("Old Value", "القيمة الحالية")}</span>
                <span className="line-through text-slate-600">{d.oldValue}</span>
              </div>
              <div className="flex-1 bg-emerald-50 p-2 rounded border border-emerald-200">
                <span className="text-[10px] text-emerald-700 font-bold block">{L("New Value (Validated)", "القيمة الجديدة (تم التحقق)")}</span>
                <span className="font-bold text-emerald-900">{d.newValue}</span>
              </div>
            </div>
            <div className="text-[11px] text-slate-500">{L("Approval Path", "مسار الاعتماد")}: {d.approver}</div>
          </div>

          {isPending && (
            <div className="flex gap-2 justify-end">
              <button onClick={() => cancelCard(msgId, idx)} className="btn-ghost text-xs">
                {L("Modify", "تعديل")}
              </button>
              <button onClick={() => confirmCard(msgId, idx)} className="btn-primary text-xs !bg-nama-teal hover:!bg-teal-700">
                <CheckCircle2 size={14} />
                {L("Confirm & Route to Oracle AME", "تأكيد والتحويل إلى Oracle AME")}
              </button>
            </div>
          )}

          {card.state === "confirmed" && (
            <div className="text-xs text-emerald-800 font-semibold">
              {L("Submitted successfully. Transaction ID:", "تم الإرسال بنجاح. رقم المعاملة:")} <span className="mono">{card.txnId}</span>
            </div>
          )}
        </div>
      );
    }

    case "validationError": {
      const { issues, suggestedEndDate } = card.data;
      return (
        <div className="panel p-3.5 my-2 border-rose-300 bg-rose-50/40">
          <div className="flex items-center gap-2 text-rose-800 font-bold text-xs mb-2">
            <XCircle size={16} />
            <span>{L("Oracle EBS Pre-Validation Check Failed", "فشل التحقق الأولي في Oracle EBS")}</span>
          </div>
          <div className="space-y-1 text-xs">
            {issues.filter((i: any) => !i.ok).map((iss: any, idx: number) => (
              <div key={idx} className="text-rose-700 flex items-start gap-1.5">
                <span>•</span>
                <span><b>{iss.rule}:</b> {iss.note}</span>
              </div>
            ))}
          </div>
          {suggestedEndDate && (
            <div className="mt-2.5 p-2 bg-white rounded border border-rose-200 text-xs text-slate-700">
              💡 {L("System Suggestion:", "اقتراح النظام:")} {L("Adjust end date to", "تعديل تاريخ النهاية إلى")} <b>{prettyDate(suggestedEndDate, lang)}</b> {L("to eliminate the overlap.", "لتجنب التداخل مع الالتزامات الأخرى.")}
            </div>
          )}
        </div>
      );
    }

    case "refusal": {
      const { kind, reason, masked, law, severity } = card.data;
      return (
        <div className="panel p-4 my-2 border-2 border-rose-500 bg-rose-50">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-rose-200">
            <div className="flex items-center gap-2 text-rose-800 font-bold text-sm">
              <ShieldAlert size={18} />
              <span>{L("100% Security & PDPL Refusal Guardrail Triggered", "تفعيل حاجز الحماية وقانون حماية البيانات بنسبة 100%")}</span>
            </div>
            <span className="chip bg-rose-600 text-white font-mono text-[10px]">{severity}</span>
          </div>
          <div className="text-xs text-rose-900 space-y-1.5 leading-relaxed">
            <div><b>{L("Refusal Reason", "سبب الرفض")}:</b> {reason}</div>
            <div><b>{L("Governing Legal Standard", "المرجعية القانونية")}:</b> {law}</div>
            <div className="bg-white/80 p-2 rounded border border-rose-200 mono text-[11px] text-slate-700">
              {L("Masked Payload:", "البيانات بعد الحجب:")} "{masked}"
            </div>
            <div className="text-[11px] text-rose-700 pt-1">
              {L("Action Taken: Request blocked prior to LLM/Database invocation. A high-priority incident was dispatched to the NEDC SIEM and Compliance audit log.", "الإجراء المتخذ: تم حظر الطلب قبل وصوله للنموذج أو قاعدة البيانات، وسُجلت الواقعة فوراً في سجلات الرقابة الأمنية SIEM.")}
            </div>
          </div>
        </div>
      );
    }

    case "escalation": {
      const c = card.data;
      return (
        <div className="panel p-3.5 my-2 border-amber-300 bg-amber-50/50">
          <div className="flex items-center justify-between mb-2">
            <span className="chip bg-amber-600 text-white font-bold mono text-[10px]">{c.id}</span>
            <span className="text-[11px] text-amber-800 font-semibold">{L("Target SLA", "اتفاقية الخدمة")}: {c.slaHours} {L("hours", "ساعة")}</span>
          </div>
          <div className="text-xs font-bold text-slate-900 mb-1">{c.category} ({c.priority})</div>
          <div className="text-xs text-slate-600 mb-2">{c.summary}</div>
          <div className="text-[11px] text-slate-500 flex justify-between items-center border-t border-amber-200 pt-2">
            <span>{L("Sentiment Index", "مؤشر المشاعر")}: <b>{c.sentiment} ({c.sentimentLabel})</b></span>
            <button onClick={() => jump("manager")} className="text-nama-teal underline flex items-center gap-1 font-semibold">
              {L("View in HR Desk", "عرض في مكتب الموارد")} <ArrowRight size={12} />
            </button>
          </div>
        </div>
      );
    }

    case "finance": {
      const { items } = card.data;
      return (
        <div className="panel p-3.5 my-2 border-slate-200">
          <div className="font-bold text-sm text-navy pb-2 mb-2 border-b border-slate-200 flex items-center gap-2">
            <DollarSign className="text-nama-teal" size={16} />
            <span>{L("NEDC Financial System (Salary Advances & Loans)", "النظام المالي لنماء (السلف والقروض)")}</span>
          </div>
          <div className="space-y-2 text-xs">
            {items.map((it: any, i: number) => (
              <div key={i} className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                <div className="flex justify-between items-center font-bold text-slate-800">
                  <span>{it.ref} · {lang === "ar" ? it.typeAr : it.type}</span>
                  <span className="mono text-nama-teal">OMR {fmtOMR(it.amount)}</span>
                </div>
                <div className="text-[11px] text-slate-600 mt-1">{lang === "ar" ? it.statusAr : it.status}</div>
                <div className="text-[10px] text-slate-400 mt-0.5">{L("Terms", "الشروط")}: {it.installments}</div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    case "fleet": {
      const { items } = card.data;
      return (
        <div className="panel p-3.5 my-2 border-slate-200">
          <div className="font-bold text-sm text-navy pb-2 mb-2 border-b border-slate-200 flex items-center gap-2">
            <Building className="text-nama-teal" size={16} />
            <span>{L("NEDC Travel & 4x4 Fleet Management", "إدارة أسطول المركبات والمهام الرسمية")}</span>
          </div>
          <div className="space-y-2 text-xs">
            {items.map((it: any, i: number) => (
              <div key={i} className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                <div className="font-bold text-slate-800">{it.ref} · {lang === "ar" ? it.kindAr : it.kind}</div>
                <div className="text-slate-600 text-[11px] mt-0.5">{lang === "ar" ? it.purposeAr : it.purpose}</div>
                <div className="text-emerald-700 font-medium text-[11px] mt-1">{lang === "ar" ? it.statusAr : it.status}</div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    case "approvalStatus": {
      const { items } = card.data;
      return (
        <div className="panel p-3.5 my-2 border-slate-200">
          <div className="font-bold text-sm text-navy pb-2 mb-2 border-b border-slate-200">
            {L("My Transactions in Oracle Workflow", "معاملاتي في مسار موافقات Oracle")}
          </div>
          {items.length === 0 ? (
            <div className="text-xs text-slate-400 py-1">{L("No pending requests.", "لا توجد طلبات معلقة.")}</div>
          ) : (
            <div className="space-y-1.5 text-xs">
              {items.map((it: any) => (
                <div key={it.id} className="p-2 bg-slate-50 rounded flex justify-between items-center">
                  <div>
                    <div className="font-bold text-slate-800">{it.id} · {it.itemKey}</div>
                    <div className="text-slate-600 text-[11px]">{lang === "ar" ? it.summaryAr : it.summary}</div>
                  </div>
                  <span className={`chip ${it.status === "APPROVED" ? "bg-emerald-100 text-emerald-800" : it.status === "REJECTED" ? "bg-rose-100 text-rose-800" : "bg-amber-100 text-amber-800"}`}>
                    {it.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }

    default:
      return null;
  }
}
