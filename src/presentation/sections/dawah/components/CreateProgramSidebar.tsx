'use client';

import React from 'react';
import { Sparkles, Info } from 'lucide-react';
import { CreateDawahProgramFormData } from '../../../hooks/useCreateDawahProgram';

interface CreateProgramSidebarProps {
  formData: CreateDawahProgramFormData;
  setFormData: React.Dispatch<React.SetStateAction<CreateDawahProgramFormData>>;
}

export function CreateProgramSidebar({
  formData,
  setFormData,
}: CreateProgramSidebarProps) {
  return (
    <div className="space-y-6 font-['Cairo']">
      {/* 1. Featured Program Toggle Card */}
      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2 border-b border-border pb-3">
          <Sparkles className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          <h3 className="text-sm font-bold text-foreground">تمييز البرنامج الدعوي</h3>
        </div>

        <div>
          <label className="flex items-start gap-3 cursor-pointer select-none p-3.5 bg-emerald-500/5 hover:bg-emerald-500/10 border border-emerald-500/20 rounded-xl transition-colors">
            <input
              type="checkbox"
              checked={formData.is_featured}
              onChange={(e) => setFormData((prev) => ({ ...prev, is_featured: e.target.checked }))}
              className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-border bg-background mt-0.5"
            />
            <div>
              <span className="font-bold text-xs text-emerald-700 dark:text-emerald-400 block">تعيين كبرنامج مميز (Featured ⭐)</span>
              <span className="text-[11px] text-muted-foreground mt-0.5 block leading-relaxed">
                إبراز البرنامج بشارة خضراء مميزة في واجهة لوحة الإعلانات بالمسجد وفي صدارة الأنشطة للمصلين.
              </span>
            </div>
          </label>
        </div>
      </div>

      {/* 2. Guidelines & Instructions Card */}
      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-primary font-bold text-sm border-b border-border pb-3">
          <Info className="w-5 h-5 shrink-0" />
          <h4>إرشادات إطلاق البرامج الدعوية</h4>
        </div>
        <ul className="text-xs text-muted-foreground space-y-3 list-disc list-inside leading-relaxed">
          <li>يرجى التأكد من عدم تعارض مواعيد الجلسات مع الصلوات المفروضة وأوقات الأذان.</li>
          <li>تحديد مكان الانعقاد (المصلى/القاعة) يضمن حجز القاعة وتجنب ازدواجية الأنشطة.</li>
          <li>يتم نشر البرنامج بحالة نشطة تلقائياً للمصلين فور الحفظ.</li>
        </ul>
      </div>
    </div>
  );
}
