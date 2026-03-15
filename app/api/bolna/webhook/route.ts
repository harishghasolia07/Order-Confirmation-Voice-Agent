import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  updateOrderStatus,
  getOrderByOrderId,
  getRecentCallingOrderByPhone,
  getMostRecentCallingOrder,
} from "@/services/order.service";

const validStatuses = ["CONFIRMED", "RESCHEDULED", "CANCELLED", "FAILED"] as const;
type ValidStatus = typeof validStatuses[number];

// ─── Schemas ─────────────────────────────────────────────────────────────────

const extractionSchema = z.object({
  order_id: z.string().optional(),
  status: z.string().optional(),
  delivery_slot: z.union([z.string(), z.null()]).optional(),
  call_summary: z.union([z.string(), z.null()]).optional(),
}).passthrough();

// Bolna's execution lifecycle webhook (the main one — contains transcript, extracted_data, etc.)
const executionPayloadSchema = z.object({
  status: z.string(), // "completed", "call-disconnected", "no-answer", "busy", "failed", etc.
  user_number: z.string().optional(),
  transcript: z.unknown().optional(),
  extracted_data: extractionSchema.nullish(),
  agent_extraction: extractionSchema.nullish(),
  custom_extractions: z.union([extractionSchema, z.array(extractionSchema)]).nullish(),
  telephony_data: z.object({
    to_number: z.string().optional(),
    to: z.string().optional(),
  }).passthrough().optional(),
  context_details: z.object({
    order_id: z.string().optional(),
    user_data: z.record(z.string(), z.unknown()).optional(),
  }).passthrough().optional(),
}).passthrough();

// ─── Helpers ──────────────────────────────────────────────────────────────────

function normalizeStatus(s: string): ValidStatus | null {
  const u = s?.toUpperCase?.();
  return validStatuses.includes(u as ValidStatus) ? (u as ValidStatus) : null;
}

/**
 * The Bolna agent outputs a structured JSON block as its last assistant message
 * (visible in the Bolna UI as "Sending call summary..."). This block is embedded
 * in the transcript text. We parse it from there since Bolna does not populate
 * extracted_data / agent_extraction / summary in the webhook.
 *
 * We search only assistant messages (to avoid false positives from user speech),
 * find all JSON objects that contain a valid "status" field, and return the last one.
 */
function extractFromTranscript(transcript: unknown): {
  status: ValidStatus;
  delivery_slot?: string;
  call_summary?: string;
} | null {
  // Collect text from assistant messages only
  let assistantText = "";
  if (Array.isArray(transcript)) {
    assistantText = (transcript as unknown[])
      .filter(
        (t) =>
          typeof t === "object" &&
          t != null &&
          (t as Record<string, unknown>).role === "assistant"
      )
      .map((t) => String((t as Record<string, unknown>).text ?? ""))
      .join("\n");

    // Some Bolna transcripts don't have a "role" field — fall back to all text
    if (!assistantText.trim()) {
      assistantText = (transcript as unknown[])
        .map((t) =>
          typeof t === "object" && t != null && "text" in (t as object)
            ? String((t as { text: unknown }).text)
            : ""
        )
        .join("\n");
    }
  } else if (typeof transcript === "string") {
    assistantText = transcript;
  }

  if (!assistantText.trim()) return null;

  // Match every {...} block that contains "status" (handles nested newlines too)
  const blocks = assistantText.match(/\{[\s\S]*?"status"[\s\S]*?\}/g);
  if (!blocks) return null;

  // Use the LAST valid block — that's the agent's final structured output
  for (let i = blocks.length - 1; i >= 0; i--) {
    try {
      const parsed = JSON.parse(blocks[i]) as Record<string, unknown>;
      const rawStatus = typeof parsed.status === "string" ? parsed.status : null;
      const normalized = rawStatus ? normalizeStatus(rawStatus) : null;
      if (normalized) {
        return {
          status: normalized,
          delivery_slot:
            parsed.delivery_slot != null && parsed.delivery_slot !== "null"
              ? String(parsed.delivery_slot)
              : undefined,
          call_summary:
            parsed.call_summary != null && parsed.call_summary !== "null"
              ? String(parsed.call_summary)
              : undefined,
        };
      }
    } catch {
      // Not valid JSON, try the next block
    }
  }

  return null;
}

