'use client';

import React from 'react';
import {
  Calendar, Users, Clock, HeartHandshake, CheckCircle2,
  XCircle, ListTodo, Award, AlertCircle, Edit
} from 'lucide-react';
import { VolunteerOpportunity } from '../../../../../domain/entities/Volunteer';

interface OpportunityHeaderProps {
  opportunity: VolunteerOpportunity;
  stats: {
    approvedVolunteers: number;
    pendingApplications: number;
    totalTasks: number;
    completedTasks: number;
    progressPercent: number;
  };
  onCloseOpportunity: () => void;
  onOpenEdit?: () => void;
}

export function OpportunityHeader({
  opportunity,
  stats,
  onCloseOpportunity,
  onOpenEdit,
}: OpportunityHeaderProps) {
  const isOpen = opportunity.status === 'open';

  return (
    <div className="bg-card border border-border/80 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
      {/* Title & Badges */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span
              className={`inline-flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-bold border ${
                isOpen
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                  : 'bg-muted text-muted-foreground border-border'
              }`}
            >
              {isOpen ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
              <span>{isOpen ? 'فرصة نشطة ومتاحة' : 'فرصة مغلقة'}</span>
            </span>

            <span className="text-xs text-muted-foreground font-mono bg-muted/40 px-3 py-1 rounded-xl border border-border/60">
              معرف الفرصة: #{opportunity.id}
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl font-bold text-foreground">
            {opportunity.title}
          </h1>

          {opportunity.description && (
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-3xl">
              {opportunity.description}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {onOpenEdit && (
            <button
              onClick={onOpenEdit}
              className="p-2.5 bg-muted/80 hover:bg-muted text-muted-foreground hover:text-foreground rounded-xl transition-all border border-border flex items-center justify-center shadow-sm"
              title="تعديل الفرصة والمهام"
            >
              <Edit className="w-4 h-4" />
            </button>
          )}

          {isOpen && (
            <button
              onClick={onCloseOpportunity}
              className="p-2.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/20 rounded-xl transition-all flex items-center justify-center shadow-sm"
              title="إغلاق استقبال الطلبات"
            >
              <XCircle className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-border/60">
        {/* Volunteers Progress */}
        <div className="p-4 bg-muted/30 border border-border/60 rounded-2xl space-y-1">
          <div className="flex items-center justify-between text-muted-foreground text-xs">
            <span className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-primary" />
              <span>المتطوعون المعتمدون</span>
            </span>
            <span className="font-bold text-foreground font-mono">{stats.progressPercent}%</span>
          </div>
          <div className="text-lg font-bold text-foreground font-mono">
            {stats.approvedVolunteers} <span className="text-xs text-muted-foreground font-normal">/ {opportunity.required_volunteers} مطلوب</span>
          </div>
          <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden mt-1">
            <div
              className="h-full bg-primary rounded-full transition-all duration-500"
              style={{ width: `${stats.progressPercent}%` }}
            />
          </div>
        </div>

        {/* Pending Applications */}
        <div className="p-4 bg-muted/30 border border-border/60 rounded-2xl space-y-1">
          <div className="flex items-center gap-1.5 text-muted-foreground text-xs">
            <HeartHandshake className="w-3.5 h-3.5 text-amber-500" />
            <span>طلبات قيد المراجعة</span>
          </div>
          <div className="text-lg font-bold text-amber-600 font-mono">
            {stats.pendingApplications} <span className="text-xs text-muted-foreground font-normal">طلب</span>
          </div>
        </div>

        {/* Tasks Count */}
        <div className="p-4 bg-muted/30 border border-border/60 rounded-2xl space-y-1">
          <div className="flex items-center gap-1.5 text-muted-foreground text-xs">
            <ListTodo className="w-3.5 h-3.5 text-primary" />
            <span>مهام الفرصة</span>
          </div>
          <div className="text-lg font-bold text-foreground font-mono">
            {stats.totalTasks} <span className="text-xs text-muted-foreground font-normal">مهام مخصصة</span>
          </div>
        </div>

        {/* Timeline */}
        <div className="p-4 bg-muted/30 border border-border/60 rounded-2xl space-y-1">
          <div className="flex items-center gap-1.5 text-muted-foreground text-xs">
            <Calendar className="w-3.5 h-3.5 text-primary" />
            <span>الفترة الزمنية</span>
          </div>
          <div className="text-xs font-bold text-foreground font-mono truncate">
            {opportunity.start_date} إلى {opportunity.end_date || 'مفتوح'}
          </div>
        </div>
      </div>
    </div>
  );
}
