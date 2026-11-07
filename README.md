# NEDC AI-Powered Automation & Employee Self-Service Platform (POC)
**Tender Reference:** NEDC-2026-146  
**Client:** Nama Electricity Distribution Company (NEDC / نماء لتوزيع الكهرباء)  
**Scope:** AI-Powered Automation & Employee Self-Service Platform on top of Oracle E-Business Suite (EBS) HRMS (~1,300 Concurrent Employees).  
**Core Architectural Mandate:** "Zero-Core-Modification, Logically Decoupled Conversational AI Overlay" sitting on top of Oracle EBS HRMS via API Gateway + Oracle Integration Cloud (OIC) + Oracle Integrated SOA Gateway (ISG) / SSHR / AME Approval Workflows, strictly compliant with the **Oman Personal Data Protection Law (PDPL)** and In-Country Sovereign Hosting rules.

---

## 🚀 Key Modules & Architecture

1. **Bilingual AI Employee Self-Service Workspace + Live OIC/EBS X-Ray Inspector (Sec 8, 9, 10, 11 & 37):**
   - 8 One-Click Tender Demonstration Scenarios (Omani dialect switch, EBS data retrieval, Governed RAG citations, 28-step leave flow with explicit confirmation, profile updates, 100% security & PDPL refusal guardrail, HR case escalation, cross-system queries).
   - 9-Layer Architecture Flow Visualizer (Channel ➔ IAM/SSO ➔ Bilingual NLP ➔ AI Orchestrator ➔ Governed RAG ➔ API Gateway ➔ OIC/ISG Adapter ➔ Oracle EBS HRMS ➔ SIEM Audit).
   - 28-Step Guided Transaction State Machine with zero direct DB writes (routed strictly via Oracle AME).
   - Web Speech API voice input (Arabic `ar-OM` & English `en-US`) and instant RTL/LTR switching.

2. **Manager Approvals & HR Service Delivery Console (Sec 11.3 & 14.2):**
   - Oracle Workflow (AME) approval desk with real-time bilingual notifications to employees.
   - HR Escalation Case Desk with SLA timers, attached bilingual chat transcripts, and sentiment scores.
   - Governed HR Policy Knowledge Base manager with live indexing modal.

3. **10-Stage Employee Lifecycle Automation Hub (Sec 12):**
   - Full pipeline covering Recruitment, Onboarding, Admin, Leave, Payroll, Benefits, Learning, Performance, Career Movement, and Separation.
   - 12-step standardized automation workflows with Release-1 prioritization scoring and interactive simulation.

4. **Role-Based HR Analytics, Predictive Insights & Unresolved Query Loop (Sec 13):**
   - 4-Role Dashboard Switcher (Employee, Line Manager, HR Operations, Executive View).
   - Human-in-the-Loop predictive absence forecaster backed by the 13-Step Model Governance charter.
   - Unresolved Query triage loop with 1-click promotion to UAT.

5. **Arabic-Enabled Learning & Competency Portal (Sec 14.1):**
   - Personalized course recommendations linked to Oracle EBS grade and 1-click Oracle Learning Management (OLM) enrolment.

6. **NEDC Enterprise Ecosystem Integrations Hub (Sec 15):**
   - Live health monitors, latency telemetry, and interactive API tester for all 6 mandatory system groups (Oracle EBS HRMS, Payroll FastFormula, IAM SSO, Finance Advances, Admin Letters, Fleet 4x4 Dispatch).

7. **Oman PDPL, SIEM Audit, 1,300-User Scalability & Compliance Matrix (Sec 16–22 & 36):**
   - Live SIEM immutable audit stream tagged with Correlation IDs (`CORR-NEDC-...`).
   - Oman In-Country Hosting Topology (OM-MCT-1 Primary / OM-SOH-2 DR with RPO ≤ 1hr / RTO ≤ 4hrs).
   - Interactive 1,300-user concurrency load simulator maintaining `< 3s` queries and `< 5s` EBS transactions.
   - Searchable 126-Point RFP Compliance Drawer with 1-click jumps to live feature proofs.

---

## 🛠️ Tech Stack & Deployment

- **Framework:** Next.js 14+ (App Router), TypeScript, Tailwind CSS, Lucide React
- **Serverless AI Route:** `/api/chat/route.ts` with Groq SDK (`llama-3.3-70b-versatile`) + high-fidelity deterministic fallback engine
- **Zero-Config Deployment:** 100% serverless ready for Vercel

---

## 🔑 Environment Variables for Vercel

To configure in your **Vercel Project Settings ➔ Environment Variables**:

| Variable Name | Required? | Recommended Value | Description |
|---|---|---|---|
| `GROQ_API_KEY` | Optional | `gsk_...` | Groq Cloud API Key. If omitted, the platform automatically runs in deterministic Demo Mode (all 8 demo scenarios, tools, and mock EBS integrations operate seamlessly). |
| `GROQ_MODEL` | Optional | `llama-3.3-70b-versatile` | Groq LLM model identifier. Defaults to `llama-3.3-70b-versatile`. |
