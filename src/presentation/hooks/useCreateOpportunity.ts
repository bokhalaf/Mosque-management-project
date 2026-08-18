'use client';

// ==============================
// Presentation Hook — useCreateOpportunity
// ==============================

import { useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { VolunteerRepositoryImpl } from '../../data/repositories/VolunteerRepositoryImpl';
import {
  CreateVolunteerOpportunityUseCase,
  CreateOpportunityTaskUseCase,
} from '../../domain/usecases/volunteers';
import { useToast } from '../../app/components/ui/Toast';

export function useCreateOpportunity() {
  const router = useRouter();
  const { showToast } = useToast();

  const today = new Date().toISOString().split('T')[0];
  const nextMonth = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const [form, setForm] = useState({
    title: '',
    description: '',
    required_volunteers: 5,
    start_date: today,
    end_date: nextMonth,
  });

  const [tasks, setTasks] = useState<string[]>([
    'تنظيم حركة دخول وخروج المصلين',
    'المساعدة في تجهيز وتوزيع المياه والمصاحف',
  ]);

  const [newTaskInput, setNewTaskInput] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const repository = useMemo(() => new VolunteerRepositoryImpl(), []);
  const createOpportunityUC = useMemo(() => new CreateVolunteerOpportunityUseCase(repository), [repository]);
  const createTaskUC = useMemo(() => new CreateOpportunityTaskUseCase(repository), [repository]);

  const handleFieldChange = useCallback((field: string, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setError(null);
  }, []);

  const handleAddTask = useCallback(() => {
    if (!newTaskInput.trim()) return;
    setTasks(prev => [...prev, newTaskInput.trim()]);
    setNewTaskInput('');
  }, [newTaskInput]);

  const handleRemoveTask = useCallback((index: number) => {
    setTasks(prev => prev.filter((_, idx) => idx !== index));
  }, []);

  const handleUpdateTask = useCallback((index: number, value: string) => {
    setTasks(prev => prev.map((t, idx) => idx === index ? value : t));
  }, []);

  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!form.title.trim()) {
      setError('يرجى كتابة عنوان الفرصة التطوعية');
      return;
    }

    if (Number(form.required_volunteers) <= 0) {
      setError('يرجى تحديد عدد متطوعين مطلوب أكبر من الصفر');
      return;
    }

    if (!form.start_date) {
      setError('يرجى تحديد تاريخ بداية الفرصة');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      // 1. Create the Opportunity with tasks array directly in the payload
      const validTasks = tasks.filter(t => t && t.trim().length > 0);
      const createdOpp = await createOpportunityUC.execute({
        title: form.title.trim(),
        description: form.description.trim(),
        required_volunteers: Number(form.required_volunteers),
        start_date: form.start_date,
        end_date: form.end_date,
        tasks: validTasks,
      });

      showToast('تم طرح الفرصة التطوعية وحفظ مهامها بالسيرفر بنجاح', 'success');
      router.push(`/volunteers/opportunities/${createdOpp.id}`);
    } catch (err: any) {
      console.error('Error creating opportunity:', err);
      setError(err.message || 'فشل إنشاء الفرصة التطوعية بالسيرفر');
      showToast(err.message || 'فشل إنشاء الفرصة التطوعية بالسيرفر', 'error');
    } finally {
      setSubmitting(false);
    }
  }, [form, tasks, createOpportunityUC, createTaskUC, showToast, router]);

  return {
    form,
    tasks,
    newTaskInput,
    setNewTaskInput,
    submitting,
    error,
    handleFieldChange,
    handleAddTask,
    handleRemoveTask,
    handleUpdateTask,
    handleSubmit,
    router,
  };
}
