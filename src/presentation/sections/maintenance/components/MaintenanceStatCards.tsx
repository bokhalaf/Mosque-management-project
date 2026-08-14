// ==============================
// Maintenance — MaintenanceStatCards Component
// بطاقات إحصائيات الصيانة (4 بطاقات KPI تفاعلية)
// ==============================

import React from 'react';
import { Wrench, Activity, CheckCircle2, AlertTriangle } from 'lucide-react';
import { MaintenanceStats } from '../../../../domain/entities/Maintenance';

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
    className={`bg-card border rounded-[1.5rem] p-5 shadow-sm hover:shadow-md transition-all cursor-pointer group relative overflow-hidden ${
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

const SkeletonCard = () => (
  <div className="bg-card border border-border rounded-[1.5rem] p-5 shadow-sm overflow-hidden">
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

interface MaintenanceStatCardsProps {
  stats: MaintenanceStats;
  loadingStats: boolean;
  statusFilter: string;
  priorityFilter: string;
  onSetStatusFilter: (v: string) => void;
  onSetPriorityFilter: (v: string) => void;
}

export function MaintenanceStatCards({
  stats,
  loadingStats,
  statusFilter,
  priorityFilter,
  onSetStatusFilter,
  onSetPriorityFilter,
}: MaintenanceStatCardsProps) {
  if (loadingStats) {
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
        title="طلبات مفتوحة"
        value={stats.open_requests ?? 0}
        icon={Wrench}
        colorStyle="bg-primary/10 text-primary border-primary/20"
        isActive={statusFilter === 'pending'}
        onClick={() => onSetStatusFilter(statusFilter === 'pending' ? 'all' : 'pending')}
        subtitle="قيد الانتظار"
      />
      <StatCard
        title="جاري العمل"
        value={stats.in_progress ?? 0}
        icon={Activity}
        colorStyle="bg-amber-500/10 text-amber-500 border-amber-500/20"
        isActive={statusFilter === 'in_progress'}
        onClick={() => onSetStatusFilter(statusFilter === 'in_progress' ? 'all' : 'in_progress')}
        subtitle="قيد التنفيذ حالياً"
      />
      <StatCard
        title="تم إنجازها (الشهر)"
        value={stats.completed_this_month ?? 0}
        icon={CheckCircle2}
        colorStyle="bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
        isActive={statusFilter === 'completed'}
        onClick={() => onSetStatusFilter(statusFilter === 'completed' ? 'all' : 'completed')}
        subtitle="مكتملة ومغلقة"
      />
      <StatCard
        title="أعطال حرجة"
        value={stats.critical ?? 0}
        icon={AlertTriangle}
        colorStyle="bg-red-500/10 text-red-500 border-red-500/20"
        isActive={priorityFilter === 'urgent' || priorityFilter === 'critical'}
        onClick={() => onSetPriorityFilter(priorityFilter === 'urgent' ? 'all' : 'urgent')}
        subtitle="أولوية قصوى"
      />
    </div>
  );
}
