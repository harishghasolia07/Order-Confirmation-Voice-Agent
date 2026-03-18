import { OrderStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export interface CreateOrderInput {
  orderId: string;
  phoneNumber: string;
  amount: number;
}

export interface UpdateOrderStatusInput {
  orderId: string;
  status: OrderStatus;
  deliverySlot?: string;
  callSummary?: string;
}

export async function createOrder(input: CreateOrderInput) {
  return prisma.orderConfirmation.create({
    data: {
      orderId: input.orderId,
      phoneNumber: input.phoneNumber,
      amount: input.amount,
      status: "PENDING",
    },
  });
}

export async function getAllOrders() {
  return prisma.orderConfirmation.findMany({
    orderBy: { createdAt: "desc" },
  });
}

export async function getOrderByOrderId(orderId: string) {
  return prisma.orderConfirmation.findUnique({
    where: { orderId },
  });
}

/** Normalize phone to digits-only for comparison (e.g. +91 7737902144 -> 917737902144). */
function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, "") || phone;
}

/** Find most recent order in CALLING status for a phone number (fallback when webhook sends order_id unknown). */
export async function getRecentCallingOrderByPhone(phoneNumber: string) {
  const normalized = normalizePhone(phoneNumber);
  const calling = await prisma.orderConfirmation.findMany({
    where: { status: "CALLING" },
    orderBy: { createdAt: "desc" },
  });
  return calling.find((o) => normalizePhone(o.phoneNumber) === normalized) ?? null;
}

/** Find single most recent order in CALLING status (fallback when webhook sends order_id unknown and no phone). */
export async function getMostRecentCallingOrder() {
  return prisma.orderConfirmation.findFirst({
    where: { status: "CALLING" },
    orderBy: { createdAt: "desc" },
  });
}

export async function updateOrderStatus(input: UpdateOrderStatusInput) {
  return prisma.orderConfirmation.update({
    where: { orderId: input.orderId },
    data: {
      status: input.status,
      ...(input.deliverySlot !== undefined && {
        deliverySlot: input.deliverySlot,
      }),
      ...(input.callSummary !== undefined && {
        callSummary: input.callSummary,
      }),
    },
  });
}

export async function getAnalytics() {
  const startOfToday = new Date();
  startOfToday.setUTCHours(0, 0, 0, 0);

  const [orders, todayOrders] = await Promise.all([
    prisma.orderConfirmation.findMany({
      select: { status: true, amount: true },
    }),
    prisma.orderConfirmation.findMany({
      where: { createdAt: { gte: startOfToday } },
      select: { status: true },
    }),
  ]);

  const total = orders.length;
  const confirmed = orders.filter((o) => o.status === "CONFIRMED").length;
  const cancelled = orders.filter((o) => o.status === "CANCELLED").length;
  const rescheduled = orders.filter((o) => o.status === "RESCHEDULED").length;
  const failed = orders.filter((o) => o.status === "FAILED").length;
  const totalCalls = orders.filter((o) => o.status !== "PENDING").length;

  const confirmationRate =
    totalCalls > 0 ? Math.round((confirmed / totalCalls) * 100) : 0;

  const avgOrderValue =
    total > 0
      ? orders.reduce((sum, o) => sum + o.amount, 0) / total
      : 1500;

  const rtoReduced = Math.round(confirmed * 0.267);
  const estimatedSavings = Math.round(rtoReduced * avgOrderValue);

  // Today's metrics
  const todayCalls = todayOrders.filter((o) => o.status !== "PENDING").length;
  const todayConfirmed = todayOrders.filter((o) => o.status === "CONFIRMED").length;
  const todayConfirmationRate =
    todayCalls > 0 ? Math.round((todayConfirmed / todayCalls) * 100) : 0;

  return {
    total,
    confirmed,
    cancelled,
    rescheduled,
    failed,
    totalCalls,
    confirmationRate,
    rtoReduced,
    estimatedSavings,
    todayCalls,
    todayConfirmationRate,
  };
}
