const BOLNA_BASE_URL = "https://api.bolna.ai";

export interface BolnaCallPayload {
  phoneNumber: string;
  orderId: string;
  amount: number;
  userId: string;
}

export interface BolnaCallResponse {
  callId?: string;
  status?: string;
  message?: string;
}

export async function triggerBolnaCall(
  payload: BolnaCallPayload
): Promise<BolnaCallResponse> {
  const apiKey = process.env.BOLNA_API_KEY;
  const agentId = process.env.BOLNA_AGENT_ID;

  if (!apiKey || !agentId) {
    throw new Error("Bolna API key or agent ID is not configured");
  }

  const response = await fetch(`${BOLNA_BASE_URL}/call`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      agent_id: agentId,
      recipient_phone_number: payload.phoneNumber,
      user_data: {
        order_id: payload.orderId,
        amount: payload.amount,
        user_id: payload.userId,
      },
    }),
    signal: AbortSignal.timeout(15000),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "Unknown error");
    throw new Error(
      `Bolna API error ${response.status}: ${errorText}`
    );
  }

  return response.json();
}
