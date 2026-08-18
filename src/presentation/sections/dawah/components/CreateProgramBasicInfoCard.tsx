'use client';

import React from 'react';
import {
  BookOpen, User, Building2, GraduationCap, Mic, Trophy, Layers
} from 'lucide-react';
import { DawahProgramType, DawahProgramLevel, MosqueSpace } from '../../../../domain/entities/DawahProgram';
import { CreateDawahProgramFormData } from '../../../hooks/useCreateDawahProgram';

interface CreateProgramBasicInfoCardProps {
  formData: CreateDawahProgramFormData;
  setFormData: React.Dispatch<React.SetStateAction<CreateDawahProgramFormData>>;
  spaces: MosqueSpace[];
}

export function CreateProgramBasicInfoCard({
  formData,
  setFormData,
  spaces,
}: CreateProgramBasicInfoCardProps) {
  const typeOptions = [
    { key: 'course', label: 'دورة علمية', icon: GraduationCap },
    { key: 'lecture', label: 'محاضرة / درس', icon: Mic },
    { key: 'compition', label: 'مسابقة دعوية', icon: Trophy },
    { key: 'other', label: 'نشاط آخر', icon: Layers },
  ];

  return (
    <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-5">
      <div className="flex items-center gap-2 border-b border-border pb-3">
        <BookOpen className="w-5 h-5 text-primary" />
        <h3 className="text-sm font-bold text-foreground">بيانات البرنامج الأساسية</h3>
      </div>

      <div className="space-y-4">
        {/* Program Name */}
        <div>
          <label className="block text-xs font-bold text-foreground mb-1.5">
            اسم البرنامج أو الدورة <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            value={formData.program_name}
            onChange={(e) => setFormData((prev) => ({ ...prev, program_name: e.target.value }))}
            placeholder="مثال: دورة فقه المعاملات المالية المعاصرة، أو درس التفسير الأسبوعي"
            className="w-full px-4 py-2.5 bg-background border border-border focus:border-primary rounded-xl text-xs font-semibold outline-none text-foreground"
          />
        </div>

        {/* Presenter Name */}
        <div>
          <label className="block text-xs font-bold text-foreground mb-1.5">
            اسم الشيخ / المحاضر / المشرف <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <User className="w-4 h-4 text-muted-foreground absolute right-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              required
              value={formData.presenter}
              onChange={(e) => setFormData((prev) => ({ ...prev, presenter: e.target.value }))}
              placeholder="مثال: فضيلة الشيخ د. عبد الرحمن بن صالح العتيبي"
              className="w-full pr-10 pl-4 py-2.5 bg-background border border-border focus:border-primary rounded-xl text-xs font-semibold outline-none text-foreground"
            />
          </div>
        </div>

        {/* Category / Type Tabs Grid */}
        <div>
          <label className="block text-xs font-bold text-foreground mb-2">
            نوع البرنامج والنشاط الدعوي <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {typeOptions.map((type) => {
              const Icon = type.icon;
              const isSelected = formData.type === type.key;
              return (
                <button
                  key={type.key}
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, type: type.key as DawahProgramType }))}
                  className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-bold transition-all ${
                    isSelected
                      ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                      : 'bg-background hover:bg-muted text-muted-foreground border-border'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{type.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Level & Space Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-foreground mb-1.5">
              المستوى المستهدف <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.level}
              onChange={(e) => setFormData((prev) => ({ ...prev, level: e.target.value as DawahProgramLevel }))}
              className="w-full px-4 py-2.5 bg-background border border-border focus:border-primary rounded-xl text-xs font-semibold outline-none text-foreground"
            >
              <option value="beginner">مبتدئ / عام لجميع المصلين</option>
              <option value="intermediate">متوسط لطلاب العلم</option>
              <option value="advanced">متقدم ومتخصص</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-foreground mb-1.5">
              مكان الانعقاد بالمسجد <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Building2 className="w-4 h-4 text-muted-foreground absolute right-3.5 top-1/2 -translate-y-1/2" />
              <select
                value={formData.space_id}
                onChange={(e) => setFormData((prev) => ({ ...prev, space_id: Number(e.target.value) }))}
                className="w-full pr-10 pl-4 py-2.5 bg-background border border-border focus:border-primary rounded-xl text-xs font-semibold outline-none text-foreground"
              >
                {spaces.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} {s.capacity ? `(سعة ${s.capacity} شخص)` : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-bold text-foreground mb-1.5">
            وصف البرنامج ومحاوره (اختياري)
          </label>
          <textarea
            rows={3}
            value={formData.description}
            onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
            placeholder="نبذة عن محاور الدورة أو الدرس، الكتب المقررة، أو الفئة المستهدفة..."
            className="w-full px-4 py-2.5 bg-background border border-border focus:border-primary rounded-xl text-xs outline-none text-foreground resize-none leading-relaxed"
          />
        </div>
      </div>
    </div>
  );
}
