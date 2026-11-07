import { NextRequest, NextResponse } from "next/server";
import { orchestrate } from "@/lib/orchestrator";
import type { ChatRequestBody } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as ChatRequestBody;
    if (!body?.messages?.length) return NextResponse.json({ error: "messages required" }, { status: 400 });
    // Server-side input hygiene: cap message size & history depth (PDPL data minimisation)
    body.messages = body.messages.slice(-16).map((m) => ({ role: m.role, content: String(m.content || "").slice(0, 2000) }));
    const res = await orchestrate(body);
    return NextResponse.json(res, { headers: { "X-Correlation-ID": res.session.correlationId, "X-Data-Residency": "OM" } });
  } catch (e: any) {
    return NextResponse.json({ error: "orchestrator_failure", detail: String(e?.message || e) }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    service: "NEDC AI Orchestrator",
    groqConfigured: Boolean(process.env.GROQ_API_KEY),
    model: process.env.GROQ_MODEL || "llama-3.3-70b-versatile",
    fallback: "deterministic",
  });
}
