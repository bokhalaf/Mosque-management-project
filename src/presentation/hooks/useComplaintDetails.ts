// ==============================
// Presentation — Hook
// useComplaintDetails: جلب تفاصيل شكوى واحدة وإدارة تحديث حالتها باستخدام حالات الاستخدام (Use Cases) والـ Toast والكونسول
// ==============================

import { useState, useEffect, useCallback } from 'react';
import { ComplaintRepositoryImpl } from '../../data/repositories/ComplaintRepositoryImpl';
import { ComplaintItem } from '../../domain/entities/Complaint';
import { GetComplaintDetailsUseCase } from '../../domain/usecases/complaints/GetComplaintDetailsUseCase';
import { UpdateComplaintStatusUseCase } from '../../domain/usecases/complaints/UpdateComplaintStatusUseCase';
import { useToast } from '../../app/components/ui/Toast';

const complaintRepo = new ComplaintRepositoryImpl();
const getDetailsUseCase = new GetComplaintDetailsUseCase(complaintRepo);
const updateStatusUseCase = new UpdateComplaintStatusUseCase(complaintRepo);

export type ComplaintStatusKey = 'pending' | 'in_progress' | 'resolved' | 'canceled';

export function useComplaintDetails(complaintId: string) {
  const { showToast } = useToast();
  const [complaint, setComplaint] = useState<ComplaintItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentStatus, setCurrentStatus] = useState<ComplaintStatusKey>('pending');
  const [resolutionNote, setResolutionNote] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [newNote, setNewNote] = useState('');

  // 1. Fetch Details via GetComplaintDetailsUseCase (Swagger: getComplaintDetails - GET /api/admin/complaints/{id})
  const fetchDetails = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getDetailsUseCase.execute(complaintId);
      setComplaint(data);
      setCurrentStatus((data.status as ComplaintStatusKey) || 'pending');

      console.log('📬 [عرض تفاصيل الشكوى - UseCase] تم جلب رداً كاملاً من السيرفر بنجاح:', {
        ID: data.id,
        رقم_الشكوى: data.complaint_number || `CMP-${data.id}`,
        عنوان_الشكوى: data.title,
        وصف_الشكوى: data.description,
        الحالة: data.status,
        الأولوية: data.priority,
        التصنيف: data.complaint_type,
        مجهول: data.is_anonymous,
        المرسل: data.user?.name || data.email || 'غير معروف',
        سجل_الحالات: data.status_logs || [],
        المرفقات: data.files || [],
        البيانات_الكاملة_المرجعة: data,
      });
    } catch (err: any) {
      console.error('❌ [خطأ في جلب تفاصيل الشكوى]:', err);
      setError(err.message || 'تعذر تحميل تفاصيل الشكوى');
    } finally {
      setLoading(false);
    }
  }, [complaintId]);

  useEffect(() => {
    fetchDetails();
  }, [fetchDetails]);

  // 2. Update Status via UpdateComplaintStatusUseCase (Swagger: updateComplaintStatus - PATCH /api/admin/complaints/{id}/status)
  const handleUpdateStatus = useCallback(async (targetStatus: ComplaintStatusKey, note?: string) => {
    setUpdatingStatus(true);
    try {
      const updated = await updateStatusUseCase.execute(complaintId, targetStatus, note || resolutionNote);
      showToast('تم تحديث حالة الشكوى بنجاح 🔄', 'success');
      // Re-fetch to guarantee complete fresh status_logs thread from server
      await fetchDetails();
    } catch (err: any) {
      console.error('Error updating status:', err);
      showToast(err.message || 'حدث خطأ أثناء تحديث حالة الشكوى', 'error');
    } finally {
      setUpdatingStatus(false);
    }
  }, [complaintId, resolutionNote, showToast, fetchDetails]);

  const submitNote = useCallback(() => {
    if (newNote.trim()) {
      handleUpdateStatus(currentStatus, newNote);
      setNewNote('');
    }
  }, [newNote, currentStatus, handleUpdateStatus]);

  return {
    complaint,
    loading,
    error,
    currentStatus,
    resolutionNote,
    setResolutionNote,
    updatingStatus,
    newNote,
    setNewNote,
    fetchDetails,
    handleUpdateStatus,
    submitNote,
  };
}
