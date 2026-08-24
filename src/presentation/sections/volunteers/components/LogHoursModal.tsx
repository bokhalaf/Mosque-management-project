'use client';

import React, { useState } from 'react';
import { X, Clock, RefreshCw, AlertCircle, Award } from 'lucide-react';
import { VolunteerApplication, LogHoursPayload } from '../../../../domain/entities/Volunteer';

interface LogHoursModalProps {
  application: VolunteerApplication | null;
  onClose: () => void;
  onLogHours: (payload: LogHoursPayload) => Promise<any>;
}

export function LogHoursModal({
  application,
  onClose,
  onLogHours,
}: LogHoursModalProps) {
  const [form, setForm] = useState<{
    logged_hours: number;
    manager_evaluation: string;
    notes: string;
  }>({
    logged_hours: 4,
    manager_evaluation: 'ممتاز',
    notes: '',
  });

  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  if (!application) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.logged_hours <= 0) {
      setError('يرجى إدخال عدد ساعات صحيح أكبر من الصفر');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await onLogHours({
        volunteer_id: application.volunteer_id,
        opportunity_id: application.opportunity_id,
        logged_hours: Number(form.logged_hours),
        manager_evaluation: form.manager_evaluation,
        notes: form.notes.trim() || undefined,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'فشل تسجيل الساعات بالسيرفر');
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
            <Clock className="w-5 h-5 text-primary" />
            <div>
              <h2 className="text-lg font-bold text-foreground">تسجيل واعتماد ساعات التطوع</h2>
              <p className="text-xs text-muted-foreground">{application.volunteer_name}</p>
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
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-600 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="p-3 bg-muted/20 border border-border/60 rounded-xl text-xs space-y-1">
            <span className="text-muted-foreground text-[11px]">الفرصة:</span>
            <div className="font-bold text-foreground">{application.opportunity_title || 'فرصة عامة'}</div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-foreground block mb-1">
                عدد الساعات المنجزة *
              </label>
              <input
                type="number"
                min="0.5"
                step="0.5"
                required
                value={form.logged_hours}
                onChange={(e) => setForm({ ...form, logged_hours: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 bg-muted/30 border border-input rounded-xl text-xs font-semibold focus:ring-2 focus:ring-primary/30 outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-foreground block mb-1">
                تقييم الأداء والالتزام *
              </label>
              <select
                value={form.manager_evaluation}
                onChange={(e) => setForm({ ...form, manager_evaluation: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-muted/30 border border-input rounded-xl text-xs font-semibold focus:ring-2 focus:ring-primary/30 outline-none"
              >
                <option value="ممتاز">ممتاز (5/5)</option>
                <option value="جيد جداً">جيد جداً (4/5)</option>
                <option value="جيد">جيد (3/5)</option>
                <option value="مقبول">مقبول (2/5)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-foreground block mb-1">
              ملاحظات أو توصيات خاصة بالأداء
            </label>
            <textarea
              rows={3}
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="اكتب ملاحظات إضافية حول التزام المتطوع وأثره الميداني..."
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
                  <span>جاري الاعتماد...</span>
                </>
              ) : (
                <>
                  <Award className="w-3.5 h-3.5" />
                  <span>الاعتماد</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
