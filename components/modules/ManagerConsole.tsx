"use client";
import React, { useState } from "react";
import { Check, X, Clock, MessageSquare, AlertCircle, FilePlus, Search, ShieldCheck, UserCheck, CheckCircle2 } from "lucide-react";
import { useStore } from "@/lib/store";
import { prettyDate } from "@/lib/nlp";

export default function ManagerConsole() {
  const { L, lang, ledger, decide, cases, resolveCase, policies, addPolicy, persona } = useStore();
  const [activeTab, setActiveTab] = useState<"approvals" | "cases" | "kb">("approvals");
  const [commentInput, setCommentInput] = useState<Record<string, string>>({});
  const [resolutionInput, setResolutionInput] = useState<Record<string, string>>({});
  
  // KB Upload form modal
  const [newDocId, setNewDocId] = useState("");
  const [newTitleEn, setNewTitleEn] = useState("");
  const [newTitleAr, setNewTitleAr] = useState("");
  const [newOwner, setNewOwner] = useState("HR Operations Section");
  const [newKeywords, setNewKeywords] = useState("");
  const [newAnswerEn, setNewAnswerEn] = useState("");
  const [newAnswerAr, setNewAnswerAr] = useState("");
  const [showDocModal, setShowDocModal] = useState(false);

  const pendingApprovals = ledger.filter((l) => l.status === "PENDING_APPROVAL");
  const completedApprovals = ledger.filter((l) => l.status !== "PENDING_APPROVAL");

  const handleApprove = (id: string) => {
    decide(id, "APPROVED", commentInput[id]);
  };

  const handleReject = (id: string) => {
    decide(id, "REJECTED", commentInput[id]);
  };

  const handleResolve = (caseId: string) => {
    const text = resolutionInput[caseId] || "HR review completed and resolved per company policy.";
    resolveCase(caseId, text);
  };

  const handleCreatePolicy = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDocId || !newTitleEn || !newAnswerEn) return;
    addPolicy({
      id: newDocId.trim(),
      titleEn: newTitleEn.trim(),
      titleAr: newTitleAr.trim() || newTitleEn.trim(),
      version: "v1.0",
      effective: "Nov 2026",
      owner: newOwner,
      ownerAr: newOwner,
      classification: "Internal",
      clause: "§1.1",
      chunks: 14,
      indexedAt: new Date().toISOString().slice(0, 10),
      keywords: newKeywords.split(",").map((k) => k.trim()).filter(Boolean),
      answerEn: newAnswerEn.trim(),
      answerAr: newAnswerAr.trim() || newAnswerEn.trim(),
    });
    setShowDocModal(false);
    setNewDocId("");
    setNewTitleEn("");
    setNewTitleAr("");
    setNewAnswerEn("");
    setNewAnswerAr("");
  };

  return (
    <div className="p-4 space-y-4 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="panel p-4 bg-gradient-to-r from-navy to-slate-900 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <div className="text-base font-bold flex items-center gap-2">
            <UserCheck className="text-nama-teal" size={20} />
            {L("Manager Approvals & HR Service Delivery Console", "لوحة موافقات المدراء ومركز خدمات الموارد البشرية")}
          </div>
          <div className="text-xs text-slate-300 mt-0.5">
            {L("Oracle Workflow (AME) Inbox, Escalated Case Desk & Governed Policy Knowledge Base", "صندوق معتمدي Oracle AME، مركز تذاكر الموارد وقاعدة المعرفة الموثوقة")}
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab("approvals")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === "approvals" ? "bg-nama-teal text-white" : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            }`}
          >
            {L("Manager Inbox", "صندوق الموافقات")} ({pendingApprovals.length})
          </button>
          <button
            onClick={() => setActiveTab("cases")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === "cases" ? "bg-nama-teal text-white" : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            }`}
          >
            {L("HR Cases", "تذاكر الموارد")} ({cases.length})
          </button>
          <button
            onClick={() => setActiveTab("kb")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === "kb" ? "bg-nama-teal text-white" : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            }`}
          >
            {L("Governed Policy KB", "إدارة سياسات الموارد")} ({policies.length})
          </button>
        </div>
      </div>

      {/* TAB 1: Approvals Inbox */}
      {activeTab === "approvals" && (
        <div className="space-y-4">
          <div className="panel p-4 bg-white">
            <div className="font-bold text-sm text-navy mb-3 flex items-center justify-between">
              <span>{L("Pending Approvals (Oracle AME Routing)", "المعاملات بانتظار الاعتماد (مسار Oracle AME)")}</span>
              <span className="chip bg-amber-50 text-amber-800 border border-amber-200">
                {pendingApprovals.length} {L("pending action", "بانتظار الإجراء")}
              </span>
            </div>

            {pendingApprovals.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                <CheckCircle2 size={32} className="mx-auto mb-2 text-emerald-500" />
                {L("All pending Oracle AME transactions have been acted upon.", "تمت معالجة كافة طلبات ومعاملات مسار موافقات Oracle AME.")}
              </div>
            ) : (
              <div className="space-y-3">
                {pendingApprovals.map((item) => (
                  <div key={item.id} className="p-3.5 rounded-xl border border-amber-300 bg-amber-50/20 text-xs flex flex-col md:flex-row justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="chip bg-navy text-white font-mono text-[10px]">{item.id}</span>
                        <span className="text-slate-500 mono">{item.itemKey}</span>
                        <span className="font-bold text-slate-800">{lang === "ar" ? item.employeeNameAr : item.employeeName}</span>
                      </div>
                      <div className="font-semibold text-slate-700 text-sm mt-1">{lang === "ar" ? item.summaryAr : item.summary}</div>
                      <div className="text-[11px] text-slate-500">
                        {L("Submitted", "تاريخ التقديم")}: {new Date(item.submittedAt).toLocaleString()} · {L("Assigned Approver", "المعتمد المعين")}: {item.approver}
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2">
                      <input
                        type="text"
                        placeholder={L("Approval comment...", "ملاحظة الاعتماد...")}
                        value={commentInput[item.id] || ""}
                        onChange={(e) => setCommentInput({ ...commentInput, [item.id]: e.target.value })}
                        className="bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs w-48 focus:outline-none"
                      />
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => handleReject(item.id)}
                          className="btn-danger !py-1 text-xs"
                        >
                          <X size={14} /> {L("Reject", "رفض")}
                        </button>
                        <button
                          onClick={() => handleApprove(item.id)}
                          className="btn-primary !py-1 text-xs !bg-emerald-600 hover:!bg-emerald-700"
                        >
                          <Check size={14} /> {L("Approve in Oracle", "اعتماد في Oracle")}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* History */}
          <div className="panel p-4 bg-white">
            <div className="font-bold text-sm text-navy mb-3">
              {L("Recent Approval History", "سجل الموافقات المكتملة حديثاً")}
            </div>
            <div className="space-y-2 text-xs">
              {completedApprovals.map((item) => (
                <div key={item.id} className="p-2.5 rounded-lg bg-slate-50 flex items-center justify-between border border-slate-200">
                  <div>
                    <span className="font-bold text-slate-800">{item.id} · {item.employeeName}</span>
                    <span className="text-slate-500 ms-2">{item.summary}</span>
                  </div>
                  <span className={`chip ${item.status === "APPROVED" ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"}`}>
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: HR Case Desk */}
      {activeTab === "cases" && (
        <div className="panel p-4 bg-white space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <div>
              <div className="font-bold text-sm text-navy">{L("HR Escalation & Grievance Case Desk (Sec 14.2)", "مكتب تصعيد الشكاوى والتظلمات (البند 14.2)")}</div>
              <div className="text-xs text-slate-500">{L("Cases escalated from AI conversation with context, transcript & sentiment handover", "التذاكر المصعدة آلياً مع نقل سياق المحادثة وتحليل المشاعر")}</div>
            </div>
          </div>

          <div className="space-y-3">
            {cases.map((c) => (
              <div key={c.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 text-xs space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="chip bg-navy text-white mono font-bold text-[10px]">{c.id}</span>
                    <span className="font-bold text-slate-800">{c.employeeName} ({c.employeeId})</span>
                    <span className="chip bg-rose-50 text-rose-700 border border-rose-200">{c.priority}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500">{L("Target SLA", "المهلة")}: {c.slaHours}h</span>
                    <span className={`chip ${c.status === "RESOLVED" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}`}>
                      {c.status}
                    </span>
                  </div>
                </div>

                <div className="text-slate-700 font-medium">
                  {c.category} · {c.summary}
                </div>

                {/* Sentiment & Transcript Dropdown */}
                <div className="bg-white p-2.5 rounded-lg border border-slate-200 text-[11px] space-y-1">
                  <div className="flex justify-between font-semibold text-slate-700">
                    <span>{L("Sentiment Analysis Handover", "تحليل مشاعر المحادثة")}: <b className={c.sentiment < 0 ? "text-rose-600" : "text-emerald-600"}>{c.sentiment} ({c.sentimentLabel})</b></span>
                    <span>{c.transcript.length} {L("turns attached", "رسالة مرفقة")}</span>
                  </div>
                  <details>
                    <summary className="text-nama-teal cursor-pointer hover:underline">{L("Expand full conversation transcript handover", "عرض تفريغ نص المحادثة المصعدة")}</summary>
                    <div className="mt-2 space-y-1 bg-slate-50 p-2 rounded max-h-40 overflow-y-auto scroll-thin">
                      {c.transcript.map((t, idx) => (
                        <div key={idx} className="text-slate-600">
                          <b className="uppercase">{t.role}:</b> {t.content}
                        </div>
                      ))}
                    </div>
                  </details>
                </div>

                {/* Resolution action */}
                {c.status !== "RESOLVED" ? (
                  <div className="flex gap-2 items-center pt-1">
                    <input
                      type="text"
                      placeholder={L("Type official HR resolution to notify employee...", "اكتب قرار وحل الموارد البشرية لإشعار الموظف به...")}
                      value={resolutionInput[c.id] || ""}
                      onChange={(e) => setResolutionInput({ ...resolutionInput, [c.id]: e.target.value })}
                      className="flex-1 bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs focus:outline-none"
                    />
                    <button
                      onClick={() => handleResolve(c.id)}
                      className="btn-primary !py-1.5 text-xs"
                    >
                      {L("Send HR Resolution", "إرسال قرار الحل")}
                    </button>
                  </div>
                ) : (
                  <div className="p-2 bg-emerald-50 rounded text-emerald-800 border border-emerald-200">
                    <b>{L("HR Resolution Sent", "قرار الحل المرسل")}:</b> {c.resolution}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: Governed HR Policy Knowledge Base */}
      {activeTab === "kb" && (
        <div className="panel p-4 bg-white space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <div>
              <div className="font-bold text-sm text-navy">{L("Governed HR Knowledge Base Manager (RFP Sec 10 & 21.9)", "مدير قاعدة المعرفة الموثوقة لسياسات الموارد (البند 10 و 21.9)")}</div>
              <div className="text-xs text-slate-500">{L("Zero hallucination RAG index: All policies require version, effective date & named HR owner", "فهرس سياسات معتمد: كل وثيقة مقيدة بإصدار وتاريخ نفاذ ومالك محدد")}</div>
            </div>
            <button onClick={() => setShowDocModal(true)} className="btn-primary text-xs">
              <FilePlus size={14} /> {L("Index New Policy Document", "فهرسة وثيقة سياسة جديدة")}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {policies.map((pol) => (
              <div key={pol.id} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="chip bg-nama-teal text-white font-mono text-[10px]">{pol.id} {pol.version}</span>
                  <span className="chip bg-slate-200 text-slate-700">{pol.classification}</span>
                </div>
                <div className="font-bold text-slate-800 text-sm">{lang === "ar" ? pol.titleAr : pol.titleEn}</div>
                <div className="text-[11px] text-slate-500 flex justify-between">
                  <span>{L("Effective", "تاريخ النفاذ")}: {pol.effective} · {pol.clause}</span>
                  <span>{L("Owner", "الجهة المالكة")}: {lang === "ar" ? pol.ownerAr : pol.owner}</span>
                </div>
                <div className="p-2 bg-white rounded border border-slate-200 text-slate-600 text-[11px] italic">
                  "{lang === "ar" ? pol.answerAr : pol.answerEn}"
                </div>
                <div className="text-[10px] text-slate-400 flex justify-between pt-1 border-t border-slate-200">
                  <span>{pol.chunks} {L("vector chunks indexed", "أجزاء مفهرسة")}</span>
                  <span>{L("Last indexed", "تاريخ الفهرسة")}: {pol.indexedAt}</span>
                </div>
              </div>
            ))}
          </div>

          {/* New Document Modal */}
          {showDocModal && (
            <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="panel p-5 w-full max-w-lg bg-white space-y-3">
                <div className="flex justify-between items-center font-bold text-sm text-navy">
                  <span>{L("Index Governed Policy Document", "فهرسة وثيقة سياسة جديدة")}</span>
                  <button onClick={() => setShowDocModal(false)}><X size={16} /></button>
                </div>
                <form onSubmit={handleCreatePolicy} className="space-y-2.5 text-xs">
                  <div>
                    <label className="font-semibold text-slate-600 block">{L("Document ID", "رمز الوثيقة")}</label>
                    <input placeholder="NEDC-HR-POL-089" value={newDocId} onChange={(e) => setNewDocId(e.target.value)} required className="w-full border rounded p-1.5" />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-600 block">{L("Title (English)", "عنوان السياسة بالإنجليزي")}</label>
                    <input placeholder="Remote Work and Field Rotation Policy" value={newTitleEn} onChange={(e) => setNewTitleEn(e.target.value)} required className="w-full border rounded p-1.5" />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-600 block">{L("Title (Arabic)", "عنوان السياسة بالعربي")}</label>
                    <input placeholder="سياسة العمل عن بعد والمناوبة الميدانية" value={newTitleAr} onChange={(e) => setNewTitleAr(e.target.value)} className="w-full border rounded p-1.5" />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-600 block">{L("Named Policy Owner", "الجهة المالكة للسياسة")}</label>
                    <input value={newOwner} onChange={(e) => setNewOwner(e.target.value)} className="w-full border rounded p-1.5" />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-600 block">{L("Search Keywords (comma separated)", "كلمات البحث الدلالية")}</label>
                    <input placeholder="remote, work from home, rotation, مناوبة, عن بعد" value={newKeywords} onChange={(e) => setNewKeywords(e.target.value)} className="w-full border rounded p-1.5" />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-600 block">{L("Governed Policy Clause Text (English)", "نص بند السياسة المعتمد (إنجليزي)")}</label>
                    <textarea rows={2} value={newAnswerEn} onChange={(e) => setNewAnswerEn(e.target.value)} required className="w-full border rounded p-1.5" />
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <button type="button" onClick={() => setShowDocModal(false)} className="btn-ghost">{L("Cancel", "إلغاء")}</button>
                    <button type="submit" className="btn-primary">{L("Commit to Vector Index", "حفظ وفهرسة الوثيقة")}</button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
