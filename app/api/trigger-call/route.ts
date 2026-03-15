import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { initiateCall } from "@/services/bolna.service";
import { getOrderByOrderId } from "@/services/order.service";

const triggerCallSchema = z.object({
  orderId: z.string().min(1, "Order ID is required"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = triggerCallSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { orderId } = parsed.data;
    const order = await getOrderByOrderId(orderId);

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (order.status === "CALLING" || order.status === "CONFIRMED") {
      return NextResponse.json(
        { error: `Cannot trigger call — order is already ${order.status}` },
        { status: 409 }
      );
    }

    await initiateCall(order.orderId, order.phoneNumber, order.amount);

    return NextResponse.json({ success: true, orderId });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to trigger call";
    console.error("[POST /api/trigger-call]", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
