// ==============================
// Presentation Hook — useVolunteers
// ==============================

import { useState, useEffect, useCallback } from 'react';
import {
  VolunteerOpportunity,
  VolunteerApplication,
  VolunteerTask,
  VolunteerLog,
  VolunteerCertificate,
  CreateOpportunityPayload,
  AssignTaskPayload,
  LogHoursPayload,
} from "../../domain/entities/Volunteer";
import { VolunteerRepositoryImpl } from "../../data/repositories/VolunteerRepositoryImpl";

const repository = new VolunteerRepositoryImpl();

export function useVolunteers() {
  const [opportunities, setOpportunities] = useState<VolunteerOpportunity[]>([]);
  const [applications, setApplications] = useState<VolunteerApplication[]>([]);
  const [tasks, setTasks] = useState<VolunteerTask[]>([]);
  const [logs, setLogs] = useState<VolunteerLog[]>([]);
  const [certificates, setCertificates] = useState<VolunteerCertificate[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAllVolunteerData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [opps, apps, tsk, lg, cert] = await Promise.all([
        repository.getManagerOpportunities(),
        repository.getOpportunityApplications(),
        repository.getTasks(),
        repository.getLogs(),
        repository.getCertificates(),
      ]);
      setOpportunities(opps);
      setApplications(apps);
      setTasks(tsk);
      setLogs(lg);
      setCertificates(cert);
    } catch (err: any) {
      setError(err.message || 'تعذر تحميل بيانات إدارة المتطوعين');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllVolunteerData();
  }, [fetchAllVolunteerData]);

  const createOpportunity = useCallback(async (payload: CreateOpportunityPayload) => {
    try {
      const newOpp = await repository.createOpportunity(payload);
      setOpportunities(prev => [newOpp, ...prev]);
      return newOpp;
    } catch (err: any) {
      throw new Error(err.message || 'فشل إنشاء الفرصة التطوعية');
    }
  }, []);

  const closeOpportunity = useCallback(async (id: number | string) => {
    try {
      await repository.closeOpportunity(id);
      setOpportunities(prev =>
        prev.map(o => String(o.id) === String(id) ? { ...o, status: 'closed' } : o)
      );
    } catch (err: any) {
      throw new Error(err.message || 'فشل إغلاق الفرصة');
    }
  }, []);

  const approveApplication = useCallback(async (id: number | string) => {
    try {
      await repository.approveApplication(id);
      setApplications(prev =>
        prev.map(a => String(a.id) === String(id) ? { ...a, status: 'approved' } : a)
      );
    } catch (err: any) {
      throw new Error(err.message || 'فشل قبول الطلب');
    }
  }, []);

  const rejectApplication = useCallback(async (id: number | string) => {
    try {
      await repository.rejectApplication(id);
      setApplications(prev =>
        prev.map(a => String(a.id) === String(id) ? { ...a, status: 'rejected' } : a)
      );
    } catch (err: any) {
      throw new Error(err.message || 'فشل رفض الطلب');
    }
  }, []);

  const assignTask = useCallback(async (payload: AssignTaskPayload) => {
    try {
      const newTask = await repository.assignTask(payload);
      setTasks(prev => [newTask, ...prev]);
      return newTask;
    } catch (err: any) {
      throw new Error(err.message || 'فشل إسناد المهمة');
    }
  }, []);

  const logHours = useCallback(async (payload: LogHoursPayload) => {
    try {
      const newLog = await repository.logVolunteerHours(payload);
      setLogs(prev => [newLog, ...prev]);
      return newLog;
    } catch (err: any) {
      throw new Error(err.message || 'فشل تسجيل الساعات');
    }
  }, []);

  const issueCertificate = useCallback(async (volunteerId: number | string, opportunityId: number | string) => {
    try {
      const cert = await repository.issueCertificate(volunteerId, opportunityId);
      setCertificates(prev => [cert, ...prev]);
      return cert;
    } catch (err: any) {
      throw new Error(err.message || 'فشل إصدار الشهادة');
    }
  }, []);

  return {
    opportunities,
    applications,
    tasks,
    logs,
    certificates,
    loading,
    error,
    refreshData: fetchAllVolunteerData,
    createOpportunity,
    closeOpportunity,
    approveApplication,
    rejectApplication,
    assignTask,
    logHours,
    issueCertificate,
  };
}
