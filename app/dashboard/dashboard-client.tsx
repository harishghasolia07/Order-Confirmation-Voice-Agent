"use client";

import { useState } from "react";
import useSWR from "swr";
import { UserButton } from "@clerk/nextjs";
import { PhoneCall, RefreshCw, AlertCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { OrderConfirmation } from "@prisma/client";
import { OrderTable } from "@/components/OrderTable";
import { CreateOrderForm } from "@/components/CreateOrderForm";
import { AnalyticsSection } from "@/components/AnalyticsSection";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "../../components/ThemeToggle";

interface AnalyticsData {
  total: number;
  confirmed: number;
  cancelled: number;
  rescheduled: number;
  failed: number;
  totalCalls: number;
  confirmationRate: number;
  rtoReduced: number;
  estimatedSavings: number;
  todayCalls: number;
  todayConfirmationRate: number;
}

async function fetcher<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch");
  return res.json();
}

export function DashboardClient() {
  const [batchLoading, setBatchLoading] = useState(false);

  const {
    data: orders,
    error: ordersError,
    mutate: mutateOrders,
    isValidating,
  } = useSWR<OrderConfirmation[]>("/api/orders", fetcher, {
    refreshInterval: 5000,
    revalidateOnFocus: true,
  });

  const { data: analytics, mutate: mutateAnalytics } = useSWR<AnalyticsData>(
    "/api/analytics",
    fetcher,
    {
      refreshInterval: 5000,
      revalidateOnFocus: true,
    }
  );

  function handleOrderCreated() {
    mutateOrders();
    mutateAnalytics();
  }

  async function handleCallAllPending() {
    setBatchLoading(true);
    try {
      const res = await fetch("/api/orders/batch-call", { method: "POST" });
      const data = (await res.json()) as { triggered?: number; message?: string; error?: string };
      if (!res.ok) throw new Error(data.error ?? "Batch call failed");
      if (data.triggered === 0) {
        toast.info("No pending orders", { description: "All orders have already been called." });
      } else {
        toast.success(`Started ${data.triggered} call${data.triggered === 1 ? "" : "s"}`, {
          description: "Bolna AI is calling all pending orders.",
        });
      }
      mutateOrders();
      mutateAnalytics();
    } catch (err) {
      toast.error("Batch call failed", {
        description: err instanceof Error ? err.message : "Unknown error",
      });
    } finally {
      setBatchLoading(false);
    }
  }

  const pendingCount = orders?.filter((o) => o.status === "PENDING").length ?? 0;

  const defaultAnalytics: AnalyticsData = {
    total: 0,
    confirmed: 0,
    cancelled: 0,
    rescheduled: 0,
    failed: 0,
    totalCalls: 0,
    confirmationRate: 0,
    rtoReduced: 0,
    estimatedSavings: 0,
    todayCalls: 0,
    todayConfirmationRate: 0,
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary">
              <PhoneCall className="h-4 w-4 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-semibold leading-none">
                CODConfirm AI
              </h1>
              <p className="text-xs text-muted-foreground">
                AI-powered COD confirmation
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {isValidating && (
              <RefreshCw className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
            )}
            <span className="text-xs text-muted-foreground">
              Auto-refreshes every 5s
            </span>
            <Separator orientation="vertical" className="h-6" />
            <ThemeToggle />
            <UserButton />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-8 p-6">
        <AnalyticsSection data={analytics ?? defaultAnalytics} />

        <CreateOrderForm onSuccess={handleOrderCreated} />

        <section>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Order Confirmations</h2>
              <p className="text-sm text-muted-foreground">
                Customer response (confirm / reschedule / cancel) for each order
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              disabled={batchLoading || pendingCount === 0}
              onClick={handleCallAllPending}
            >
              {batchLoading ? (
                <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
              ) : (
                <PhoneCall className="mr-2 h-3.5 w-3.5" />
              )}
              Call All Pending
              {pendingCount > 0 && (
                <span className="ml-1.5 rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-semibold text-primary-foreground">
                  {pendingCount}
                </span>
              )}
            </Button>
          </div>

          {ordersError ? (
            <div className="flex items-center gap-2 rounded-md border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0" />
              Failed to load orders. Retrying automatically...
            </div>
          ) : (
            <OrderTable orders={orders ?? []} />
          )}
        </section>
      </main>
    </div>
  );
}
