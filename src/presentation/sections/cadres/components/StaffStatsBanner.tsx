'use client';

// ==============================
// Presentation Component — StaffStatsBanner
// بطاقات إحصائيات الكوادر والحلقات التطوعية (مطابقة لتصميم صفحة الفرص)
// ==============================

import React from 'react';
import { Users, GraduationCap, HeartHandshake, Clock } from 'lucide-react';
import { QuranPeopleStats } from '../../../../domain/entities/QuranPeople';

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

interface StaffStatsBannerProps {
  stats: QuranPeopleStats;
  loading?: boolean;
}

export function StaffStatsBanner({
  stats,
  loading = false,
}: StaffStatsBannerProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6 font-['Cairo']">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6 font-['Cairo']">
      {/* 1. إجمالي طلاب الحلقات */}
      <StatCard
        title="إجمالي طلاب الحلقات"
        value={stats.total_students ?? 0}
        icon={Users}
        colorStyle="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
        subtitle="الطلاب المسجلون بالحلقات"
      />

      {/* 2. المعلمون والمقرئون */}
      <StatCard
        title="المعلمون والمقرئون"
        value={stats.total_teachers ?? 0}
        icon={GraduationCap}
        colorStyle="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
        subtitle="معلمو ومحفظو القرآن"
      />

      {/* 3. متطوعين (تبديل من مدير حلقات إلى متطوعين) */}
      <StatCard
        title="متطوعين"
        value={stats.total_volunteers ?? stats.total_supervisors ?? 0}
        icon={HeartHandshake}
        colorStyle="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
        subtitle="المتطوعون المسجلون بالمسجد"
      />

      {/* 4. دعوات التسجيل المعلقة */}
      <StatCard
        title="دعوات التسجيل المعلقة"
        value={stats.pending_invitations ?? 0}
        icon={Clock}
        colorStyle="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
        subtitle="في انتظار تفعيل الحسابات"
      />
    </div>
  );
}
