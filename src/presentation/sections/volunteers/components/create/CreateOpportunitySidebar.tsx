'use client';

import React from 'react';
import {
  Sparkles, ShieldCheck, HeartHandshake,
  CheckCircle2, Users, Calendar, ListTodo
} from 'lucide-react';

interface CreateOpportunitySidebarProps {
  form: {
    title: string;
    description: string;
    required_volunteers: number;
    start_date: string;
    end_date: string;
  };
  tasksCount: number;
}

export function CreateOpportunitySidebar({
  form,
  tasksCount,
}: CreateOpportunitySidebarProps) {
  return (
    <div className="space-y-6">
      {/* Live Preview Summary Card */}
      <div className="bg-card border border-border/80 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2 border-b border-border/60 pb-3">
          <Sparkles className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-bold text-foreground">معاينة بطاقة الفرصة</h3>
        </div>

        <div className="space-y-3 text-xs">
          <div>
            <span className="text-muted-foreground text-[11px]">العنوان:</span>
            <div className="font-bold text-foreground text-sm line-clamp-2 mt-0.5">
              {form.title.trim() || 'عنوان الفرصة التطوعية'}
            </div>
          </div>

          <div className="p-3 bg-muted/40 rounded-2xl space-y-2 font-medium">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-primary" />
                <span>العدد المستهدف:</span>
              </span>
              <span className="font-bold text-foreground font-mono">
                {form.required_volunteers || 0} متطوع
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-muted-foreground flex items-center gap-1.5">
                <ListTodo className="w-3.5 h-3.5 text-primary" />
                <span>المهام المحددة:</span>
              </span>
              <span className="font-bold text-foreground font-mono">
                {tasksCount} مهام
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-muted-foreground flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-primary" />
                <span>تاريخ البداية:</span>
              </span>
              <span className="font-mono text-foreground text-[11px]">
                {form.start_date || '—'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Guidelines Card */}
      <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-3xl p-6 space-y-3">
        <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-xs">
          <ShieldCheck className="w-4 h-4" />
          <span>ضوابط وإرشادات التطوع بالمسجد</span>
        </div>
        <ul className="text-[11px] text-muted-foreground space-y-2 leading-relaxed">
          <li className="flex items-start gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
            <span>يتم نشر الفرصة في بوابة المتطوعين لاستقبال طلبات الانضمام فور الحفظ.</span>
          </li>
          <li className="flex items-start gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
            <span>يمكنك مراجعة وقبول المتقدمين وإسناد المهام لهم من صفحة تفاصيل الفرصة.</span>
          </li>
          <li className="flex items-start gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
            <span>يتم احتساب الساعات المعتمدة تلقائياً لكل متطوع لإصدار شهادة العمل التطوعي.</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
