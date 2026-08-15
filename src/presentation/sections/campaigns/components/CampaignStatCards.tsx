// ==============================
// Campaigns — CampaignStatCards Component
// بطاقات إحصائيات الحملات (4 بطاقات KPI للعرض الإحصائي بدون فلترة عند النقر)
// ==============================

import React from 'react';
import { Wallet, Calendar, Target, Users, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  colorStyle: string;
  trend?: string;
  isPositive?: boolean;
  subtitle?: string;
}

const StatCard = ({ title, value, icon: Icon, colorStyle, trend, isPositive, subtitle }: StatCardProps) => (
  <div className="bg-card border border-border rounded-[1.5rem] p-5 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
    <div className="flex items-start justify-between mb-3">
      <div className={`p-3 rounded-xl border ${colorStyle} transition-transform group-hover:scale-105`}>
        <Icon className="w-6 h-6" />
      </div>
      {trend && (
        <span
          className={`flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full border ${
            isPositive
              ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
              : 'bg-red-500/10 text-red-600 border-red-500/20'
          }`}
        >
          {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
          {trend}
        </span>
      )}
    </div>
    <div>
      <h3 className="text-2xl font-black text-foreground mb-1">{value}</h3>
      <p className="text-sm font-bold text-muted-foreground">{title}</p>
      {subtitle && <p className="text-[10px] text-muted-foreground/80 mt-1">{subtitle}</p>}
    </div>
  </div>
);

const SkeletonCard = () => (
  <div className="bg-card border border-border rounded-[1.5rem] p-5 shadow-sm overflow-hidden">
    <div className="flex items-start justify-between mb-4">
      <div className="h-12 w-12 rounded-xl bg-muted animate-pulse" />
    </div>
    <div className="space-y-2.5">
      <div className="h-8 w-24 rounded-lg bg-muted animate-pulse" />
      <div className="h-4 w-28 rounded-lg bg-muted animate-pulse opacity-70" />
    </div>
  </div>
);

interface CampaignStatCardsProps {
  stats: any;
  loading: boolean;
  statusFilter?: string;
  onSetStatusFilter?: (status: string) => void;
}

export function CampaignStatCards({
  stats,
  loading,
}: CampaignStatCardsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  const totalCollected = stats?.totalRaised || stats?.total_collected || 0;
  const activeCount = stats?.activeCampaigns || stats?.active_count || 0;
  const completedCount = stats?.completedCampaigns || stats?.completed_count || 0;
  const growthRate = stats?.successRate ?? stats?.growth_rate_percent ?? 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard
        title="إجمالي تبرعات الحملات"
        value={`${Number(totalCollected).toLocaleString('ar-EG')} ل.س`}
        trend={growthRate ? `${Number(growthRate) > 0 ? '+' : ''}${growthRate}%` : undefined}
        isPositive={Number(growthRate) >= 0}
        icon={Wallet}
        colorStyle="bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
        subtitle="كافة التبرعات المحصلة"
      />
      <StatCard
        title="الحملات النشطة"
        value={activeCount}
        icon={Calendar}
        colorStyle="bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
        subtitle="حملات تستقبل الدعم حالياً"
      />
      <StatCard
        title="الحملات المكتملة"
        value={completedCount}
        icon={Target}
        colorStyle="bg-emerald-600 text-white border-emerald-700"
        subtitle="حققت كامل المبلغ المطلوب"
      />
      <StatCard
        title="نسبة الإنجاز والنمو"
        value={`${Number(growthRate) >= 0 ? '+' : ''}${growthRate}%`}
        trend={growthRate ? `${Number(growthRate) > 0 ? '+' : ''}${growthRate}%` : undefined}
        isPositive={Number(growthRate) >= 0}
        icon={Users}
        colorStyle="bg-emerald-500/15 text-emerald-700 border-emerald-500/30"
        subtitle="معدل التفاعل التكافلي"
      />
    </div>
  );
}
