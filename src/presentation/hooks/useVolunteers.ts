'use client';

// ==============================
// Presentation Hook — useVolunteers
// مع مراقب API حقيقي وباجنيشن السيرفر وفصل المتطوعين المعتمدين عن الطلبات
// ==============================

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  VolunteerOpportunity,
  VolunteerApplication,
  VolunteerTask,
  VolunteerLog,
  VolunteerCertificate,
  CreateOpportunityPayload,
  AssignTaskPayload,
  LogHoursPayload,
  VolunteerPaginationState,
  VolunteerStats,
} from "../../domain/entities/Volunteer";
import { VolunteerRepositoryImpl } from "../../data/repositories/VolunteerRepositoryImpl";
import {
  GetVolunteerOpportunitiesUseCase,
  CreateVolunteerOpportunityUseCase,
  UpdateVolunteerOpportunityUseCase,
  CloseOpportunityUseCase,
  GetOpportunityApplicationsUseCase,
  ApproveApplicationUseCase,
  RejectApplicationUseCase,
  GetVolunteerTasksUseCase,
  AssignVolunteerTaskUseCase,
  LogVolunteerHoursUseCase,
  GetVolunteerLogsUseCase,
  IssueCertificateUseCase,
  GetCertificatesUseCase,
} from "../../domain/usecases/volunteers";

export interface VolunteerDebugLog {
  action: string;
  url: string;
  method: string;
  status: number | string;
  response: any;
  time: string;
  duration: string;
}

let fetchInterceptorInstalled = false;
export const globalDebugListeners: Array<(log: VolunteerDebugLog) => void> = [];

export function installFetchInterceptor() {
  if (fetchInterceptorInstalled || typeof window === 'undefined') return;
  fetchInterceptorInstalled = true;

  const originalFetch = window.fetch.bind(window);
  window.fetch = async function interceptedFetch(input: RequestInfo | URL, init?: RequestInit) {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.href : (input as Request).url;

    if (!url.includes('mms-backend-rose.vercel.app/api/volunteer')) {
      return originalFetch(input, init);
    }

    const method = init?.method || (input instanceof Request ? input.method : 'GET');
    const startTime = Date.now();
    let status: number | string = '...';
    let responseData: any = null;

    try {
      const res = await originalFetch(input, init);
      status = res.status;
      const duration = `${Date.now() - startTime}ms`;

      try {
        const cloned = res.clone();
        const json = await cloned.json();
        if (json?.data && Array.isArray(json.data)) {
          responseData = { status: json.status, count: json.data.length, sample: json.data[0] || null };
        } else {
          responseData = json;
        }
      } catch {
        responseData = { raw: 'binary/non-json response' };
      }

      const pathPart = url.replace('https://mms-backend-rose.vercel.app/api', '');
      const log: VolunteerDebugLog = {
        action: `${method} ${pathPart}`,
        url,
        method,
        status,
        response: responseData,
        time: new Date().toLocaleTimeString('ar-SA'),
        duration,
      };
      globalDebugListeners.forEach(fn => fn(log));
      return res;
    } catch (err: any) {
      const duration = `${Date.now() - startTime}ms`;
      const pathPart = url.replace('https://mms-backend-rose.vercel.app/api', '');
      const log: VolunteerDebugLog = {
        action: `${method} ${pathPart}`,
        url,
        method,
        status: 'ERR',
        response: { error: err.message },
        time: new Date().toLocaleTimeString('ar-SA'),
        duration,
      };
      globalDebugListeners.forEach(fn => fn(log));
      throw err;
    }
  };
}

// Call immediately at module load time
if (typeof window !== 'undefined') {
  installFetchInterceptor();
}

export type VolunteerTabType = 'opportunities' | 'applications' | 'approved_volunteers' | 'tasks' | 'logs' | 'certificates';