// ─── Webhook Handler ──────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Record<string, unknown>;

    console.log("[bolna/webhook] Incoming", {
      status: body?.status,
      has_transcript: body?.transcript != null,
      has_extracted_data: body?.extracted_data != null,
      has_agent_extraction: body?.agent_extraction != null,
      user_number: body?.user_number,
    });

    const exec = executionPayloadSchema.safeParse(body);
    if (!exec.success) {
      console.warn("[bolna/webhook] Unrecognised payload:", exec.error.flatten());
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const d = exec.data;

    // Only act on final call states
    const ignoredStatuses = [
      "ringing", "in-progress", "initiated", "queued", "balance-low",
      "call-disconnected", // wait for "completed" which arrives right after
    ];
    if (ignoredStatuses.includes(d.status)) {
      console.log(`[bolna/webhook] Ignoring intermediate status: ${d.status}`);
      return NextResponse.json({ success: true, message: `Ignored: ${d.status}` });
    }

    // ── Resolve phone number ───────────────────────────────────────────────
    const tel = d.telephony_data as Record<string, unknown> | undefined;
    const phoneNumber =
      (tel?.to_number ?? tel?.to ?? d.user_number) != null
        ? String(tel?.to_number ?? tel?.to ?? d.user_number)
        : undefined;

    // ── Resolve orderId from context ───────────────────────────────────────
    const ctx = d.context_details as Record<string, unknown> | undefined;
    const userData = ctx?.user_data as Record<string, unknown> | undefined;
    const ctxOrderId = String(userData?.order_id ?? ctx?.order_id ?? "");
    let orderId: string | null =
      ctxOrderId && ctxOrderId !== "unknown" && ctxOrderId !== "" ? ctxOrderId : null;

    // ── Determine outcome status ───────────────────────────────────────────
    let orderStatus: ValidStatus | null = null;
    let deliverySlot: string | undefined;
    let callSummary: string | undefined;

    if (d.status === "completed") {
      // 1. Try structured extraction fields Bolna populates (rare but possible)
      type ExtObj = { status?: string; delivery_slot?: string | null; call_summary?: string | null } | null | undefined;
      const structuredExt: ExtObj =
        (d.extracted_data as ExtObj) ??
        (d.agent_extraction as ExtObj) ??
        (d.custom_extractions != null
          ? (Array.isArray(d.custom_extractions)
              ? (d.custom_extractions[0] as ExtObj)
              : (d.custom_extractions as ExtObj))
          : null);

      if (structuredExt?.status) {
        orderStatus = normalizeStatus(structuredExt.status);
        deliverySlot = structuredExt.delivery_slot ?? undefined;
        callSummary = structuredExt.call_summary ?? undefined;
        console.log("[bolna/webhook] Status from structured extraction", { orderStatus });
      }

      // 2. Parse the JSON block the agent writes in the transcript (primary source)
      if (!orderStatus && d.transcript != null) {
        const fromTranscript = extractFromTranscript(d.transcript);
        if (fromTranscript) {
          orderStatus = fromTranscript.status;
          deliverySlot = fromTranscript.delivery_slot;
          callSummary = fromTranscript.call_summary;
          console.log("[bolna/webhook] Status from transcript JSON block", { orderStatus, callSummary });
        }
      }

      if (!orderStatus) {
        console.log("[bolna/webhook] Completed but could not determine customer response — skipping update");
        return NextResponse.json({ success: true, message: "Completed but no outcome found" });
      }
    } else {
      // no-answer, busy, failed, canceled → mark as FAILED
      orderStatus = "FAILED";
      callSummary = `Call ended with status: ${d.status}`;
      console.log("[bolna/webhook] Call not answered / failed", { status: d.status });
    }

    // ── Resolve orderId if not in context ──────────────────────────────────
    if (!orderId && phoneNumber) {
      const recent = await getRecentCallingOrderByPhone(phoneNumber);
      if (recent) {
        orderId = recent.orderId;
        console.log("[bolna/webhook] Resolved orderId from phone", { phoneNumber, orderId });
      }
    }
    if (!orderId) {
      const recent = await getMostRecentCallingOrder();
      if (recent) {
        orderId = recent.orderId;
        console.log("[bolna/webhook] Resolved orderId from most recent CALLING order", { orderId });
      }
    }

    if (!orderId) {
      console.warn("[bolna/webhook] Could not resolve orderId — no CALLING order found");
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const order = await getOrderByOrderId(orderId);
    if (!order) {
      console.warn(`[bolna/webhook] Order not in DB: ${orderId}`);
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    await updateOrderStatus({ orderId, status: orderStatus, deliverySlot, callSummary });
    console.log("[bolna/webhook] Order updated ✓", { orderId, orderStatus, callSummary });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[POST /api/bolna/webhook]", error);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
