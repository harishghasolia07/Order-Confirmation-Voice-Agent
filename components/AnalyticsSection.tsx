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
  CalendarDays,
  Activity,
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
  todayCalls: number;
  todayConfirmationRate: number;
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
    <Card className="glass-card border-none bg-white/5 relative overflow-hidden group">
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
      <CardContent className="pt-6 relative z-10">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold tracking-wider uppercase text-muted-foreground">{title}</p>
            <p className={`mt-2 text-3xl font-bold space-grotesk ${colorClass} drop-shadow-md`}>{value}</p>
            {description && (
              <p className="mt-2 text-xs text-muted-foreground/80 font-light">{description}</p>
            )}
          </div>
          <div className={`rounded-xl p-3 ${colorClass} bg-opacity-10 border border-white/5 shadow-inner`}>
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
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
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
          description={`${data.confirmationRate}% rate`}
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
        <StatCard
          title="Calls Today"
          value={data.todayCalls}
          description="since midnight UTC"
          icon={<CalendarDays className="h-5 w-5 text-purple-600" />}
          colorClass="text-purple-600"
        />
        <StatCard
          title="Today's Rate"
          value={`${data.todayConfirmationRate}%`}
          description="today's confirmation"
          icon={<Activity className="h-5 w-5 text-indigo-600" />}
          colorClass="text-indigo-600"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 mt-6">
        <Card className="glass-card border-none bg-white/5 relative overflow-hidden group">
          <div className="absolute top-[-50px] right-[-50px] w-32 h-32 bg-primary/20 rounded-full blur-[40px] pointer-events-none"></div>
          <CardHeader className="pb-2 relative z-10">
            <CardTitle className="flex items-center gap-2 text-base font-semibold uppercase tracking-wider text-muted-foreground">
              <TrendingUp className="h-5 w-5 text-primary" />
              Confirmation Rate
            </CardTitle>
            <CardDescription className="font-light">
              Percentage of calls where customer confirmed the order
            </CardDescription>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="flex items-end gap-3 mt-2">
              <span className="text-5xl font-bold space-grotesk text-foreground drop-shadow-[0_0_15px_rgba(186,158,255,0.4)]">
                {data.confirmationRate}%
              </span>
              <span className="mb-2 text-sm text-primary font-medium tracking-widest bg-primary/10 px-2 py-0.5 rounded border border-primary/20">
                {data.confirmed} / {data.totalCalls} OUTCOMES
              </span>
            </div>
            <div className="mt-6 h-2 w-full overflow-hidden rounded-full bg-black/40 shadow-inner">
              <div
                className="h-full rounded-full bg-gradient-to-r from-primary to-secondary transition-all duration-1000 shadow-[0_0_10px_rgba(186,158,255,0.8)] relative"
                style={{ width: `${data.confirmationRate}%` }}
              >
                <div className="absolute inset-0 bg-white/30 animate-pulse"></div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-none bg-white/5 relative overflow-hidden group">
          <div className="absolute top-[-50px] right-[-50px] w-32 h-32 bg-green-500/20 rounded-full blur-[40px] pointer-events-none"></div>
          <CardHeader className="pb-2 relative z-10">
            <CardTitle className="flex items-center gap-2 text-base font-semibold uppercase tracking-wider text-muted-foreground">
              <PiggyBank className="h-5 w-5 text-green-500" />
              RTO Savings Estimator
            </CardTitle>
            <CardDescription className="font-light">
              Estimated savings from reduced Return-to-Origin orders
            </CardDescription>
          </CardHeader>
          <CardContent className="relative z-10 mt-2">
            <div className="space-y-4 text-sm font-medium">
              <div className="flex justify-between items-center p-3 rounded-lg bg-white/5 border border-white/5">
                <span className="text-muted-foreground tracking-wide">Orders Confirmed</span>
                <span className="text-lg">{data.confirmed}</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg bg-green-500/5 border border-green-500/10">
                <span className="text-green-500/80 tracking-wide">
                  Estimated RTO Reduced
                </span>
                <span className="text-lg text-green-500">
                  {data.rtoReduced}
                </span>
              </div>
              <div className="pt-4 flex justify-between items-center">
                <span className="tracking-wide text-muted-foreground uppercase text-xs">Estimated Savings</span>
                <span className="flex items-center gap-1 text-4xl space-grotesk font-bold text-transparent bg-clip-text bg-gradient-to-br from-green-400 to-green-600 drop-shadow-[0_0_10px_rgba(74,222,128,0.3)]">
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
