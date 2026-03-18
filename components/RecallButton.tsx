"use client";

import { useState } from "react";
import { PhoneCall, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

interface RecallButtonProps {
  orderId: string;
  status: string;
}

export function RecallButton({ orderId, status }: RecallButtonProps) {
  const [loading, setLoading] = useState(false);
  const isDisabled = status === "CALLING" || status === "CONFIRMED";

  async function handleRecall() {
    setLoading(true);
    try {
      const res = await fetch("/api/trigger-call", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error((data as { error?: string }).error ?? "Failed to trigger call");
      }
      toast.success("Call triggered", { description: `Re-calling for order ${orderId}` });
    } catch (err) {
      toast.error("Call failed", {
        description: err instanceof Error ? err.message : "Unknown error",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      variant="outline"
      size="sm"
      disabled={isDisabled || loading}
      onClick={handleRecall}
      title={isDisabled ? "Cannot re-call: order is calling or already confirmed" : "Re-trigger confirmation call"}
    >
      {loading ? (
        <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
      ) : (
        <PhoneCall className="mr-2 h-3.5 w-3.5" />
      )}
      {isDisabled ? (status === "CALLING" ? "Calling…" : "Confirmed") : "Re-call Customer"}
    </Button>
  );
}
