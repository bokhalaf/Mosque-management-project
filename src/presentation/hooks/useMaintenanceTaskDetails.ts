// ==============================
// Presentation — Hook
// useMaintenanceTaskDetails: جلب تفاصيل طلب صيانة وإدارة تحديث حالته
// ==============================

import { useState, useEffect, useCallback } from 'react';
import { MaintenanceRepositoryImpl } from '../../data/repositories/MaintenanceRepositoryImpl';
import { MaintenanceRequestItem } from '../../domain/entities/Maintenance';
import { useToast } from '../../app/components/ui/Toast';
import { GetMaintenanceDetailsUseCase } from '../../domain/usecases/maintenance/GetMaintenanceDetailsUseCase';
import { TrackMaintenanceRequestUseCase } from '../../domain/usecases/maintenance/TrackMaintenanceRequestUseCase';
import { UpdateMaintenanceRequestUseCase } from '../../domain/usecases/maintenance/UpdateMaintenanceRequestUseCase';

const maintenanceRepo = new MaintenanceRepositoryImpl();
const getDetailsUseCase = new GetMaintenanceDetailsUseCase(maintenanceRepo);
const trackUseCase = new TrackMaintenanceRequestUseCase(maintenanceRepo);
const updateStatusUseCase = new UpdateMaintenanceRequestUseCase(maintenanceRepo);

export type MaintenanceStatusKey = 'pending' | 'in_progress' | 'completed' | 'cancelled';

export function useMaintenanceTaskDetails(taskId: string, refreshKey?: number) {
  const { showToast } = useToast();
  const [task, setTask] = useState<MaintenanceRequestItem | null>(null);
  const [trackingInfo, setTrackingInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentStatus, setCurrentStatus] = useState<MaintenanceStatusKey>('pending');
  const [completionNote, setCompletionNote] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [newNote, setNewNote] = useState('');

  const fetchDetails = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getDetailsUseCase.execute(taskId);
      setTask(data);
      setCurrentStatus((data.status as MaintenanceStatusKey) || 'pending');

      // Fetch tracking info (maintenance.track)
      const trackData = await trackUseCase.execute(taskId);
      if (trackData) {
        setTrackingInfo(trackData);
      }

      console.log('🔍 [عرض تفاصيل طلب صيانة] تم جلب وعرض تفاصيل الطلب:', {
        ID: data.id,
        رقم_الطلب: data.maintenance_number || `MR-${data.id}`,
        مقدم_الطلب: data.requested_by,
        العنوان: data.title,
        الوصف: data.description,
        الحالة: data.status,
        التتبع: trackData,
      });
    } catch (err: any) {
      console.error('Error fetching maintenance task details:', err);
      setError(err.message || 'تعذر تحميل تفاصيل طلب الصيانة');
    } finally {
      setLoading(false);
    }
  }, [taskId]);


  useEffect(() => {
    fetchDetails();
  }, [fetchDetails, refreshKey]);


  const handleUpdateStatus = useCallback(async (targetStatus: MaintenanceStatusKey, note?: string) => {
    setUpdatingStatus(true);
    try {
      const updated = await updateStatusUseCase.execute(taskId, { status: targetStatus, notes: note || completionNote });
      setTask(updated);
      setCurrentStatus((updated.status as MaintenanceStatusKey) || targetStatus);
      showToast('تم تحديث حالة طلب الصيانة بنجاح 🔄', 'success');
    } catch (err: any) {
      console.error('Error updating maintenance status:', err);
      showToast(err.message || 'حدث خطأ أثناء تحديث حالة طلب الصيانة', 'error');
    } finally {
      setUpdatingStatus(false);
    }
  }, [taskId, completionNote, showToast]);


  const submitNote = useCallback(() => {
    if (newNote.trim()) {
      handleUpdateStatus(currentStatus, newNote);
      setNewNote('');
    }
  }, [newNote, currentStatus, handleUpdateStatus]);

  return {
    task,
    trackingInfo,
    loading,
    error,
    currentStatus,
    completionNote,
    setCompletionNote,
    updatingStatus,
    newNote,
    setNewNote,
    fetchDetails,
    handleUpdateStatus,
    submitNote,
  };

}
