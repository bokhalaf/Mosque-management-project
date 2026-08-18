'use client';

// ==============================
// Presentation Component — EditMosqueTaskModal
// ==============================

import React, { useState, useEffect } from 'react';
import { X, Edit, Star, Sparkles, Wrench, Users, BookOpen } from 'lucide-react';
import { MosqueTask, MosqueTaskCategory, UpdateMosqueTaskPayload } from '../../../../domain/entities/MosqueTask';

interface EditMosqueTaskModalProps {
  task: MosqueTask | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (id: number | string, payload: UpdateMosqueTaskPayload) => Promise<any>;
}

export function EditMosqueTaskModal({
  task,
  isOpen,
  onClose,
  onSubmit,
}: EditMosqueTaskModalProps) {
  const [taskName, setTaskName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<MosqueTaskCategory>('prayer');
  const [priority, setPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [dueDate, setDueDate] = useState('');
  const [dueTime, setDueTime] = useState('10:00');
  const [assignedTo, setAssignedTo] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (task) {
      setTaskName(task.task_name || task.title || '');
      setDescription(task.description || '');
      setCategory(task.category || 'prayer');
      setPriority(task.priority || 'medium');
      setDueDate(task.due_date || new Date().toISOString().split('T')[0]);
      setDueTime(task.due_time || task.time || '10:00');
      setAssignedTo(task.assigned_to || '');
    }
  }, [task]);

  if (!isOpen || !task) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskName.trim()) return;

    setSubmitting(true);
    try {
      await onSubmit(task.id, {
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
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 font-['Cairo'] animate-in fade-in duration-200">
      <div className="bg-card border border-border rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-6 overflow-hidden">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
              <Edit className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-foreground">تعديل مهمة المسجد</h3>
              <p className="text-xs text-muted-foreground">قم بتحديث بيانات المهمة المختارة</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted text-muted-foreground hover:text-foreground rounded-xl transition-all border border-transparent hover:border-border"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-foreground mb-1.5">اسم المهمة *</label>
            <input
              type="text"
              required
              value={taskName}
              onChange={(e) => setTaskName(e.target.value)}
              className="w-full px-4 py-2.5 bg-muted/50 border border-border rounded-xl text-xs text-foreground focus:outline-none focus:border-primary transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-foreground mb-1.5">التصنيف *</label>
            <div className="grid grid-cols-3 gap-2">
              {(
                [
                  { id: 'prayer', label: 'صلاة وعبادة', icon: Star },
                  { id: 'cleaning', label: 'نظافة', icon: Sparkles },
                  { id: 'maintenance', label: 'صيانة', icon: Wrench },
                  { id: 'event', label: 'فعالية', icon: Users },
                  { id: 'admin', label: 'إداري', icon: BookOpen },
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
              <input
                type="date"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2.5 bg-muted/50 border border-border rounded-xl text-xs text-foreground focus:outline-none focus:border-primary transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-foreground mb-1.5">الوقت *</label>
              <input
                type="time"
                required
                value={dueTime}
                onChange={(e) => setDueTime(e.target.value)}
                className="w-full px-3 py-2.5 bg-muted/50 border border-border rounded-xl text-xs text-foreground focus:outline-none focus:border-primary transition-all"
              />
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
            <label className="block text-xs font-bold text-foreground mb-1.5">الوصف</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
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
              {submitting ? 'جاري التعديل...' : 'تحديث المهمة'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
