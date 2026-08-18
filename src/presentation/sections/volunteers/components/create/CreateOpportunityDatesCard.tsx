'use client';

import React from 'react';
import { Calendar, Clock } from 'lucide-react';

interface CreateOpportunityDatesCardProps {
  form: {
    start_date: string;
    end_date: string;
  };
  onChange: (field: string, value: any) => void;
}

export function CreateOpportunityDatesCard({
  form,
  onChange,
}: CreateOpportunityDatesCardProps) {
  return (
    <div className="bg-card border border-border/80 rounded-3xl p-6 sm:p-7 shadow-sm space-y-6">
      <div className="flex items-center gap-3 border-b border-border/60 pb-4">
        <div className="p-2.5 rounded-2xl bg-teal-500/10 text-teal-600 dark:text-teal-400">
          <Calendar className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-base font-bold text-foreground">الإطار الزمني للفرصة</h2>
          <p className="text-xs text-muted-foreground">حدد موعد بدء وانتهاء الفرصة واستقبال المتطوعين</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {/* Start Date */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-primary" />
            <span>تاريخ بداية الفرصة</span>
            <span className="text-rose-500">*</span>
          </label>
          <input
            type="date"
            required
            value={form.start_date}
            onChange={(e) => onChange('start_date', e.target.value)}
            className="w-full px-3.5 py-2.5 bg-muted/20 border border-input rounded-xl text-xs font-bold text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none font-mono"
          />
        </div>

        {/* End Date */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-primary" />
            <span>تاريخ نهاية الفرصة (اختياري)</span>
          </label>
          <input
            type="date"
            value={form.end_date}
            onChange={(e) => onChange('end_date', e.target.value)}
            className="w-full px-3.5 py-2.5 bg-muted/20 border border-input rounded-xl text-xs font-bold text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none font-mono"
          />
        </div>
      </div>
    </div>
  );
}
