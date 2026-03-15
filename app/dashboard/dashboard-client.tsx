"use client";

import useSWR from "swr";
import { UserButton } from "@clerk/nextjs";
import { PhoneCall, RefreshCw, AlertCircle } from "lucide-react";
import { OrderConfirmation } from "@prisma/client";
import { OrderTable } from "@/components/OrderTable";
import { CreateOrderForm } from "@/components/CreateOrderForm";
import { AnalyticsSection } from "@/components/AnalyticsSection";
import { Separator } from "@/components/ui/separator";

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
}

async function fetcher<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch");
  return res.json();
}

export function DashboardClient() {
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
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
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
