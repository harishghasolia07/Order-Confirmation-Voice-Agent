import { triggerBolnaCall } from "@/lib/bolna";
import { updateOrderStatus } from "@/services/order.service";

export async function initiateCall(
  orderId: string,
  phoneNumber: string,
  amount: number
): Promise<void> {
  try {
    await updateOrderStatus({ orderId, status: "CALLING" });

    await triggerBolnaCall({ phoneNumber, orderId, amount });
  } catch (error) {
    await updateOrderStatus({ orderId, status: "FAILED" }).catch(() => {});
    throw error;
  }
}
