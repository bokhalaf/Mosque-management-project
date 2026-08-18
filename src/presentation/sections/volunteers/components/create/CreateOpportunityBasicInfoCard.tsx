'use client';

import React from 'react';
import { HeartHandshake, Users, FileText } from 'lucide-react';

interface CreateOpportunityBasicInfoCardProps {
  form: {
    title: string;
    description: string;
    required_volunteers: number;
  };
  onChange: (field: string, value: any) => void;
}

export function CreateOpportunityBasicInfoCard({
  form,
  onChange,
}: CreateOpportunityBasicInfoCardProps) {
  return (
    <div className="bg-card border border-border/80 rounded-3xl p-6 sm:p-7 shadow-sm space-y-6">
      <div className="flex items-center gap-3 border-b border-border/60 pb-4">
        <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
          <HeartHandshake className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-base font-bold text-foreground">البيانات الأساسية للفرصة</h2>
          <p className="text-xs text-muted-foreground">حدد عنوان الفرصة التطوعية والوصف والعدد المستهدف</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Title */}
        <div className="md:col-span-2 space-y-1.5">
          <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
            <span>عنوان الفرصة التطوعية</span>
            <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <input
              type="text"
              required
              value={form.title}
              onChange={(e) => onChange('title', e.target.value)}
              placeholder="مثال: تنظيم صلاة الجمعة وإرشاد المصلين"
              className="w-full px-3.5 py-2.5 bg-muted/20 border border-input rounded-xl text-xs font-medium text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
            />
          </div>
        </div>

        {/* Required Volunteers */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-primary" />
            <span>عدد المتطوعين المطلوب</span>
            <span className="text-rose-500">*</span>
          </label>
          <input
            type="number"
            min={1}
            max={500}
            required
            value={form.required_volunteers}
            onChange={(e) => onChange('required_volunteers', Number(e.target.value))}
            className="w-full px-3.5 py-2.5 bg-muted/20 border border-input rounded-xl text-xs font-bold text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none font-mono"
          />
        </div>

        {/* Description */}
        <div className="md:col-span-3 space-y-1.5">
          <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-primary" />
            <span>الوصف والمهام العامة للفرصة</span>
          </label>
          <textarea
            rows={3}
            value={form.description}
            onChange={(e) => onChange('description', e.target.value)}
            placeholder="اكتب نبذة توضيحية عن أهداف الفرصة التطوعية والمسؤوليات المتوقعة من المتطوعين..."
            className="w-full px-3.5 py-2.5 bg-muted/20 border border-input rounded-xl text-xs font-medium text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none resize-none leading-relaxed"
          />
        </div>
      </div>
    </div>
  );
}
