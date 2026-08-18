'use client';

import React, { useState } from 'react';
import { X, Briefcase, RefreshCw, AlertCircle } from 'lucide-react';
import { VolunteerApplication, AssignTaskPayload } from '../../../../domain/entities/Volunteer';

interface AssignTaskModalProps {
  application: VolunteerApplication | null;
  onClose: () => void;
  onAssignTask: (payload: AssignTaskPayload) => Promise<any>;
}

export function AssignTaskModal({
  application,
  onClose,
  onAssignTask,
}: AssignTaskModalProps) {
  const [taskDescription, setTaskDescription] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  if (!application) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskDescription.trim()) {
      setError('يرجى كتابة وصف المهمة المطلوب إسنادها للمتطوع');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await onAssignTask({
        application_id: application.id,
        opportunity_id: application.opportunity_id,
        task_description: taskDescription.trim(),
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'فشل إسناد المهمة بالسيرفر');
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
            <Briefcase className="w-5 h-5 text-primary" />
            <div>
              <h2 className="text-lg font-bold text-foreground">إسناد مهمة للمتطوع</h2>
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

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-600 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="p-3 bg-muted/20 border border-border/60 rounded-xl text-xs space-y-1">
            <span className="text-muted-foreground text-[11px]">الفرصة التطوعية:</span>
            <div className="font-bold text-foreground">{application.opportunity_title || 'فرصة عامة'}</div>
          </div>

          <div>
            <label className="text-xs font-bold text-foreground block mb-1">
              تفاصيل ووصف المهمة المسندة *
            </label>
            <textarea
              rows={4}
              required
              value={taskDescription}
              onChange={(e) => setTaskDescription(e.target.value)}
              placeholder="مثال: الإشراف على البوابة الجنوبية، استقبال وتوجيه المصلين، والمساعدة في توزيع المياه والمصاحف..."
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
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Briefcase className="w-3.5 h-3.5" />
              )}
              <span>إسناد المهمة بالسيرفر</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
