import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { createOrder, getAllOrders } from "@/services/order.service";
import { initiateCall } from "@/services/bolna.service";

const createOrderSchema = z.object({
  orderId: z.string().min(1, "Order ID is required"),
  phoneNumber: z
    .string()
    .regex(
      /^\+91[6-9]\d{9}$/,
      "Phone number must be a valid Indian number (e.g. +919876543210)"
    ),
  amount: z.number().positive("Amount must be greater than 0"),
});

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = createOrderSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { orderId, phoneNumber, amount } = parsed.data;

    const order = await createOrder({ userId, orderId, phoneNumber, amount });

    initiateCall(orderId, phoneNumber, amount, userId).catch((err) => {
      console.error(`[trigger-call] Failed for order ${orderId}:`, err);
    });

    return NextResponse.json(order, { status: 201 });
  } catch (error: unknown) {
    if (
      error instanceof Error &&
      error.message.includes("Unique constraint")
    ) {
      return NextResponse.json(
        { error: "Order ID already exists" },
        { status: 409 }
      );
    }
    console.error("[POST /api/orders]", error);
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const orders = await getAllOrders(userId);
    return NextResponse.json(orders);
  } catch (error) {
    console.error("[GET /api/orders]", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}
