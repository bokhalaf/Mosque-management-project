// ==============================
// Donations — DonationStatCards Component
// بطاقات إحصائيات التبرعات (4 بطاقات KPI للعرض الإحصائي)
// ==============================

import React from 'react';
import { Wallet, Calendar, Target, Users, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { FinancialStats } from '../../../../domain/entities/Donation';

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
        <span className={`flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full border ${
          isPositive ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' : 'bg-red-500/10 text-red-600 border-red-500/20'
        }`}>
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

interface DonationStatCardsProps {
  stats: FinancialStats | null;
  loading: boolean;
  statusFilter?: string;
  onSetStatusFilter?: (v: string) => void;
}

export function DonationStatCards({
  stats,
  loading,
}: DonationStatCardsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard
        title="إجمالي التبرعات"
        value={`${Number(stats?.totalDonations || 0).toLocaleString('ar-EG')} ل.س`}
        trend={stats?.totalDonationsTrend ? `${stats.totalDonationsTrend > 0 ? '+' : ''}${stats.totalDonationsTrend}%` : undefined}
        isPositive={(stats?.totalDonationsTrend || 0) >= 0}
        icon={Wallet}
        colorStyle="bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
        subtitle="جميع عمليات التكافل"
      />
      <StatCard
        title="تبرعات هذا الشهر"
        value={`${Number(stats?.monthlyDonations || 0).toLocaleString('ar-EG')} ل.س`}
        trend={stats?.monthlyDonationsTrend ? `${stats.monthlyDonationsTrend > 0 ? '+' : ''}${stats.monthlyDonationsTrend}%` : undefined}
        isPositive={(stats?.monthlyDonationsTrend || 0) >= 0}
        icon={Calendar}
        colorStyle="bg-blue-500/10 text-blue-600 border-blue-500/20"
        subtitle="عمليات هذا الشهر"
      />
      <StatCard
        title="الحملات النشطة"
        value={stats?.activeCampaigns ?? 0}
        trend={stats?.activeCampaignsTrend ? `${stats.activeCampaignsTrend > 0 ? '+' : ''}${stats.activeCampaignsTrend}` : undefined}
        isPositive={(stats?.activeCampaignsTrend || 0) >= 0}
        icon={Target}
        colorStyle="bg-amber-500/10 text-amber-600 border-amber-500/20"
        subtitle="حملات تبرع مفتوحة"
      />
      <StatCard
        title="متبرعون جدد (الشهر)"
        value={stats?.newDonors ?? 0}
        trend={stats?.newDonorsTrend ? `${stats.newDonorsTrend > 0 ? '+' : ''}${stats.newDonorsTrend}%` : undefined}
        isPositive={(stats?.newDonorsTrend || 0) >= 0}
        icon={Users}
        colorStyle="bg-indigo-500/10 text-indigo-600 border-indigo-500/20"
        subtitle="داعمين جدد للمسجد"
      />
    </div>
  );
}
