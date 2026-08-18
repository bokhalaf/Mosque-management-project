'use client';

// ==============================
// Presentation Component — CreateMosqueTaskModal
// ==============================

import React, { useState } from 'react';
import { X, Plus, Star, Sparkles, Wrench, Users, BookOpen, Clock, Calendar, AlertCircle } from 'lucide-react';
import { MosqueTaskCategory, CreateMosqueTaskPayload } from '../../../../domain/entities/MosqueTask';

interface CreateMosqueTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateMosqueTaskPayload) => Promise<any>;
}

export function CreateMosqueTaskModal({
  isOpen,
  onClose,
  onSubmit,
}: CreateMosqueTaskModalProps) {
  const [taskName, setTaskName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<MosqueTaskCategory>('prayer_worship');

  const [priority, setPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [dueDate, setDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueTime, setDueTime] = useState('10:00');
  const [assignedTo, setAssignedTo] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [formError, setFormError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskName.trim()) return;

    setSubmitting(true);
    setFormError(null);
    try {
      await onSubmit({
        task_name: taskName.trim(),
        title: taskName.trim(),
        description: description.trim() || undefined,
        category,
        priority,
        due_date: dueDate,
        due_time: dueTime,
        assigned_to: assignedTo.trim() || undefined,
      });
      onClose();
      setTaskName('');
      setDescription('');
      setAssignedTo('');
    } catch (err: any) {
      console.error("Create task server error:", err);
      setFormError(err.message || "تعذر إضافة المهمة من السيرفر.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 font-['Cairo'] animate-in fade-in duration-200">
      <div className="bg-card border border-border rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-6 overflow-hidden">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-primary/10 text-primary border border-primary/20">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-foreground">إضافة مهمة مفصلة جديدة</h3>
              <p className="text-xs text-muted-foreground">أنشئ مهمة جديدة بجدول المهام اليومية للمسجد</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted text-muted-foreground hover:text-foreground rounded-xl transition-all border border-transparent hover:border-border"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {formError && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-600 text-xs font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-foreground mb-1.5">اسم المهمة *</label>
            <input
              type="text"
              required
              value={taskName}
              onChange={(e) => setTaskName(e.target.value)}
              placeholder="مثال: تنظيف سجاد مصلى النساء، مراجعة الصوتيات..."
              className="w-full px-4 py-2.5 bg-muted/50 border border-border rounded-xl text-xs text-foreground focus:outline-none focus:border-primary transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-foreground mb-1.5">التصنيف *</label>
            <div className="grid grid-cols-3 gap-2">
              {(
                [
                  { id: 'prayer_worship', label: 'صلاة وعبادة', icon: Star },
                  { id: 'cleaning', label: 'نظافة', icon: Sparkles },
                  { id: 'maintenance', label: 'صيانة', icon: Wrench },
                  { id: 'activity', label: 'فعالية', icon: Users },
                  { id: 'administrative', label: 'إداري', icon: BookOpen },
                ] as const
              ).map((cat) => {
                const Icon = cat.icon;
                const isSelected = category === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategory(cat.id)}
                    className={`flex items-center gap-1.5 p-2 rounded-xl border text-xs font-bold transition-all ${
                      isSelected
                        ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                        : 'bg-muted/40 border-border/80 text-muted-foreground hover:text-foreground hover:bg-muted'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-foreground mb-1.5">التاريخ *</label>
              <div className="relative">
                <input
                  type="date"
                  required
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-3 py-2.5 bg-muted/50 border border-border rounded-xl text-xs text-foreground focus:outline-none focus:border-primary transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-foreground mb-1.5">الوقت *</label>
              <div className="relative">
                <input
                  type="time"
                  required
                  value={dueTime}
                  onChange={(e) => setDueTime(e.target.value)}
                  className="w-full px-3 py-2.5 bg-muted/50 border border-border rounded-xl text-xs text-foreground focus:outline-none focus:border-primary transition-all"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-foreground mb-1.5">الأولوية</label>
              <select
                value={priority}
                onChange={(e: any) => setPriority(e.target.value)}
                className="w-full px-3 py-2.5 bg-muted/50 border border-border rounded-xl text-xs text-foreground focus:outline-none focus:border-primary transition-all"
              >
                <option value="high">عالية</option>
                <option value="medium">متوسطة</option>
                <option value="low">منخفضة</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-foreground mb-1.5">المسؤول عن التنفيذ</label>
              <input
                type="text"
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                placeholder="اسم الموظف أو المتطوع"
                className="w-full px-3 py-2.5 bg-muted/50 border border-border rounded-xl text-xs text-foreground focus:outline-none focus:border-primary transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-foreground mb-1.5">الوصف (إضافي)</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="تفاصيل إضافية للمهمة..."
              className="w-full px-4 py-2 bg-muted/50 border border-border rounded-xl text-xs text-foreground focus:outline-none focus:border-primary transition-all resize-none"
            />
          </div>

          <div className="pt-4 border-t border-border flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 bg-muted hover:bg-muted/80 text-foreground border border-border rounded-xl text-xs font-bold transition-all"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl text-xs font-bold transition-all shadow-md shadow-primary/20 disabled:opacity-50"
            >
              {submitting ? 'جاري الحفظ...' : 'حفظ المهمة'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
