'use client';

// ==============================
// Presentation Component — TaskDaySelector
// ==============================

import React from 'react';
import { Calendar, Star, Sparkles, Wrench, Users, BookOpen } from 'lucide-react';
import { MosqueTaskCategory } from '../../../../domain/entities/MosqueTask';

export const CATEGORY_CONFIG: Record<MosqueTaskCategory, { label: string; icon: React.ElementType; bg: string; text: string; border: string }> = {
  prayer_worship: { label: 'صلاة وعبادة', icon: Star,     bg: 'bg-emerald-500/10', text: 'text-emerald-600 dark:text-emerald-400', border: 'border-emerald-500/20' },
  cleaning:       { label: 'نظافة',       icon: Sparkles, bg: 'bg-blue-500/10',    text: 'text-blue-600 dark:text-blue-400',       border: 'border-blue-500/20'    },
  maintenance:    { label: 'صيانة',       icon: Wrench,   bg: 'bg-amber-500/10',  text: 'text-amber-600 dark:text-amber-400',   border: 'border-amber-500/20'   },
  activity:       { label: 'فعالية',      icon: Users,    bg: 'bg-violet-500/10', text: 'text-violet-600 dark:text-violet-400', border: 'border-violet-500/20'  },
  administrative: { label: 'إداري',       icon: BookOpen, bg: 'bg-slate-500/10',  text: 'text-slate-600 dark:text-slate-400',   border: 'border-slate-500/20'   },
  prayer:         { label: 'صلاة وعبادة', icon: Star,     bg: 'bg-emerald-500/10', text: 'text-emerald-600 dark:text-emerald-400', border: 'border-emerald-500/20' },
  event:          { label: 'فعالية',      icon: Users,    bg: 'bg-violet-500/10', text: 'text-violet-600 dark:text-violet-400', border: 'border-violet-500/20'  },
  admin:          { label: 'إداري',       icon: BookOpen, bg: 'bg-slate-500/10',  text: 'text-slate-600 dark:text-slate-400',   border: 'border-slate-500/20'   },
};

const DAYS_LABELS = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
const MONTHS_LABELS = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'];

interface TaskDaySelectorProps {
  activeDayOffset: number;
  onSelectDay: (offset: number) => void;
  getTaskCountForDay: (offset: number) => number;
}

export function TaskDaySelector({
  activeDayOffset,
  onSelectDay,
  getTaskCountForDay,
}: TaskDaySelectorProps) {
  return (
    <div className="bg-card border border-border rounded-3xl p-5 shadow-sm space-y-4 font-['Cairo']">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-black text-foreground flex items-center gap-2">
          <Calendar className="w-5 h-5 text-primary" />
          <span>اختر اليوم لمتابعة المهام التشغيلية</span>
        </h3>
      </div>

      {/* Prominent Clear Day Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        {[0, 1, 2, 3, 4, 5, 6].map((offset) => {
          const isSelected = activeDayOffset === offset;
          const count = getTaskCountForDay(offset);

          const now = new Date();
          now.setDate(now.getDate() + offset);
          const dayName = offset === 0 ? 'اليوم' : offset === 1 ? 'غداً' : DAYS_LABELS[now.getDay()];
          const dateStr = `${now.getDate()} ${MONTHS_LABELS[now.getMonth()]}`;

          return (
            <button
              key={offset}
              onClick={() => onSelectDay(offset)}
              className={`flex flex-col items-center justify-between p-3.5 rounded-2xl border transition-all text-center relative overflow-hidden group ${
                isSelected
                  ? 'bg-primary text-primary-foreground border-primary shadow-md ring-2 ring-primary/20 scale-[1.03]'
                  : 'bg-card border-border hover:border-primary/50 hover:bg-muted/50 text-foreground'
              }`}
            >
              <span className={`text-xs font-black mb-0.5 ${isSelected ? 'text-primary-foreground' : 'text-foreground'}`}>
                {dayName}
              </span>
              <span className={`text-[11px] font-medium ${isSelected ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                {dateStr}
              </span>

              <span
                className={`mt-2.5 text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                  isSelected
                    ? 'bg-primary-foreground/20 text-primary-foreground border-primary-foreground/30'
                    : count > 0
                    ? 'bg-primary/10 text-primary border-primary/20'
                    : 'bg-muted text-muted-foreground border-border'
                }`}
              >
                {count > 0 ? `${count} مهام` : 'لا مهام'}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
