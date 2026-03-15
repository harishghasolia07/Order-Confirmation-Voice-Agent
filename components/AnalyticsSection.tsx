"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  CheckCircle,
  XCircle,
  Clock,
  PhoneCall,
  TrendingUp,
  PiggyBank,
} from "lucide-react";

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

interface AnalyticsSectionProps {
  data: AnalyticsData;
}

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: React.ReactNode;
  colorClass: string;
}

function StatCard({ title, value, description, icon, colorClass }: StatCardProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className={`mt-1 text-2xl font-bold ${colorClass}`}>{value}</p>
            {description && (
              <p className="mt-1 text-xs text-muted-foreground">{description}</p>
            )}
          </div>
          <div className={`rounded-full p-2.5 ${colorClass} bg-opacity-10`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function AnalyticsSection({ data }: AnalyticsSectionProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard
          title="Total Calls"
          value={data.totalCalls}
          description={`${data.total} orders total`}
          icon={<PhoneCall className="h-5 w-5 text-blue-600" />}
          colorClass="text-blue-600"
        />
        <StatCard
          title="Confirmed"
          value={data.confirmed}
          description={`${data.confirmationRate}% confirmation rate`}
          icon={<CheckCircle className="h-5 w-5 text-green-600" />}
          colorClass="text-green-600"
        />
        <StatCard
          title="Cancelled"
          value={data.cancelled}
          icon={<XCircle className="h-5 w-5 text-red-600" />}
          colorClass="text-red-600"
        />
        <StatCard
          title="Rescheduled"
          value={data.rescheduled}
          icon={<Clock className="h-5 w-5 text-yellow-600" />}
          colorClass="text-yellow-600"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="h-4 w-4 text-primary" />
              Confirmation Rate
            </CardTitle>
            <CardDescription>
              Percentage of calls where customer confirmed the order (not rescheduled/cancelled)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-3">
              <span className="text-4xl font-bold text-primary">
                {data.confirmationRate}%
              </span>
              <span className="mb-1 text-sm text-muted-foreground">
                ({data.confirmed} / {data.totalCalls} outcomes)
              </span>
            </div>
            <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all duration-500"
                style={{ width: `${data.confirmationRate}%` }}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <PiggyBank className="h-4 w-4 text-green-600" />
              RTO Savings Estimator
            </CardTitle>
            <CardDescription>
              Estimated savings from reduced Return-to-Origin orders
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Orders Confirmed</span>
                <span className="font-medium">{data.confirmed}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  Estimated RTO Reduced
                </span>
                <span className="font-medium text-green-600">
                  {data.rtoReduced}
                </span>
              </div>
              <div className="border-t pt-2 flex justify-between">
                <span className="font-medium">Estimated Savings</span>
                <span className="text-xl font-bold text-green-600">
                  ₹{data.estimatedSavings.toLocaleString("en-IN")}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
