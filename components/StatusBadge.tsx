"use client";

import { Badge } from "@/components/ui/badge";
import { OrderStatus } from "@prisma/client";

const statusConfig: Record<
  OrderStatus,
  { label: string; variant: "default" | "secondary" | "destructive" | "outline"; className: string }
> = {
  PENDING: {
    label: "Pending",
    variant: "secondary",
    className: "bg-gray-100 text-gray-700 hover:bg-gray-100",
  },
  CALLING: {
    label: "Calling...",
    variant: "default",
    className: "bg-blue-100 text-blue-700 hover:bg-blue-100 animate-pulse",
  },
  CONFIRMED: {
    label: "Confirmed",
    variant: "default",
    className: "bg-green-100 text-green-700 hover:bg-green-100",
  },
  RESCHEDULED: {
    label: "Rescheduled",
    variant: "default",
    className: "bg-yellow-100 text-yellow-700 hover:bg-yellow-100",
  },
  CANCELLED: {
    label: "Cancelled",
    variant: "destructive",
    className: "bg-red-100 text-red-700 hover:bg-red-100",
  },
  FAILED: {
    label: "Failed",
    variant: "destructive",
    className: "bg-red-100 text-red-700 hover:bg-red-100",
  },
};

interface StatusBadgeProps {
  status: OrderStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status];
  return (
    <Badge className={`font-medium border-0 ${config.className}`}>
      {config.label}
    </Badge>
  );
}
