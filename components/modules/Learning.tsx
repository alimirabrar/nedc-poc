"use client";
import React, { useState } from "react";
import { GraduationCap, Award, BookOpen, CheckCircle2, Clock, Sparkles, ShieldCheck, ArrowRight, UserCheck } from "lucide-react";
import { useStore } from "@/lib/store";

interface Course {
  id: string;
  code: string;
  titleEn: string;
  titleAr: string;
  category: "Technical Grid" | "Health & Safety" | "Regulatory & PDPL" | "Leadership";
  categoryAr: string;
  duration: string;
  durationAr: string;
  mandatoryFor: string[];
  credits: number;
  provider: "Oracle Learning Management (OLM)";
  descEn: string;
  descAr: string;
}

const COURSES: Course[] = [
  {
    id: "CRS-HV-01",
    code: "NEDC-OLM-HV-401",
    titleEn: "High-Voltage Substation Safety Certification (HV-401)",
    titleAr: "شهادة سلامة محطات الجهد العالي (HV-401)",
    category: "Health & Safety",
    categoryAr: "الصحة والسلامة",
    duration: "16 hours (2 days)",
    durationAr: "١٦ ساعة (يومان)",
    mandatoryFor: ["NEDC-G08 (Operations)", "NEDC-G09 (Engineering)", "NEDC-M03 (Management)"],
    credits: 15,
    provider: "Oracle Learning Management (OLM)",
    descEn: "Mandatory qualification for field engineers operating 132/33kV distribution substations in Oman.",
    descAr: "تأهيل إلزامي لكافة المهندسين الميدانيين المشرفين على محطات التوزيع 132/33 ك.ف بالسلطنة.",
  },
  {
    id: "CRS-PDPL-02",
    code: "NEDC-OLM-LAW-102",
    titleEn: "Oman PDPL Data Privacy & Security Governance (Royal Decree 6/2022)",
    titleAr: "حوكمة خصوصية البيانات وقانون حماية البيانات العُماني (المرسوم 6/2022)",
    category: "Regulatory & PDPL",
    categoryAr: "الامتثال والتشريعات",
    duration: "8 hours (1 day)",
    durationAr: "٨ ساعات (يوم واحد)",
    mandatoryFor: ["All Grades"],
    credits: 10,
    provider: "Oracle Learning Management (OLM)",
    descEn: "Data classification, cross-border restrictions, employee privacy rights and SIEM audit duties.",
    descAr: "تصنيف البيانات، ضوابط النقل الحدودي، حقوق خصوصية الموظفين والتزامات التدقيق في سجلات SIEM.",
  },
  {
    id: "CRS-SCADA-03",
    code: "NEDC-OLM-TECH-305",
    titleEn: "Advanced Smart Grid SCADA & DMS Automation",
    titleAr: "أنظمة التحكم المتقدمة للشبكات الذكية SCADA و DMS",
    category: "Technical Grid",
    categoryAr: "الشبكات الفنية",
    duration: "24 hours (3 days)",
    durationAr: "٢٤ ساعة (٣ أيام)",
    mandatoryFor: ["NEDC-G08 (Operations)", "NEDC-G09 (Engineering)"],
    credits: 20,
    provider: "Oracle Learning Management (OLM)",
    descEn: "Distribution management systems, automated fault detection and feeder reconfiguration.",
    descAr: "إدارة شبكات التوزيع ورصد الأعطال الآلي وإعادة توزيع الأحمال الكهربائية.",
  },
  {
    id: "CRS-LEAD-04",
    code: "NEDC-OLM-MGT-201",
    titleEn: "Leadership & Incident Command for Grid Operations Supervisors",
    titleAr: "القيادة وإدارة حوادث الطوارئ لمشرفي عمليات الشبكة",
    category: "Leadership",
    categoryAr: "القيادة والإدارة",
    duration: "12 hours (1.5 days)",
    durationAr: "١٢ ساعة (يوم ونصف)",
    mandatoryFor: ["NEDC-M03 (Management)", "NEDC-E01 (Executive)"],
    credits: 12,
    provider: "Oracle Learning Management (OLM)",
    descEn: "Crisis management, emergency storm response, crew dispatching and communication protocols.",
    descAr: "إدارة الأزمات والاستجابة لطوارئ الأنواء المناخية وبروتوكولات توجيه الفرق الميدانية.",
  },
];

