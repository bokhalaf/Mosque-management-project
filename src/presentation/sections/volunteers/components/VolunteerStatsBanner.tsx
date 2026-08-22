'use client';

// ==============================
// Presentation Component — VolunteerStatsBanner
// بطاقات إحصائيات التطوع الثلاثية (مطابقة لتصميم الصيانة ومباشرة من السيرفر)
// ==============================

import React from 'react';
import { HeartHandshake, CheckCircle2, Clock } from 'lucide-react';
import { VolunteerStats } from '../../../../domain/entities/Volunteer';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  colorStyle: string;
  subtitle?: string;
}

const StatCard = ({ title, value, icon: Icon, colorStyle, subtitle }: StatCardProps) => (
  <div className="bg-card border border-border rounded-[1.5rem] p-5 shadow-sm hover:shadow-md transition-all group relative overflow-hidden font-['Cairo']">
    <div className="flex items-start justify-between mb-3">
      <div className={`p-3 rounded-xl border ${colorStyle} transition-transform group-hover:scale-105`}>
        <Icon className="w-6 h-6" />
      </div>
    </div>
    <div>
      <h3 className="text-2xl font-black text-foreground mb-1">{value}</h3>
      <p className="text-sm font-bold text-muted-foreground">{title}</p>
      {subtitle && <p className="text-[10px] text-muted-foreground/80 mt-1">{subtitle}</p>}
    </div>
  </div>
);

const SkeletonCard = () => (
  <div className="bg-card border border-border rounded-[1.5rem] p-5 shadow-sm overflow-hidden font-['Cairo']">
    <div className="flex items-start justify-between mb-4">
      <div className="h-12 w-12 rounded-xl bg-muted animate-pulse" />
    </div>
    <div className="space-y-2.5">
      <div className="h-8 w-14 rounded-lg bg-muted animate-pulse" />
      <div className="h-4 w-28 rounded-lg bg-muted animate-pulse opacity-70" />
      <div className="h-3 w-20 rounded-lg bg-muted animate-pulse opacity-40" />
    </div>
  </div>
);

interface VolunteerStatsBannerProps {
  stats: VolunteerStats;
  loading?: boolean;
}

export function VolunteerStatsBanner({
  stats,
  loading = false,
}: VolunteerStatsBannerProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6 font-['Cairo']">
      {/* 1. إجمالي الفرص التطوعية */}
      <StatCard
        title="إجمالي الفرص التطوعية"
        value={stats.total_opportunities ?? 0}
        icon={HeartHandshake}
        colorStyle="bg-primary/10 text-primary border-primary/20"
        subtitle="جميع الفرص المسجلة بمسجدك"
      />

      {/* 2. المتطوعون */}
      <StatCard
        title="المتطوعون"
        value={stats.approved_volunteers ?? 0}
        icon={CheckCircle2}
        colorStyle="bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
        subtitle="إجمالي المتطوعين المسجلين بالمسجد"
      />

      {/* 3. قيد الانتظار */}
      <StatCard
        title="قيد الانتظار"
        value={stats.pending_applications ?? 0}
        icon={Clock}
        colorStyle="bg-amber-500/10 text-amber-500 border-amber-500/20"
        subtitle="طلبات انضمام معلقة تنتظر الاعتماد"
      />
    </div>
  );
}