export function useVolunteers() {
  const [opportunities, setOpportunities] = useState<VolunteerOpportunity[]>([]);
  const [applications, setApplications] = useState<VolunteerApplication[]>([]);
  const [tasks, setTasks] = useState<VolunteerTask[]>([]);
  const [logs, setLogs] = useState<VolunteerLog[]>([]);
  const [certificates, setCertificates] = useState<VolunteerCertificate[]>([]);
  const [stats, setStats] = useState<VolunteerStats>({
    total_opportunities: 0,
    active_opportunities: 0,
    pending_applications: 0,
    approved_volunteers: 0,
    active_tasks: 0,
    total_hours: 0,
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination for opportunities
  const [page, setPage] = useState<number>(1);
  const [pagination, setPagination] = useState<VolunteerPaginationState>({
    currentPage: 1,
    lastPage: 1,
    total: 0,
    perPage: 6,
  });

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeTab, setActiveTab] = useState<VolunteerTabType>('opportunities');

  const [showDebugTerminal, setShowDebugTerminal] = useState<boolean>(false);
  const [debugLogs, setDebugLogs] = useState<VolunteerDebugLog[]>([]);

  const listenerRef = useRef<((log: VolunteerDebugLog) => void) | null>(null);

  useEffect(() => {
    installFetchInterceptor();

    const listener = (log: VolunteerDebugLog) => {
      // In opportunities main page: Only log opportunities list & stats endpoints!
      const path = log.url.replace('https://mms-backend-rose.vercel.app/api', '');
      const isSubResource = path.includes('/tasks') || path.includes('/applications') || path.includes('/logs') || path.includes('/certificates');
      if (isSubResource) return; // Do not log sub-calls like /150/tasks

      setDebugLogs(prev => [log, ...prev.slice(0, 29)]);
    };
    listenerRef.current = listener;
    globalDebugListeners.push(listener);

    return () => {
      const idx = globalDebugListeners.indexOf(listener);
      if (idx !== -1) globalDebugListeners.splice(idx, 1);
    };
  }, []);

  const clearDebugLogs = useCallback(() => setDebugLogs([]), []);

  const repository = useMemo(() => new VolunteerRepositoryImpl(), []);

  const getOpportunitiesUC = useMemo(() => new GetVolunteerOpportunitiesUseCase(repository), [repository]);
  const createOpportunityUC = useMemo(() => new CreateVolunteerOpportunityUseCase(repository), [repository]);
  const updateOpportunityUC = useMemo(() => new UpdateVolunteerOpportunityUseCase(repository), [repository]);
  const closeOpportunityUC = useMemo(() => new CloseOpportunityUseCase(repository), [repository]);
  const getApplicationsUC = useMemo(() => new GetOpportunityApplicationsUseCase(repository), [repository]);
  const approveApplicationUC = useMemo(() => new ApproveApplicationUseCase(repository), [repository]);
  const rejectApplicationUC = useMemo(() => new RejectApplicationUseCase(repository), [repository]);
  const getTasksUC = useMemo(() => new GetVolunteerTasksUseCase(repository), [repository]);
  const assignTaskUC = useMemo(() => new AssignVolunteerTaskUseCase(repository), [repository]);
  const logHoursUC = useMemo(() => new LogVolunteerHoursUseCase(repository), [repository]);
  const getLogsUC = useMemo(() => new GetVolunteerLogsUseCase(repository), [repository]);
  const issueCertificateUC = useMemo(() => new IssueCertificateUseCase(repository), [repository]);
  const getCertificatesUC = useMemo(() => new GetCertificatesUseCase(repository), [repository]);

  const fetchAllVolunteerData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [paginatedOpps, apps, tsk, lg, cert, liveStats] = await Promise.all([
        repository.getManagerOpportunitiesPaginated(page, 6),
        getApplicationsUC.execute(),
        getTasksUC.execute(),
        getLogsUC.execute(),
        getCertificatesUC.execute(),
        repository.getStats(),
      ]);

      setOpportunities(paginatedOpps.data);
      setPagination(paginatedOpps.pagination);
      setApplications(apps);
      setTasks(tsk);
      setLogs(lg);
      setCertificates(cert);
      setStats(liveStats);
    } catch (err: any) {
      setError(err.message || 'تعذر تحميل بيانات إدارة المتطوعين من السيرفر');
    } finally {
      setLoading(false);
    }
  }, [page, repository, getApplicationsUC, getTasksUC, getLogsUC, getCertificatesUC]);

  useEffect(() => {
    fetchAllVolunteerData();
  }, [fetchAllVolunteerData]);

  const createOpportunity = useCallback(async (payload: CreateOpportunityPayload) => {
    const newOpp = await createOpportunityUC.execute(payload);
    await fetchAllVolunteerData();
    return newOpp;
  }, [createOpportunityUC, fetchAllVolunteerData]);

  const updateOpportunity = useCallback(async (id: number | string, payload: Partial<CreateOpportunityPayload>) => {
    const updated = await updateOpportunityUC.execute(id, payload);
    await fetchAllVolunteerData();
    return updated;
  }, [updateOpportunityUC, fetchAllVolunteerData]);

  const closeOpportunity = useCallback(async (id: number | string) => {
    await closeOpportunityUC.execute(id);
    setOpportunities(prev =>
      prev.map(o => String(o.id) === String(id) ? { ...o, status: 'closed' } : o)
    );
  }, [closeOpportunityUC]);

  const approveApplication = useCallback(async (id: number | string) => {
    await approveApplicationUC.execute(id);
    setApplications(prev =>
      prev.map(a => String(a.id) === String(id) ? { ...a, status: 'approved' } : a)
    );
  }, [approveApplicationUC]);

  const rejectApplication = useCallback(async (id: number | string) => {
    await rejectApplicationUC.execute(id);
    setApplications(prev =>
      prev.map(a => String(a.id) === String(id) ? { ...a, status: 'rejected' } : a)
    );
  }, [rejectApplicationUC]);

  const assignTask = useCallback(async (payload: AssignTaskPayload) => {
    const newTask = await assignTaskUC.execute(payload);
    setTasks(prev => [newTask, ...prev]);
    return newTask;
  }, [assignTaskUC]);

  const logHours = useCallback(async (payload: LogHoursPayload) => {
    const newLog = await logHoursUC.execute(payload);
    setLogs(prev => [newLog, ...prev]);
    return newLog;
  }, [logHoursUC]);

  const issueCertificate = useCallback(async (volunteerId: number | string, opportunityId: number | string) => {
    const cert = await issueCertificateUC.execute(volunteerId, opportunityId);
    setCertificates(prev => [cert, ...prev]);
    return cert;
  }, [issueCertificateUC]);

  return {
    opportunities,
    applications,
    tasks,
    logs,
    certificates,
    stats,
    loading,
    error,
    page,
    setPage,
    pagination,
    searchQuery,
    setSearchQuery,
    activeTab,
    setActiveTab,
    fetchAllVolunteerData,
    createOpportunity,
    updateOpportunity,
    closeOpportunity,
    approveApplication,
    rejectApplication,
    assignTask,
    logHours,
    issueCertificate,
    showDebugTerminal,
    setShowDebugTerminal,
    debugLogs,
    clearDebugLogs,
  };
}