export default function Learning() {
  const { L, lang, persona, enrolled, enroll } = useStore();
  const [filter, setFilter] = useState<string>("ALL");

  const filteredCourses = COURSES.filter((c) => filter === "ALL" || c.category === filter);

  return (
    <div className="p-4 space-y-4 max-w-7xl mx-auto">
      {/* Header */}
      <div className="panel p-4 bg-gradient-to-r from-navy to-slate-900 text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
        <div>
          <div className="text-base font-bold flex items-center gap-2">
            <GraduationCap className="text-nama-teal" size={20} />
            {L("Arabic-Enabled Learning & Competency Portal (RFP Sec 14.1 / Spec E.1–E.4)", "بوابة التعلم وتطوير الكفاءات المدعومة باللغة العربية (البند 14.1)")}
          </div>
          <div className="text-xs text-slate-300 mt-0.5">
            {L("Oracle Learning Management (OLM) 1-Click Direct Enrolment & Personalized Competency Matrix", "التسجيل المباشر بضغطة واحدة في Oracle OLM ومصفوفة الكفاءات المخصصة للوظيفة")}
          </div>
        </div>

        <div className="flex items-center gap-2 bg-slate-800/80 p-2 rounded-xl text-xs border border-slate-700">
          <Award className="text-nama-teal" size={16} />
          <span>
            {L("Authenticated Grade", "الدرجة الوظيفية")}: <b className="text-white">{persona.grade}</b>
          </span>
        </div>
      </div>

      {/* Competency Gap Summary Bar */}
      <div className="panel p-4 bg-white flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-xs">
          <div className="font-bold text-navy flex items-center gap-1.5 text-sm">
            <Sparkles className="text-nama-teal" size={16} />
            {L("AI Personalized Course Recommendations for", "ترشيحات الذكاء الاصطناعي المخصصة لـ")} {persona.nameEn}
          </div>
          <div className="text-slate-500">
            {L("Based on your Oracle EBS job profile, grade and mandatory utility field safety requirements.", "مستخلصة من بيانات الوظيفة والدرجة واشتراطات السلامة الميدانية لشبكات الكهرباء.")}
          </div>
        </div>

        <div className="flex gap-1.5 text-xs">
          {["ALL", "Health & Safety", "Technical Grid", "Regulatory & PDPL", "Leadership"].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                filter === cat ? "bg-nama-teal text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredCourses.map((c) => {
          const isEnrolled = enrolled.includes(c.id);
          const isMandatory = c.mandatoryFor.includes(persona.grade) || c.mandatoryFor.includes("All Grades");

          return (
            <div
              key={c.id}
              className={`panel p-4 bg-white flex flex-col justify-between border-2 transition ${
                isEnrolled ? "border-emerald-400 bg-emerald-50/10" : isMandatory ? "border-amber-300" : "border-slate-200"
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="chip bg-navy text-white mono font-bold text-[10px]">{c.code}</span>
                  <div className="flex items-center gap-1.5">
                    {isMandatory && (
                      <span className="chip bg-amber-100 text-amber-800 text-[10px] font-bold">
                        {L("Mandatory for Grade", "إلزامي للدرجة")}
                      </span>
                    )}
                    <span className="chip bg-slate-100 text-slate-700 text-[10px]">{c.duration}</span>
                  </div>
                </div>

                <div className="font-bold text-sm text-navy mt-1">
                  {lang === "ar" ? c.titleAr : c.titleEn}
                </div>

                <div className="text-xs text-slate-600 leading-relaxed">
                  {lang === "ar" ? c.descAr : c.descEn}
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
                  <span>{L("OLM Training Credits", "النقاط المعتمدة")}: <b>{c.credits} CPD</b></span>
                  <span>{L("Provider", "الجهة")}: <b className="text-slate-700">{c.provider}</b></span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  {isEnrolled ? L("Enrolled via Oracle ISG", "تم التسجيل عبر واجهة ISG") : L("Direct booking in EBS", "حجز مباشر في EBS")}
                </span>

                {isEnrolled ? (
                  <span className="chip bg-emerald-100 text-emerald-800 font-bold flex items-center gap-1 px-3 py-1">
                    <CheckCircle2 size={13} /> {L("Enrolled in OLM", "مسجل في OLM")}
                  </span>
                ) : (
                  <button
                    onClick={() => enroll(c.id)}
                    className="btn-primary text-xs !bg-nama-teal hover:!bg-teal-700 shadow-xs flex items-center gap-1"
                  >
                    <BookOpen size={13} /> {L("1-Click Enrol (EBS)", "تسجيل مباشر (EBS)")}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
