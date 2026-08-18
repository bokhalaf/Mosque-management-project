'use client';

import React, { useState, useEffect } from 'react';
import { X, Save, RefreshCw, AlertCircle, BookOpen } from 'lucide-react';
import {
  DawahProgram,
  DawahProgramType,
  DawahProgramLevel,
  DawahProgramStatus,
  MosqueSpace,
  UpdateDawahProgramPayload,
} from '../../../../domain/entities/DawahProgram';

interface EditDawahProgramModalProps {
  program: DawahProgram | null;
  spaces: MosqueSpace[];
  onClose: () => void;
  onUpdateProgram: (id: number | string, payload: UpdateDawahProgramPayload) => Promise<any>;
}

export function EditDawahProgramModal({
  program,
  spaces,
  onClose,
  onUpdateProgram,
}: EditDawahProgramModalProps) {
  const [form, setForm] = useState<{
    program_name: string;
    presenter: string;
    type: DawahProgramType;
    level: DawahProgramLevel;
    status: DawahProgramStatus;
    space_id: number;
    description: string;
    is_featured: boolean;
  }>({
    program_name: '',
    presenter: '',
    type: 'lecture',
    level: 'beginner',
    status: 'active',
    space_id: 1,
    description: '',
    is_featured: false,
  });

  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (program) {
      setForm({
        program_name: program.program_name || '',
        presenter: program.presenter || '',
        type: program.type || 'lecture',
        level: program.level || 'beginner',
        status: program.status || 'active',
        space_id: Number(program.space_id) || 1,
        description: program.description || '',
        is_featured: !!program.is_featured,
      });
      setError(null);
    }
  }, [program]);

  if (!program) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.program_name.trim() || !form.presenter.trim()) {
      setError('يرجى كتابة اسم البرنامج واسم المحاضر');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await onUpdateProgram(program.id, {
        mosque_id: Number(program.mosque_id),
        program_name: form.program_name.trim(),
        presenter: form.presenter.trim(),
        type: form.type,
        level: form.level,
        status: form.status,
        space_id: Number(form.space_id),
        description: form.description.trim() || undefined,
        is_featured: form.is_featured,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'فشل تحديث بيانات البرنامج بالسيرفر');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-3xl w-full max-w-xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden font-['Cairo'] animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 border-b border-border flex items-center justify-between bg-muted/20">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" />
            <div>
              <h2 className="text-lg font-bold text-foreground">تعديل بيانات البرنامج الدعوي</h2>
              <p className="text-xs text-muted-foreground">التعديل والحفظ المباشر على خادم السيرفر</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted text-muted-foreground hover:text-foreground rounded-full transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-600 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="text-xs font-bold text-foreground block mb-1">
              اسم البرنامج أو النشاط الدعوي *
            </label>
            <input
              type="text"
              required
              value={form.program_name}
              onChange={(e) => setForm({ ...form, program_name: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-muted/30 border border-input rounded-xl text-xs font-semibold focus:ring-2 focus:ring-primary/30 outline-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-foreground block mb-1">
                اسم الشيخ / المحاضر *
              </label>
              <input
                type="text"
                required
                value={form.presenter}
                onChange={(e) => setForm({ ...form, presenter: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-muted/30 border border-input rounded-xl text-xs font-semibold focus:ring-2 focus:ring-primary/30 outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-foreground block mb-1">
                نوع البرنامج *
              </label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value as DawahProgramType })}
                className="w-full px-3.5 py-2.5 bg-muted/30 border border-input rounded-xl text-xs font-semibold focus:ring-2 focus:ring-primary/30 outline-none"
              >
                <option value="lecture">محاضرة / درس</option>
                <option value="course">دورة علمية</option>
                <option value="competition">مسابقة دعوية</option>
                <option value="other">نشاط آخر</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-bold text-foreground block mb-1">
                المستوى المستهدف
              </label>
              <select
                value={form.level}
                onChange={(e) => setForm({ ...form, level: e.target.value as DawahProgramLevel })}
                className="w-full px-3.5 py-2.5 bg-muted/30 border border-input rounded-xl text-xs font-semibold focus:ring-2 focus:ring-primary/30 outline-none"
              >
                <option value="beginner">مبتدئ / عام</option>
                <option value="intermediate">متوسط</option>
                <option value="advanced">متقدم</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-foreground block mb-1">
                مكان الإقامة بالمسجد
              </label>
              <select
                value={form.space_id}
                onChange={(e) => setForm({ ...form, space_id: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 bg-muted/30 border border-input rounded-xl text-xs font-semibold focus:ring-2 focus:ring-primary/30 outline-none"
              >
                {spaces.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-foreground block mb-1">
                الحالة
              </label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as DawahProgramStatus })}
                className="w-full px-3.5 py-2.5 bg-muted/30 border border-input rounded-xl text-xs font-semibold focus:ring-2 focus:ring-primary/30 outline-none"
              >
                <option value="active">نشط</option>
                <option value="inactive">متوقف</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-foreground block mb-1">
              وصف البرنامج ومحاوره
            </label>
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-muted/30 border border-input rounded-xl text-xs font-medium focus:ring-2 focus:ring-primary/30 outline-none resize-none"
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="is_featured_edit"
              checked={form.is_featured}
              onChange={(e) => setForm({ ...form, is_featured: e.target.checked })}
              className="w-4 h-4 rounded text-primary focus:ring-primary"
            />
            <label htmlFor="is_featured_edit" className="text-xs font-bold text-foreground cursor-pointer">
              تمييز البرنامج وإبرازه في الواجهة الرئيسية
            </label>
          </div>

          <div className="p-4 border-t border-border bg-muted/10 flex justify-end gap-2 -mx-5 -mb-5 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-muted hover:bg-muted/80 text-foreground font-bold text-xs rounded-xl transition-all"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-1.5 px-5 py-2 bg-primary text-primary-foreground font-bold text-xs rounded-xl hover:bg-primary/90 transition-all shadow-sm"
            >
              {submitting ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Save className="w-3.5 h-3.5" />
              )}
              <span>حفظ التعديلات في السيرفر</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
