'use client';

import React, { useState } from 'react';
import { X, Plus, HeartHandshake, RefreshCw, AlertCircle } from 'lucide-react';
import { CreateOpportunityPayload } from '../../../../domain/entities/Volunteer';

interface CreateOpportunityModalProps {
  onClose: () => void;
  onCreateOpportunity: (payload: CreateOpportunityPayload) => Promise<any>;
}

export function CreateOpportunityModal({
  onClose,
  onCreateOpportunity,
}: CreateOpportunityModalProps) {
  const today = new Date().toISOString().split('T')[0];
  const nextMonth = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const [form, setForm] = useState<{
    title: string;
    description: string;
    required_volunteers: number;
    start_date: string;
    end_date: string;
  }>({
    title: '',
    description: '',
    required_volunteers: 5,
    start_date: today,
    end_date: nextMonth,
  });

  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) {
      setError('يرجى كتابة عنوان الفرصة التطوعية');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await onCreateOpportunity({
        title: form.title.trim(),
        description: form.description.trim(),
        required_volunteers: Number(form.required_volunteers) || 1,
        start_date: form.start_date,
        end_date: form.end_date,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'فشل إنشاء الفرصة بالسيرفر');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-3xl w-full max-w-lg max-h-[90vh] flex flex-col shadow-2xl overflow-hidden font-['Cairo'] animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 border-b border-border flex items-center justify-between bg-muted/20">
          <div className="flex items-center gap-2">
            <HeartHandshake className="w-5 h-5 text-primary" />
            <div>
              <h2 className="text-lg font-bold text-foreground">إنشاء فرصة تطوعية جديدة</h2>
              <p className="text-xs text-muted-foreground">طرح فرصة بالمسجد لاستقطاب المتطوعين عبر السيرفر</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted text-muted-foreground hover:text-foreground rounded-full transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-600 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="text-xs font-bold text-foreground block mb-1">
              عنوان الفرصة التطوعية *
            </label>
            <input
              type="text"
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="مثال: تنظيم دخول المصلين لصلاة الجمعة وإرشاد كبار السن"
              className="w-full px-3.5 py-2.5 bg-muted/30 border border-input rounded-xl text-xs font-semibold focus:ring-2 focus:ring-primary/30 outline-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-bold text-foreground block mb-1">
                العدد المطلوب *
              </label>
              <input
                type="number"
                min="1"
                required
                value={form.required_volunteers}
                onChange={(e) => setForm({ ...form, required_volunteers: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 bg-muted/30 border border-input rounded-xl text-xs font-semibold focus:ring-2 focus:ring-primary/30 outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-foreground block mb-1">
                تاريخ البدء *
              </label>
              <input
                type="date"
                required
                value={form.start_date}
                onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-muted/30 border border-input rounded-xl text-xs font-semibold focus:ring-2 focus:ring-primary/30 outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-foreground block mb-1">
                تاريخ الانتهاء *
              </label>
              <input
                type="date"
                required
                value={form.end_date}
                onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-muted/30 border border-input rounded-xl text-xs font-semibold focus:ring-2 focus:ring-primary/30 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-foreground block mb-1">
              شرح تفصيلي للمهام والمتطلبات
            </label>
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="اكتب هنا المهام المطلوبة من المتطوعين، الفترات الزمنية، وأي شروط خاصة..."
              className="w-full px-3.5 py-2.5 bg-muted/30 border border-input rounded-xl text-xs font-medium focus:ring-2 focus:ring-primary/30 outline-none resize-none"
            />
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
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>جاري الطرح...</span>
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5" />
                  <span>طرح الفرصة التطوعية</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
