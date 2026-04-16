import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { initiateCall } from "@/services/bolna.service";

export async function POST() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const pendingOrders = await prisma.orderConfirmation.findMany({
      where: { userId, status: "PENDING" },
      orderBy: { createdAt: "asc" },
    });

    if (pendingOrders.length === 0) {
      return NextResponse.json({ triggered: 0, message: "No pending orders to call" });
    }

    // Fire-and-forget all calls in parallel — same pattern as single order creation
    for (const order of pendingOrders) {
      initiateCall(order.orderId, order.phoneNumber, order.amount, userId).catch(() => {
        // Individual failures are handled inside initiateCall (sets status to FAILED)
      });
    }

    return NextResponse.json({ triggered: pendingOrders.length });
  } catch (error) {
    console.error("[POST /api/orders/batch-call]", error);
    return NextResponse.json(
      { error: "Failed to trigger batch calls" },
      { status: 500 }
    );
  }
}
