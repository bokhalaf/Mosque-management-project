'use client';

import React from 'react';
import { BookOpen, Mic, GraduationCap, Trophy, CheckCircle2 } from 'lucide-react';
import { DawahProgramStats } from '../../../../domain/entities/DawahProgram';

interface DawahStatsBannerProps {
  stats: DawahProgramStats;
}

export function DawahStatsBanner({ stats }: DawahStatsBannerProps) {
  const cards = [
    {
      label: 'إجمالي البرامج والأنشطة',
      value: stats.total_programs,
      icon: BookOpen,
      color: 'from-emerald-500/20 to-teal-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400',
      iconBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    },
    {
      label: 'البرامج النشطة حالياً',
      value: stats.active_programs,
      icon: CheckCircle2,
      color: 'from-blue-500/20 to-indigo-500/10 border-blue-500/30 text-blue-600 dark:text-blue-400',
      iconBg: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
    },
    {
      label: 'المحاضرات والدروس',
      value: stats.total_lectures,
      icon: Mic,
      color: 'from-amber-500/20 to-orange-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400',
      iconBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
    },
    {
      label: 'الدورات العلمية',
      value: stats.total_courses,
      icon: GraduationCap,
      color: 'from-purple-500/20 to-pink-500/10 border-purple-500/30 text-purple-600 dark:text-purple-400',
      iconBg: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
    },
    {
      label: 'المسابقات والفعاليات',
      value: stats.total_competitions,
      icon: Trophy,
      color: 'from-rose-500/20 to-red-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400',
      iconBg: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5 mb-6">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <div
            key={index}
            className={`p-4 rounded-2xl bg-gradient-to-br bg-card border shadow-sm transition-all hover:shadow-md ${card.color}`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className={`p-2 rounded-xl ${card.iconBg}`}>
                <Icon className="w-4 h-4" />
              </div>
              <span className="text-2xl font-black font-['Cairo'] tracking-tight">
                {card.value}
              </span>
            </div>
            <p className="text-xs font-semibold text-muted-foreground line-clamp-1">
              {card.label}
            </p>
          </div>
        );
      })}
    </div>
  );
}
