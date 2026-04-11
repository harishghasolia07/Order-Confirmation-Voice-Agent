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
    <div className="min-h-screen bg-background relative overflow-x-hidden selection:bg-primary/30">
      {/* Background glow for dashboard */}
      <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] max-w-[800px] max-h-[800px] rounded-full bg-primary/5 blur-[150px] mix-blend-screen pointer-events-none" />
      
      <header className="sticky top-0 z-10 border-b border-white/5 bg-background/40 backdrop-blur-2xl supports-backdrop-filter:bg-background/20 shadow-[0_4px_30px_rgba(0,0,0,0.1)]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary shadow-[0_0_15px_rgba(186,158,255,0.4)]">
              <PhoneCall className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold leading-none space-grotesk tracking-tight text-foreground">
                Internal Ops
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5 font-medium tracking-wide uppercase">
                AI Voice Control
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

        <section className="relative z-10 glass-panel rounded-[2rem] p-8 mt-8">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold space-grotesk text-foreground">Order Confirmations</h2>
              <p className="text-sm text-muted-foreground font-light mt-1">
                Real-time AI voice confirmation logs and customer intent responses
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
