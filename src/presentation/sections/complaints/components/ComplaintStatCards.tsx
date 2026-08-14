// ==============================
// Complaints — ComplaintStatCards Component
// بطاقات إحصائيات الشكاوى (5 بطاقات KPI تفاعلية) مع دعم لودينغ المسح (Skeleton Pulse)
// ==============================

import React from 'react';
import { MessageSquareWarning, CheckCircle2, Clock, AlertTriangle, Activity } from 'lucide-react';
import { ComplaintStats } from '../../../../domain/entities/Complaint';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  colorStyle: string;
  isActive?: boolean;
  onClick?: () => void;
  subtitle?: string;
}

const StatCard = ({ title, value, icon: Icon, colorStyle, isActive, onClick, subtitle }: StatCardProps) => (
  <div
    onClick={onClick}
    className={`bg-card border rounded-[1.5rem] p-5 shadow-sm hover:shadow-md transition-all cursor-pointer group relative overflow-hidden font-['Cairo'] ${
      isActive ? 'border-primary ring-2 ring-primary/20 bg-primary/5' : 'border-border hover:border-primary/40'
    }`}
  >
    <div className="flex items-start justify-between mb-3">
      <div className={`p-3 rounded-xl border ${colorStyle} transition-transform group-hover:scale-105`}>
        <Icon className="w-6 h-6" />
      </div>
      {isActive && (
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary text-primary-foreground">
          نشط
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

// Skeleton Scan Loading Card Component
const SkeletonStatCard = () => (
  <div className="bg-card border border-border rounded-[1.5rem] p-5 shadow-sm overflow-hidden font-['Cairo']">
    <div className="flex items-start justify-between mb-4">
      <div className="h-12 w-12 rounded-xl bg-muted animate-pulse" />
    </div>
    <div className="space-y-2.5">
      <div className="h-8 w-16 rounded-lg bg-muted animate-pulse" />
      <div className="h-4 w-28 rounded-lg bg-muted animate-pulse opacity-70" />
      <div className="h-3 w-20 rounded-lg bg-muted animate-pulse opacity-40" />
    </div>
  </div>
);

interface ComplaintStatCardsProps {
  stats: ComplaintStats;
  loadingStats: boolean;
  statusFilter: string;
  priorityFilter: string;
  onResetFilters: () => void;
  onSetStatusFilter: (v: string) => void;
  onSetPriorityFilter: (v: string) => void;
}

export function ComplaintStatCards({
  stats,
  loadingStats,
  statusFilter,
  priorityFilter,
  onResetFilters,
  onSetStatusFilter,
  onSetPriorityFilter,
}: ComplaintStatCardsProps) {

  // Render Skeleton Scan Loading State when fetching stats
  if (loadingStats) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        {Array.from({ length: 5 }).map((_, i) => (
          <SkeletonStatCard key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 font-['Cairo']">
      <StatCard
        title="إجمالي الشكاوى"
        value={stats.total_complaints ?? 0}
        icon={MessageSquareWarning}
        colorStyle="bg-primary/10 text-primary border-primary/20"
        isActive={statusFilter === 'all' && priorityFilter === 'all'}
        onClick={onResetFilters}
        subtitle="عرض كافة الشكاوى"
      />
      <StatCard
        title="شكاوى مفتوحة"
        value={stats.open_complaints ?? 0}
        icon={AlertTriangle}
        colorStyle="bg-amber-500/10 text-amber-500 border-amber-500/20"
        isActive={statusFilter === 'pending'}
        onClick={() => onSetStatusFilter(statusFilter === 'pending' ? 'all' : 'pending')}
        subtitle="اضغط للتصفية"
      />
      <StatCard
        title="شكاوى عاجلة"
        value={stats.urgent_complaints ?? 0}
        icon={Activity}
        colorStyle="bg-red-500/10 text-red-500 border-red-500/20"
        isActive={priorityFilter === 'high'}
        onClick={() => onSetPriorityFilter(priorityFilter === 'high' ? 'all' : 'high')}
        subtitle="أولوية عالية جداً"
      />
      <StatCard
        title="تم الحل (الشهر)"
        value={stats.resolved_this_month ?? 0}
        icon={CheckCircle2}
        colorStyle="bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
        isActive={statusFilter === 'resolved'}
        onClick={() => onSetStatusFilter(statusFilter === 'resolved' ? 'all' : 'resolved')}
        subtitle="مكفولة ومعالجة"
      />
      <StatCard
        title="متوسط الاستجابة"
        value={`${stats.avg_response_hours ?? 0} ساعات`}
        icon={Clock}
        colorStyle="bg-blue-500/10 text-blue-500 border-blue-500/20"
        subtitle="زمن المعالجة"
      />
    </div>
  );
}
