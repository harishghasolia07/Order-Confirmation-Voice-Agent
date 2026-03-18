import { notFound } from "next/navigation";
import Link from "next/link";
import { getOrderByOrderId } from "@/services/order.service";
import { StatusBadge } from "@/components/StatusBadge";
import { RecallButton } from "@/components/RecallButton";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Phone, IndianRupee, Clock, FileText } from "lucide-react";

interface OrderDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: OrderDetailPageProps) {
  const { id } = await params;
  return { title: `Order ${id} — CODConfirm AI` };
}

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  const { id } = await params;
  const order = await getOrderByOrderId(id);

  if (!order) {
    notFound();
  }

  const fields = [
    {
      label: "Order ID",
      value: order.orderId,
      icon: <FileText className="h-4 w-4 text-muted-foreground" />,
    },
    {
      label: "Phone Number",
      value: order.phoneNumber,
      icon: <Phone className="h-4 w-4 text-muted-foreground" />,
    },
    {
      label: "Order Amount",
      value: `₹${order.amount.toLocaleString("en-IN")}`,
      icon: <IndianRupee className="h-4 w-4 text-muted-foreground" />,
    },
    {
      label: "Delivery Slot",
      value: order.deliverySlot ?? "Not specified",
      icon: <Clock className="h-4 w-4 text-muted-foreground" />,
    },
  ];

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-2xl space-y-6">
        <Button variant="ghost" size="sm" asChild className="-ml-2">
          <Link href="/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>

        <Card>
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div>
                <CardTitle className="font-mono text-xl">
                  {order.orderId}
                </CardTitle>
                <CardDescription className="mt-1">
                  Created{" "}
                  {new Date(order.createdAt).toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </CardDescription>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <StatusBadge status={order.status} />
                <RecallButton orderId={order.orderId} status={order.status} />
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Separator />
            <div className="grid gap-4 sm:grid-cols-2">
              {fields.map((field) => (
                <div key={field.label} className="flex items-start gap-3">
                  <div className="mt-0.5">{field.icon}</div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      {field.label}
                    </p>
                    <p className="mt-1 text-sm font-medium">{field.value}</p>
                  </div>
                </div>
              ))}
            </div>

            {order.callSummary && (
              <>
                <Separator />
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                    Call Summary
                  </p>
                  <p className="text-sm leading-relaxed text-foreground bg-muted/40 rounded-md p-3">
                    {order.callSummary}
                  </p>
                </div>
              </>
            )}

            <Separator />
            <p className="text-xs text-muted-foreground">
              Last updated:{" "}
              {new Date(order.updatedAt).toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "long",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
