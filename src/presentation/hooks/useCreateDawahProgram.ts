'use client';

// ==============================
// Presentation Hook — useCreateDawahProgram
// إدارة نموذج إنشاء البرنامج الدعوي وجدولة الجلسات والربط مع السيرفر
// ==============================

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  DawahProgramType,
  DawahProgramLevel,
  MosqueSpace,
} from '../../domain/entities/DawahProgram';
import { DawahProgramRepositoryImpl } from '../../data/repositories/DawahProgramRepositoryImpl';
import { CreateDawahProgramUseCase } from '../../domain/usecases/dawah/CreateDawahProgramUseCase';
import { GetMosqueSpacesUseCase } from '../../domain/usecases/dawah/GetMosqueSpacesUseCase';
import { useToast } from '../../app/components/ui/Toast';

export interface ScheduleItemState {
  id: string;
  title: string;
  notes: string;
  date: string;
  start_time: string;
  end_time: string;
}

export interface CreateDawahProgramFormData {
  program_name: string;
  presenter: string;
  type: DawahProgramType;
  level: DawahProgramLevel;
  space_id: number;
  description: string;
  is_featured: boolean;
}

export function useCreateDawahProgram(onSuccess: () => void) {
  const { showToast } = useToast();
  const repository = useMemo(() => new DawahProgramRepositoryImpl(), []);
  const createProgramUC = useMemo(() => new CreateDawahProgramUseCase(repository), [repository]);
  const getSpacesUC = useMemo(() => new GetMosqueSpacesUseCase(repository), [repository]);

  const todayStr = new Date().toISOString().split('T')[0];

  const [formData, setFormData] = useState<CreateDawahProgramFormData>({
    program_name: '',
    presenter: '',
    type: 'course',
    level: 'beginner',
    space_id: 1,
    description: '',
    is_featured: false,
  });

  const [spaces, setSpaces] = useState<MosqueSpace[]>([]);
  const [loadingSpaces, setLoadingSpaces] = useState<boolean>(true);

  // Schedules Array State
  const [schedules, setSchedules] = useState<ScheduleItemState[]>([
    {
      id: '1',
      title: 'الجلسة الافتتاحية',
      notes: 'المقدمة والتعريف بأهداف البرنامج ومحاوره',
      date: todayStr,
      start_time: '16:30',
      end_time: '18:00',
    },
  ]);

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Load spaces
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoadingSpaces(true);
        const data = await getSpacesUC.execute();
        if (mounted && data && data.length > 0) {
          setSpaces(data);
          setFormData((prev) => ({
            ...prev,
            space_id: prev.space_id && data.some((s) => Number(s.id) === Number(prev.space_id)) ? Number(prev.space_id) : Number(data[0].id),
          }));
        }
      } catch (e) {
        console.warn('Failed to load spaces in hook:', e);
      } finally {
        if (mounted) setLoadingSpaces(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [getSpacesUC]);

  // Schedule Helpers
  const handleAddSchedule = useCallback(() => {
    const nextNum = schedules.length + 1;
    setSchedules((prev) => [
      ...prev,
      {
        id: String(Date.now()),
        title: `الجلسة رقم ${nextNum}`,
        notes: '',
        date: todayStr,
        start_time: '16:30',
        end_time: '18:00',
      },
    ]);
  }, [schedules.length, todayStr]);

  const handleRemoveSchedule = useCallback((id: string) => {
    if (schedules.length <= 1) {
      showToast('يجب وجود جلسة واحدة على الأقل في البرنامج', 'error');
      return;
    }
    setSchedules((prev) => prev.filter((s) => s.id !== id));
  }, [schedules.length, showToast]);

  const handleUpdateSchedule = useCallback((id: string, field: keyof ScheduleItemState, value: string) => {
    setSchedules((prev) =>
      prev.map((s) => (s.id === id ? { ...s, [field]: value } : s))
    );
  }, []);

  // Form Submission
  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!formData.program_name.trim()) {
      showToast('يرجى كتابة اسم البرنامج الدعوي', 'error');
      return;
    }
    if (!formData.presenter.trim()) {
      showToast('يرجى تحديد الشيخ أو المحاضر', 'error');
      return;
    }

    if (schedules.length === 0) {
      showToast('يجب إضافة جلسة واحدة على الأقل للبرنامج', 'error');
      return;
    }

    for (let i = 0; i < schedules.length; i++) {
      const s = schedules[i];
      if (!s.date || !s.start_time || !s.end_time) {
        showToast(`يرجى تحديد تاريخ ووقت الجلسة رقم ${i + 1}`, 'error');
        return;
      }
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await createProgramUC.execute({
        program_name: formData.program_name.trim(),
        presenter: formData.presenter.trim(),
        type: formData.type,
        level: formData.level,
        status: 'active',
        space_id: Number(formData.space_id),
        description: formData.description.trim() || undefined,
        is_featured: formData.is_featured,
        schedules: schedules.map((s) => ({
          ...(s.title && s.title.trim() ? { title: s.title.trim() } : {}),
          ...(s.notes && s.notes.trim() ? { notes: s.notes.trim() } : {}),
          date: s.date,
          start_time: s.start_time,
          end_time: s.end_time,
        })),
      });

      showToast('تم حفظ ونشر البرنامج الدعوي بالسيرفر بنجاح!', 'success');
      onSuccess();
    } catch (err: any) {
      console.error('Create Dawah Program error in hook:', err);
      const msg = err.message || 'فشل حفظ البرنامج الدعوي في السيرفر';
      setError(msg);
      showToast(msg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  }, [createProgramUC, formData, schedules, showToast, onSuccess]);

  return {
    formData,
    setFormData,
    spaces,
    loadingSpaces,
    schedules,
    handleAddSchedule,
    handleRemoveSchedule,
    handleUpdateSchedule,
    isSubmitting,
    error,
    setError,
    handleSubmit,
  };
}
