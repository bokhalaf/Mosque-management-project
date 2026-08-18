'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { X, Plus, Calendar, Clock, Trash2, Edit, AlertCircle, RefreshCw } from 'lucide-react';
import { DeleteConfirmModal } from '../../../../app/components/ui/DeleteConfirmModal';
import { DawahProgram, ProgramSchedule, CreateProgramSchedulePayload, UpdateProgramSchedulePayload } from '../../../../domain/entities/DawahProgram';

interface ScheduleManagementModalProps {
  program: DawahProgram | null;
  onClose: () => void;
  getSchedules: (programId: number | string) => Promise<ProgramSchedule[]>;
  onAddSchedule: (programId: number | string, payload: CreateProgramSchedulePayload) => Promise<any>;
  onUpdateSchedule: (programId: number | string, scheduleId: number | string, payload: UpdateProgramSchedulePayload) => Promise<any>;
  onDeleteSchedule: (programId: number | string, scheduleId: number | string) => Promise<any>;
}

export function ScheduleManagementModal({
  program,
  onClose,
  getSchedules,
  onAddSchedule,
  onUpdateSchedule,
  onDeleteSchedule,
}: ScheduleManagementModalProps) {
  const [schedules, setSchedules] = useState<ProgramSchedule[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionError, setActionError] = useState<string | null>(null);

  // Form State
  const [editingScheduleId, setEditingScheduleId] = useState<number | string | null>(null);
  const [form, setForm] = useState<{
    title: string;
    notes: string;
    date: string;
    start_time: string;
    end_time: string;
  }>({
    title: '',
    notes: '',
    date: new Date().toISOString().split('T')[0],
    start_time: '16:30',
    end_time: '18:00',
  });
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [deletingId, setDeletingId] = useState<number | string | null>(null);

  const fetchLiveSchedules = useCallback(async () => {
    if (!program) return;
    setLoading(true);
    try {
      const items = await getSchedules(program.id);
      setSchedules(items || []);
    } catch (e: any) {
      console.warn('Fetch live schedules failed:', e);
    } finally {
      setLoading(false);
    }
  }, [program, getSchedules]);

  useEffect(() => {
    fetchLiveSchedules();
  }, [fetchLiveSchedules]);

  if (!program) return null;

  const resetForm = () => {
    setEditingScheduleId(null);
    setForm({
      title: '',
      notes: '',
      date: new Date().toISOString().split('T')[0],
      start_time: '16:30',
      end_time: '18:00',
    });
    setActionError(null);
  };

  const handleEditClick = (sched: ProgramSchedule) => {
    setEditingScheduleId(sched.id);
    setForm({
      title: sched.title || '',
      notes: sched.notes || '',
      date: sched.date || new Date().toISOString().split('T')[0],
      start_time: sched.start_time || '16:30',
      end_time: sched.end_time || '18:00',
    });
    setActionError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.date || !form.start_time || !form.end_time) {
      setActionError('يرجى تحديد التاريخ ووقت البداية والنهاية');
      return;
    }

    setSubmitting(true);
    setActionError(null);

    try {
      if (editingScheduleId) {
        // Update Live Server Schedule - single instant state update
        const updated = await onUpdateSchedule(program.id, editingScheduleId, {
          title: form.title.trim() || undefined,
          notes: form.notes.trim() || undefined,
          date: form.date,
          start_time: form.start_time,
          end_time: form.end_time,
        });
        if (updated) {
          setSchedules((prev) =>
            prev.map((s) => (String(s.id) === String(editingScheduleId) ? { ...s, ...updated } : s))
          );
        }
      } else {
        // Add Live Server Schedule - single instant state update upon response
        const added = await onAddSchedule(program.id, {
          title: form.title.trim() || undefined,
          notes: form.notes.trim() || undefined,
          date: form.date,
          start_time: form.start_time,
          end_time: form.end_time,
        });
        if (added) {
          setSchedules((prev) => [...prev, added]);
        }
      }
      resetForm();
    } catch (err: any) {
      setActionError(err.message || 'فشل حفظ الجلسة على السيرفر');
    } finally {
      setSubmitting(false);
    }
  };

  const [scheduleToDelete, setScheduleToDelete] = useState<ProgramSchedule | null>(null);
  const [isDeletingSchedule, setIsDeletingSchedule] = useState<boolean>(false);

  const handleConfirmDeleteSchedule = async () => {
    if (!scheduleToDelete) return;
    setIsDeletingSchedule(true);
    setActionError(null);
    try {
      await onDeleteSchedule(program.id, scheduleToDelete.id);
      setSchedules((prev) => prev.filter((s) => String(s.id) !== String(scheduleToDelete.id)));
      setScheduleToDelete(null);
    } catch (err: any) {
      setActionError(err.message || 'فشل حذف الجلسة من السيرفر');
    } finally {
      setIsDeletingSchedule(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 font-['Cairo']">
      <div className="bg-card border border-border rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 border-b border-border flex items-center justify-between bg-muted/20">
          <div>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-bold text-foreground">
                إدارة وجدولة جلسات البرنامج
              </h2>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {program.program_name}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted text-muted-foreground hover:text-foreground rounded-full transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {actionError && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-600 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{actionError}</span>
            </div>
          )}

          {/* Form Box */}
          <form onSubmit={handleSubmit} className="p-4 bg-muted/30 border border-border/80 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-foreground">
                {editingScheduleId ? 'تعديل الجلسة المحددة' : 'إضافة موعد جلسة جديدة'}
              </span>
              {editingScheduleId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="text-xs text-muted-foreground hover:text-foreground underline"
                >
                  إلغاء التعديل
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-muted-foreground block mb-1">
                  عنوان الجلسة (اختياري)
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="مثال: الجلسة الثانية - فضل التدبر"
                  className="w-full px-3 py-2 bg-card border border-input rounded-xl text-xs focus:ring-2 focus:ring-primary/30 outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-muted-foreground block mb-1">
                  تاريخ الجلسة *
                </label>
                <input
                  type="date"
                  required
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  className="w-full px-3 py-2 bg-card border border-input rounded-xl text-xs focus:ring-2 focus:ring-primary/30 outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-muted-foreground block mb-1">
                  وقت البدء *
                </label>
                <input
                  type="time"
                  required
                  value={form.start_time}
                  onChange={(e) => setForm({ ...form, start_time: e.target.value })}
                  className="w-full px-3 py-2 bg-card border border-input rounded-xl text-xs focus:ring-2 focus:ring-primary/30 outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-muted-foreground block mb-1">
                  وقت الانتهاء *
                </label>
                <input
                  type="time"
                  required
                  value={form.end_time}
                  onChange={(e) => setForm({ ...form, end_time: e.target.value })}
                  className="w-full px-3 py-2 bg-card border border-input rounded-xl text-xs focus:ring-2 focus:ring-primary/30 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-muted-foreground block mb-1">
                ملاحظات أو توجيهات الجلسة (اختياري)
              </label>
              <input
                type="text"
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="مثال: يرجى الحضور مبكراً مع إحضار المتن"
                className="w-full px-3 py-2 bg-card border border-input rounded-xl text-xs focus:ring-2 focus:ring-primary/30 outline-none"
              />
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="submit"
                disabled={submitting}
                className="flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground text-xs font-bold rounded-xl hover:bg-primary/90 transition-all shadow-sm"
              >
                {submitting ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Plus className="w-3.5 h-3.5" />
                )}
                <span>{editingScheduleId ? 'حفظ التعديلات' : 'حفظ الجلسة'}</span>
              </button>
            </div>
          </form>

          {/* Schedules List */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-foreground">
                الجلسات المسجلة ({schedules.length})
              </h3>
              <button
                onClick={fetchLiveSchedules}
                disabled={loading}
                className="flex items-center gap-1 text-[11px] text-primary hover:underline"
              >
                <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
                <span>تحديث القائمة</span>
              </button>
            </div>

            {loading ? (
              <div className="p-8 text-center text-xs text-muted-foreground flex flex-col items-center gap-2">
                <RefreshCw className="w-5 h-5 animate-spin text-primary" />
                <span>جاري تحميل الجلسات...</span>
              </div>
            ) : schedules.length === 0 ? (
              <div className="p-6 bg-muted/20 border border-dashed border-border rounded-2xl text-center text-xs text-muted-foreground">
                لا توجد جلسات مسجلة لهذا البرنامج حالياً. يمكنك إضافة جلسة من النموذج أعلاه.
              </div>
            ) : (
              <div className="space-y-2">
                {schedules.map((sched, idx) => (
                  <div
                    key={sched.id || idx}
                    className="p-3.5 bg-card border border-border/80 rounded-2xl flex items-center justify-between gap-3 hover:border-primary/40 transition-all"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0">
                        {idx + 1}
                      </div>
                      <div>
                        <div className="font-bold text-xs text-foreground">
                          {sched.title || `الجلسة رقم ${idx + 1}`}
                        </div>
                        <div className="flex items-center gap-3 text-[11px] text-muted-foreground mt-1">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-primary" />
                            <span>{sched.date}</span>
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-primary" />
                            <span>{sched.start_time} - {sched.end_time}</span>
                          </span>
                        </div>
                        {sched.notes && (
                          <p className="text-[10px] text-muted-foreground mt-1 bg-muted/40 px-2 py-0.5 rounded-md inline-block">
                            {sched.notes}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => handleEditClick(sched)}
                        className="p-2 hover:bg-muted text-muted-foreground hover:text-foreground rounded-lg transition-all"
                        title="تعديل الجلسة"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setScheduleToDelete(sched)}
                        className="p-2 hover:bg-rose-500/10 text-muted-foreground hover:text-rose-600 rounded-lg transition-all"
                        title="حذف الجلسة"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border bg-muted/10 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-muted hover:bg-muted/80 text-foreground font-bold text-xs rounded-xl transition-all"
          >
            إغلاق
          </button>
        </div>
      </div>

      {/* Delete Schedule Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={!!scheduleToDelete}
        title="تأكيد حذف الجلسة المجدولة"
        description="هل أنت متأكد من رغبتك في حذف هذه الجلسة المجدولة؟ لا يمكن التراجع عن هذه العملية بعد التأكيد وسوف يتم إرسال طلب الحذف إلى السيرفر."
        itemName={scheduleToDelete ? `${scheduleToDelete.title || 'جلسة بدون عنوان'} (${scheduleToDelete.date} ${scheduleToDelete.start_time})` : undefined}
        confirmButtonText="نعم، حذف الجلسة"
        isDeleting={isDeletingSchedule}
        onConfirm={handleConfirmDeleteSchedule}
        onClose={() => setScheduleToDelete(null)}
      />
    </div>
  );
}
