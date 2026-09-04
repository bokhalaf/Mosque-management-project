'use client';

// ==============================
// Presentation Component — StaffStatsBanner
// بطاقات إحصائيات الكوادر والحلقات التطوعية (مطابقة لتصميم صفحة الفرص)
// ==============================

import React, { useMemo } from 'react';
import { Users, GraduationCap, HeartHandshake, Clock, Building2, BookOpen } from 'lucide-react';
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
  const isRegionManager = useMemo(() => {
    if (stats.role === 'region_manager') return true;
    if (stats.role === 'mosque_manager') return false;
    if (typeof window !== 'undefined') {
      try {
        const rawUser = JSON.parse(localStorage.getItem('auth_user') || '{}');
        const role = String(rawUser.role || rawUser.user_type || '').toLowerCase();
        return role === 'region_manager' || role === 'super_admin' || role === 'admin';
      } catch {}
    }
    return Boolean(stats.total_managers !== undefined && stats.total_managers > 0);
  }, [stats.role, stats.total_managers]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6 font-['Cairo']">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  if (isRegionManager) {
    // ── كروت مدير المنطقة (Region Manager) ──
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6 font-['Cairo']">
        {/* 1. مديرو المساجد */}
        <StatCard
          title="مديرو المساجد"
          value={stats.total_managers ?? 0}
          icon={Building2}
          colorStyle="bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20"
          subtitle="مديرو مساجد المنطقة"
        />

        {/* 2. المعلمون والمقرئون */}
        <StatCard
          title="المعلمون والمقرئون"
          value={stats.total_teachers ?? 0}
          icon={GraduationCap}
          colorStyle="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
          subtitle="معلمو ومحفظو القرآن"
        />

        {/* 3. مديرو الحلقات */}
        <StatCard
          title="مديرو الحلقات"
          value={stats.total_supervisors ?? 0}
          icon={BookOpen}
          colorStyle="bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20"
          subtitle="المشرفون على الحلقات القرآنية"
        />

        {/* 4. الطلبات المنتظرة */}
        <StatCard
          title="الطلبات المنتظرة"
          value={stats.pending_invitations ?? 0}
          icon={Clock}
          colorStyle="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
          subtitle="دعوات وطلبات الانضمام المعلقة"
        />
      </div>
    );
  }

  // ── كروت مدير المسجد (Mosque Manager) ──
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

      {/* 3. المتطوعون */}
      <StatCard
        title="المتطوعون"
        value={stats.total_volunteers ?? 0}
        icon={HeartHandshake}
        colorStyle="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
        subtitle="المتطوعون المسجلون بالمسجد"
      />

      {/* 4. الطلبات المنتظرة */}
      <StatCard
        title="الطلبات المنتظرة"
        value={stats.pending_invitations ?? 0}
        icon={Clock}
        colorStyle="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
        subtitle="دعوات وطلبات الانضمام المعلقة"
      />
    </div>
  );
}
