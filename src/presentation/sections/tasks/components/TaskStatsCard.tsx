'use client';

// ==============================
// Presentation Component — TaskStatsCard
// ==============================

import React from 'react';
import { CheckCircle2, Sparkles } from 'lucide-react';
import { MosqueTaskStats } from '../../../../domain/entities/MosqueTask';

interface TaskStatsCardProps {
  stats: MosqueTaskStats;
}

export function TaskStatsCard({ stats }: TaskStatsCardProps) {
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (stats.progress_percent / 100) * circumference;

  return (
    <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-4 flex flex-col justify-between font-['Cairo'] relative overflow-hidden">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-black text-foreground flex items-center gap-2">
          <CheckCircle2 className="w-4.5 h-4.5 text-emerald-500" />
          <span>إنجاز اليوم</span>
        </h3>
        <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
          <Sparkles className="w-3 h-3" />
          <span>جاهزية تشغيلية</span>
        </span>
      </div>

      <div className="flex items-center justify-between gap-4 my-1">
        <div className="space-y-1">
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-black text-foreground">{stats.completed}</span>
            <span className="text-sm font-bold text-muted-foreground">من {stats.total} مهام</span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {stats.completed === stats.total && stats.total > 0
              ? 'تم إنجاز كافة مهام اليوم بحمد الله!'
              : 'جازاك الله خيراً على متابعة وتسهيل خدمة بيوت الله.'}
          </p>
        </div>

        {/* Circular Progress Ring */}
        <div className="relative w-24 h-24 shrink-0 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r={radius}
              className="text-muted/40"
              strokeWidth="8"
              stroke="currentColor"
              fill="transparent"
            />
            <circle
              cx="50"
              cy="50"
              r={radius}
              className="text-primary transition-all duration-700 ease-out"
              strokeWidth="8"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              stroke="currentColor"
              fill="transparent"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-base font-black text-foreground">{stats.progress_percent}%</span>
            <span className="text-[9px] font-bold text-muted-foreground">مكتمل</span>
          </div>
        </div>
      </div>

      <div className="bg-muted/40 rounded-xl p-2.5 text-center text-xs text-muted-foreground border border-border/50">
        المتبقي لليوم: <span className="font-bold text-foreground">{stats.pending} مهمة</span>
      </div>
    </div>
  );
}
