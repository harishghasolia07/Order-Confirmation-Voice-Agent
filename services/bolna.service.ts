import { triggerBolnaCall } from "@/lib/bolna";
import { updateOrderStatus } from "@/services/order.service";

export async function initiateCall(
  orderId: string,
  phoneNumber: string,
  amount: number,
  userId: string
): Promise<void> {
  try {
    await updateOrderStatus({ userId, orderId, status: "CALLING" });

    await triggerBolnaCall({ phoneNumber, orderId, amount, userId });
  } catch (error) {
    await updateOrderStatus({ userId, orderId, status: "FAILED" }).catch(() => {});
    throw error;
  }
}
