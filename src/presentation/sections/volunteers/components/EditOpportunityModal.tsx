'use client';

// ==============================
// UI Component — EditOpportunityModal
// نافذة تعديل الفرصة التطوعية بالسيرفر (PUT /volunteer/opportunities/{id})
// ==============================

import React, { useState } from 'react';
import { X, Edit3, Save, RefreshCw, AlertCircle, Plus, Trash2 } from 'lucide-react';
import { VolunteerOpportunity, CreateOpportunityPayload } from '../../../../domain/entities/Volunteer';

interface EditOpportunityModalProps {
  opportunity: VolunteerOpportunity;
  onClose: () => void;
  onUpdateOpportunity: (id: number | string, payload: Partial<CreateOpportunityPayload>) => Promise<any>;
}

export function EditOpportunityModal({
  opportunity,
  onClose,
  onUpdateOpportunity,
}: EditOpportunityModalProps) {
  const [form, setForm] = useState<{
    title: string;
    description: string;
    required_volunteers: number;
    start_date: string;
    end_date: string;
  }>({
    title: opportunity.title || '',
    description: opportunity.description || '',
    required_volunteers: opportunity.required_volunteers || 1,
    start_date: opportunity.start_date || '',
    end_date: opportunity.end_date || '',
  });

  const [newTasks, setNewTasks] = useState<string[]>([]);
  const [taskInput, setTaskInput] = useState<string>('');

  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleAddTask = () => {
    if (!taskInput.trim()) return;
    setNewTasks(prev => [...prev, taskInput.trim()]);
    setTaskInput('');
  };

  const handleRemoveTask = (index: number) => {
    setNewTasks(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) {
      setError('يرجى كتابة عنوان الفرصة التطوعية');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await onUpdateOpportunity(opportunity.id, {
        title: form.title.trim(),
        description: form.description.trim(),
        required_volunteers: Number(form.required_volunteers) || 1,
        start_date: form.start_date,
        end_date: form.end_date,
        ...(newTasks.length > 0 ? { tasks: newTasks } : {}),
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'فشل تعديل الفرصة بالسيرفر');
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
            <Edit3 className="w-5 h-5 text-primary" />
            <div>
              <h2 className="text-lg font-bold text-foreground">تعديل الفرصة التطوعية</h2>
              <p className="text-xs text-muted-foreground">تحديث بيانات الفرصة وإضافة مهام جديدة بالسيرفر</p>
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
              className="w-full px-3.5 py-2 bg-background border border-border rounded-xl text-xs text-foreground focus:outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-foreground block mb-1">
              وصف الفرصة والتفاصيل
            </label>
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full px-3.5 py-2 bg-background border border-border rounded-xl text-xs text-foreground focus:outline-none focus:border-primary resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-bold text-foreground block mb-1">
                العدد المطلوب *
              </label>
              <input
                type="number"
                min={1}
                required
                value={form.required_volunteers}
                onChange={(e) => setForm({ ...form, required_volunteers: Number(e.target.value) })}
                className="w-full px-3.5 py-2 bg-background border border-border rounded-xl text-xs text-foreground focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-foreground block mb-1">
                تاريخ البداية *
              </label>
              <input
                type="date"
                required
                value={form.start_date}
                onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                className="w-full px-3.5 py-2 bg-background border border-border rounded-xl text-xs text-foreground focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-foreground block mb-1">
                تاريخ النهاية
              </label>
              <input
                type="date"
                value={form.end_date}
                onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                className="w-full px-3.5 py-2 bg-background border border-border rounded-xl text-xs text-foreground focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          {/* New Tasks Addition */}
          <div className="border-t border-border pt-4 space-y-2">
            <label className="text-xs font-bold text-foreground block">
              إضافة مهام جديدة للفرصة
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={taskInput}
                onChange={(e) => setTaskInput(e.target.value)}
                placeholder="أدخل وصف المهمة المراد إضافتها..."
                className="flex-1 px-3.5 py-2 bg-background border border-border rounded-xl text-xs text-foreground focus:outline-none focus:border-primary"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTask();
                  }
                }}
              />
              <button
                type="button"
                onClick={handleAddTask}
                className="px-4 py-2 bg-primary/10 text-primary hover:bg-primary/20 font-bold text-xs rounded-xl flex items-center gap-1 border border-primary/20 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>إضافة</span>
              </button>
            </div>

            {newTasks.length > 0 && (
              <div className="space-y-1.5 pt-2">
                {newTasks.map((t, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between px-3 py-2 bg-muted/40 border border-border/80 rounded-xl text-xs"
                  >
                    <span className="text-foreground font-medium">{t}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTask(idx)}
                      className="text-rose-500 hover:text-rose-600 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </form>

        {/* Footer */}
        <div className="p-4 border-t border-border bg-muted/20 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="px-4 py-2 bg-muted text-foreground hover:bg-muted/80 font-bold text-xs rounded-xl transition-all"
          >
            إلغاء
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="flex items-center gap-2 px-5 py-2 bg-primary text-primary-foreground hover:bg-primary/90 font-bold text-xs rounded-xl shadow-sm transition-all disabled:opacity-50"
          >
            {submitting ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>جاري حفظ التعديلات...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>حفظ التعديلات</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
