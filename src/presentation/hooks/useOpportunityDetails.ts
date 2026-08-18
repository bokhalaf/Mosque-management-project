'use client';

// ==============================
// Presentation Hook — useOpportunityDetails
// ==============================

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  VolunteerOpportunity,
  VolunteerApplication,
  VolunteerTask,
  LogHoursPayload,
  AssignTaskPayload,
  CreateOpportunityPayload,
} from '../../domain/entities/Volunteer';
import { VolunteerRepositoryImpl } from '../../data/repositories/VolunteerRepositoryImpl';
import {
  GetOpportunityByIdUseCase,
  UpdateVolunteerOpportunityUseCase,
  GetOpportunityTasksUseCase,
  CreateOpportunityTaskUseCase,
  GetOpportunityApplicationsUseCase,
  ApproveApplicationUseCase,
  RejectApplicationUseCase,
  AssignVolunteerTaskUseCase,
  LogVolunteerHoursUseCase,
  IssueCertificateUseCase,
  CloseOpportunityUseCase,
} from '../../domain/usecases/volunteers';
import {
  installFetchInterceptor,
  globalDebugListeners,
  VolunteerDebugLog,
} from './useVolunteers';
import { useToast } from '../../app/components/ui/Toast';

export function useOpportunityDetails(opportunityId: number | string) {
  const router = useRouter();
  const { showToast } = useToast();

  const [opportunity, setOpportunity] = useState<VolunteerOpportunity | null>(null);
  const [tasks, setTasks] = useState<VolunteerTask[]>([]);
  const [applications, setApplications] = useState<VolunteerApplication[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Debug Box
  const [showDebugTerminal, setShowDebugTerminal] = useState<boolean>(false);
  const [debugLogs, setDebugLogs] = useState<VolunteerDebugLog[]>([]);

  useEffect(() => {
    installFetchInterceptor();
    const listener = (log: VolunteerDebugLog) => {
      // In opportunity details page: Log detail endpoint & specific opportunity tasks/apps!
      const path = log.url.replace('https://mms-backend-rose.vercel.app/api', '');
      const isRelevantDetail = path.includes(`/volunteer/opportunities/${opportunityId}`) || path.includes('/volunteer/opportunities');
      if (isRelevantDetail) {
        setDebugLogs(prev => [log, ...prev.slice(0, 29)]);
      }
    };
    globalDebugListeners.push(listener);
    return () => {
      const idx = globalDebugListeners.indexOf(listener);
      if (idx !== -1) globalDebugListeners.splice(idx, 1);
    };
  }, []);

  const clearDebugLogs = useCallback(() => setDebugLogs([]), []);

  // Active sub-tab in details
  const [activeTab, setActiveTab] = useState<'tasks' | 'volunteers' | 'overview'>('tasks');

  // Modals state
  const [selectedAppForTask, setSelectedAppForTask] = useState<VolunteerApplication | null>(null);
  const [selectedAppForHours, setSelectedAppForHours] = useState<VolunteerApplication | null>(null);

  const repository = useMemo(() => new VolunteerRepositoryImpl(), []);

  // UseCases
  const getOpportunityByIdUC = useMemo(() => new GetOpportunityByIdUseCase(repository), [repository]);
  const updateOpportunityUC = useMemo(() => new UpdateVolunteerOpportunityUseCase(repository), [repository]);
  const getTasksUC = useMemo(() => new GetOpportunityTasksUseCase(repository), [repository]);
  const createTaskUC = useMemo(() => new CreateOpportunityTaskUseCase(repository), [repository]);
  const getApplicationsUC = useMemo(() => new GetOpportunityApplicationsUseCase(repository), [repository]);
  const approveAppUC = useMemo(() => new ApproveApplicationUseCase(repository), [repository]);
  const rejectAppUC = useMemo(() => new RejectApplicationUseCase(repository), [repository]);
  const assignTaskUC = useMemo(() => new AssignVolunteerTaskUseCase(repository), [repository]);
  const logHoursUC = useMemo(() => new LogVolunteerHoursUseCase(repository), [repository]);
  const issueCertUC = useMemo(() => new IssueCertificateUseCase(repository), [repository]);
  const closeOppUC = useMemo(() => new CloseOpportunityUseCase(repository), [repository]);

  const fetchOpportunityData = useCallback(async () => {
    if (!opportunityId) return;
    setLoading(true);
    setError(null);
    try {
      const [opp, oppTasks, oppApps] = await Promise.all([
        getOpportunityByIdUC.execute(opportunityId),
        getTasksUC.execute(opportunityId),
        getApplicationsUC.execute(opportunityId),
      ]);

      if (!opp) {
        throw new Error('الفرصة التطوعية المطلوبة غير موجودة');
      }

      setOpportunity(opp);
      setTasks(oppTasks);
      setApplications(oppApps);
    } catch (err: any) {
      console.error('Error fetching opportunity details:', err);
      setError(err.message || 'تعذر جلب تفاصيل الفرصة التطوعية من السيرفر');
    } finally {
      setLoading(false);
    }
  }, [opportunityId, getOpportunityByIdUC, getTasksUC, getApplicationsUC]);

  useEffect(() => {
    fetchOpportunityData();
  }, [fetchOpportunityData]);

  // Actions
  const handleCreateTask = useCallback(async (taskDescription: string) => {
    if (!opportunityId || !taskDescription.trim()) return;
    try {
      // POST /api/volunteer/opportunities/{id}/tasks
      const newTask = await createTaskUC.execute(opportunityId, taskDescription.trim());
      // Re-fetch tasks from server to stay in sync
      const freshTasks = await getTasksUC.execute(opportunityId);
      setTasks(freshTasks);
      showToast('تمت إضافة المهمة بالسيرفر بنجاح', 'success');
      return newTask;
    } catch (err: any) {
      showToast(err.message || 'فشل إضافة المهمة بالسيرفر', 'error');
      throw err;
    }
  }, [opportunityId, createTaskUC, getTasksUC, showToast]);

  const handleAssignTask = useCallback(async (payload: AssignTaskPayload) => {
    try {
      const newTask = await assignTaskUC.execute({
        ...payload,
        opportunity_id: opportunityId,
      });
      // Re-fetch tasks from server
      const freshTasks = await getTasksUC.execute(opportunityId);
      setTasks(freshTasks);
      showToast('تم إسناد المهمة للمتطوع بالسيرفر بنجاح', 'success');
      setSelectedAppForTask(null);
      return newTask;
    } catch (err: any) {
      showToast(err.message || 'فشل إسناد المهمة', 'error');
      throw err;
    }
  }, [opportunityId, assignTaskUC, getTasksUC, showToast]);

  const handleApproveApplication = useCallback(async (appId: number | string) => {
    try {
      await approveAppUC.execute(appId);
      setApplications(prev =>
        prev.map(a => String(a.id) === String(appId) ? { ...a, status: 'approved' } : a)
      );
      setOpportunity(prev => prev ? {
        ...prev,
        current_volunteers: (prev.current_volunteers || 0) + 1,
      } : null);
      showToast('تم قبول واعتماد المتطوع بنجاح بالسيرفر', 'success');
    } catch (err: any) {
      showToast(err.message || 'فشل قبول الطلب', 'error');
    }
  }, [approveAppUC, showToast]);

  const handleRejectApplication = useCallback(async (appId: number | string) => {
    if (!confirm('هل أنت متأكد من رفض هذا الطلب؟')) return;
    try {
      await rejectAppUC.execute(appId);
      setApplications(prev =>
        prev.map(a => String(a.id) === String(appId) ? { ...a, status: 'rejected' } : a)
      );
      showToast('تم رفض الطلب', 'error');
    } catch (err: any) {
      showToast(err.message || 'فشل رفض الطلب', 'error');
    }
  }, [rejectAppUC, showToast]);

  const handleLogHours = useCallback(async (payload: LogHoursPayload) => {
    try {
      await logHoursUC.execute(payload);
      showToast('تم تسجيل واعتماد الساعات بالسيرفر بنجاح', 'success');
      setSelectedAppForHours(null);
    } catch (err: any) {
      showToast(err.message || 'فشل تسجيل الساعات بالسيرفر', 'error');
      throw err;
    }
  }, [logHoursUC, showToast]);

  const handleIssueCertificate = useCallback(async (volunteerId: number | string, volunteerName: string) => {
    try {
      await issueCertUC.execute(volunteerId, opportunityId);
      showToast(`تم إصدار شهادة التطوع للمتطوع ${volunteerName} بنجاح`, 'success');
    } catch (err: any) {
      showToast(err.message || 'فشل إصدار الشهادة بالسيرفر', 'error');
    }
  }, [opportunityId, issueCertUC, showToast]);

  const handleUpdateOpportunity = useCallback(async (payload: Partial<CreateOpportunityPayload>) => {
    if (!opportunityId) return;
    try {
      const updated = await updateOpportunityUC.execute(opportunityId, payload);
      const freshOpp = await getOpportunityByIdUC.execute(opportunityId);
      if (freshOpp) setOpportunity(freshOpp);
      showToast('تم تعديل بيانات الفرصة والمهام بالسيرفر بنجاح', 'success');
      return updated;
    } catch (err: any) {
      showToast(err.message || 'فشل تعديل الفرصة بالسيرفر', 'error');
      throw err;
    }
  }, [opportunityId, updateOpportunityUC, getOpportunityByIdUC, showToast]);

  const handleCloseOpportunity = useCallback(async () => {
    if (!opportunityId) return;
    try {
      await closeOppUC.execute(opportunityId);
      setOpportunity(prev => prev ? { ...prev, status: 'closed' } : null);
      showToast('تم إغلاق الفرصة التطوعية بالسيرفر بنجاح', 'success');
    } catch (err: any) {
      showToast(err.message || 'فشل إغلاق الفرصة', 'error');
      throw err;
    }
  }, [opportunityId, closeOppUC, showToast]);

  const stats = useMemo(() => {
    const approvedVolunteers = applications.filter(a => a.status === 'approved').length;
    const pendingApplications = applications.filter(a => a.status === 'pending').length;
    const completedTasks = tasks.filter(t => t.status === 'completed').length;
    const required = opportunity?.required_volunteers || 1;
    const progressPercent = Math.min(100, Math.round((approvedVolunteers / required) * 100));

    return {
      approvedVolunteers,
      pendingApplications,
      totalTasks: tasks.length,
      completedTasks,
      progressPercent,
    };
  }, [applications, tasks, opportunity]);

  return {
    opportunity,
    tasks,
    applications,
    stats,
    loading,
    error,
    activeTab,
    setActiveTab,
    selectedAppForTask,
    setSelectedAppForTask,
    selectedAppForHours,
    setSelectedAppForHours,
    fetchOpportunityData,
    handleCreateTask,
    handleAssignTask,
    handleApproveApplication,
    handleRejectApplication,
    handleLogHours,
    handleIssueCertificate,
    handleCloseOpportunity,
    handleUpdateOpportunity,
    showDebugTerminal,
    setShowDebugTerminal,
    debugLogs,
    clearDebugLogs,
    router,
  };
}
