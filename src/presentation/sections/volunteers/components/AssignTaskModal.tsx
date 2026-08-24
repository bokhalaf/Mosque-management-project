'use client';

import React, { useState, useEffect } from 'react';
import { X, Briefcase, RefreshCw, AlertCircle, Check, Plus, ListTodo } from 'lucide-react';
import { VolunteerApplication, AssignTaskPayload, VolunteerTask } from '../../../../domain/entities/Volunteer';
import { VolunteerRepositoryImpl } from '../../../../data/repositories/VolunteerRepositoryImpl';

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
  const [mode, setMode] = useState<'existing' | 'new'>('new');
  const [taskDescription, setTaskDescription] = useState<string>('');
  const [selectedTaskDesc, setSelectedTaskDesc] = useState<string>('');
  const [opportunityTasks, setOpportunityTasks] = useState<VolunteerTask[]>([]);
  const [loadingTasks, setLoadingTasks] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const repository = React.useMemo(() => new VolunteerRepositoryImpl(), []);

  useEffect(() => {
    if (application?.opportunity_id) {
      setLoadingTasks(true);
      repository.getOpportunityTasks(application.opportunity_id)
        .then((tasks) => {
          setOpportunityTasks(tasks || []);
          if (tasks && tasks.length > 0) {
            setMode('existing');
            setSelectedTaskDesc(tasks[0].task_description || '');
          } else {
            setMode('new');
          }
        })
        .catch(() => {
          setMode('new');
        })
        .finally(() => setLoadingTasks(false));
    }
  }, [application, repository]);

  if (!application) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalDesc = mode === 'existing' ? selectedTaskDesc.trim() : taskDescription.trim();

    if (!finalDesc) {
      setError('يرجى تحديد أو كتابة وصف المهمة المطلوب إسنادها للمتطوع');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await onAssignTask({
        application_id: application.id,
        opportunity_id: application.opportunity_id,
        task_description: finalDesc,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'فشل إسناد المهمة');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-3xl w-full max-w-lg max-h-[90vh] flex flex-col shadow-2xl overflow-hidden font-['Cairo'] animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 border-b border-border flex items-center justify-between bg-muted/20">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">إسناد مهمة للمتطوع</h2>
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
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto">
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

          {/* Mode Selector */}
          <div className="grid grid-cols-2 gap-2 bg-muted/30 p-1 rounded-xl border border-border/50">
            <button
              type="button"
              onClick={() => setMode('existing')}
              disabled={loadingTasks || opportunityTasks.length === 0}
              className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                mode === 'existing'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground disabled:opacity-40'
              }`}
            >
              <ListTodo className="w-3.5 h-3.5" />
              <span>اختيار مهمة موجودة {opportunityTasks.length > 0 ? `(${opportunityTasks.length})` : ''}</span>
            </button>

            <button
              type="button"
              onClick={() => setMode('new')}
              className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                mode === 'new'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>إسناد مهمة جديدة</span>
            </button>
          </div>

          {mode === 'existing' ? (
            <div className="space-y-2">
              <label className="text-xs font-bold text-foreground block">
                اختر إحدى مهام الفرصة لإسنادها:
              </label>
              {loadingTasks ? (
                <div className="py-6 text-center text-xs text-muted-foreground flex items-center justify-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin text-primary" />
                  <span>جاري تحميل قائمة المهام...</span>
                </div>
              ) : opportunityTasks.length === 0 ? (
                <div className="p-4 bg-muted/30 border border-border/60 rounded-xl text-center text-xs text-muted-foreground">
                  لا توجد مهام مسبقة مسجلة لهذه الفرصة. يرجى اختيار "إسناد مهمة جديدة".
                </div>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {opportunityTasks.map((t) => (
                    <div
                      key={t.id}
                      onClick={() => setSelectedTaskDesc(t.task_description)}
                      className={`p-3 rounded-xl border text-xs cursor-pointer transition-all flex items-start justify-between gap-2 ${
                        selectedTaskDesc === t.task_description
                          ? 'bg-primary/10 border-primary text-foreground font-bold shadow-xs'
                          : 'bg-muted/20 border-border/70 hover:bg-muted/40 text-muted-foreground'
                      }`}
                    >
                      <span>{t.task_description}</span>
                      {selectedTaskDesc === t.task_description && (
                        <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
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
          )}

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
              disabled={submitting || (mode === 'existing' && !selectedTaskDesc)}
              className="flex items-center gap-1.5 px-5 py-2 bg-primary text-primary-foreground font-bold text-xs rounded-xl hover:bg-primary/90 transition-all shadow-sm disabled:opacity-50"
            >
              {submitting ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Briefcase className="w-3.5 h-3.5" />
              )}
              <span>إسناد المهمة</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
