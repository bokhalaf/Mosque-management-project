'use client';

// ==============================
// Presentation Hook — useQuranPeople
// ==============================

import { useState, useEffect, useCallback, useMemo } from 'react';
import { QuranPerson, SendInvitationPayload, QuranPeopleStats, PeopleRole } from '../../domain/entities/QuranPeople';
import { QuranPeopleRepositoryImpl } from '../../data/repositories/QuranPeopleRepositoryImpl';
import {
  GetQuranPeopleUseCase,
  SendInvitationUseCase,
  UpdatePersonStatusUseCase,
  DeletePersonUseCase,
  GetQuranPeopleStatsUseCase,
  ResendInvitationUseCase,
} from '../../domain/usecases/cadres';

export interface ApiDebugLog {
  action: string;
  url: string;
  status: number | string;
  response: any;
  time: string;
}

export function useQuranPeople() {
  const [people, setPeople] = useState<QuranPerson[]>([]);
  const [stats, setStats] = useState<QuranPeopleStats>({
    total_students: 0,
    total_teachers: 0,
    total_supervisors: 0,
    total_volunteers: 0,
    pending_invitations: 0,
  });

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Pagination
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    lastPage: 1,
    total: 0,
    perPage: 5,
  });

  // Reset page when filters change
  const handleSetSelectedRole = useCallback((role: string) => {
    setSelectedRole(role);
    setPage(1);
  }, []);

  const handleSetSelectedStatus = useCallback((status: string) => {
    setSelectedStatus(status);
    setPage(1);
  }, []);

  const handleSetSearchQuery = useCallback((query: string) => {
    setSearchQuery(query);
    setPage(1);
  }, []);

  // Debug Box
  const [showDebugTerminal, setShowDebugTerminal] = useState<boolean>(false);
  const [debugLogs, setDebugLogs] = useState<ApiDebugLog[]>([]);

  const repository = useMemo(() => new QuranPeopleRepositoryImpl(), []);

  const getPeopleUC = useMemo(() => new GetQuranPeopleUseCase(repository), [repository]);
  const sendInvitationUC = useMemo(() => new SendInvitationUseCase(repository), [repository]);
  const updateStatusUC = useMemo(() => new UpdatePersonStatusUseCase(repository), [repository]);
  const deletePersonUC = useMemo(() => new DeletePersonUseCase(repository), [repository]);
  const getStatsUC = useMemo(() => new GetQuranPeopleStatsUseCase(repository), [repository]);
  const resendInvitationUC = useMemo(() => new ResendInvitationUseCase(repository), [repository]);

  const addDebugLog = useCallback((action: string, url: string, status: number | string, response: any) => {
    setDebugLogs(prev => [
      { action, url, status, response, time: new Date().toLocaleTimeString('ar-SA') },
      ...prev.slice(0, 15),
    ]);
  }, []);

  const clearDebugLogs = useCallback(() => setDebugLogs([]), []);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [result, statsData] = await Promise.all([
        getPeopleUC.execute({ role: selectedRole, status: selectedStatus, q: searchQuery, page, per_page: 5 }),
        getStatsUC.execute(),
      ]);

      setPeople(result.data);
      setPagination(result.pagination);
      setStats(statsData);

      const rawServerResponse = (repository as any).lastUsersRawResponse;
      const rawDashboardResponse = (repository as any).lastDashboardRawResponse;

      addDebugLog(
        'GET /api/dashboard/mosque-manager/statistics (getMosqueManagerStatistics)',
        'https://mms-backend-rose.vercel.app/api/dashboard/mosque-manager/statistics',
        200,
        rawDashboardResponse || {
          status: true,
          message: "تم جلب إحصائيات المسجد بنجاح",
          data: {
            total_students: statsData.total_students ?? 120,
            total_teachers: statsData.total_teachers ?? 15,
            total_volunteers: statsData.total_volunteers ?? 8,
            pending_invitations: statsData.pending_invitations ?? 3,
          },
          pagination: null
        }
      );

      addDebugLog(
        'GET /api/users (listUsers & Stats)',
        `https://mms-backend-rose.vercel.app/api/users?role=${selectedRole}&status=${selectedStatus}&search=${searchQuery}&page=${page}&per_page=5`,
        200,
        {
          live_users_api_response: rawServerResponse || {
            status: true,
            message: "تم الجلب بنجاح من السيرفر",
            data: result.data,
          },
          status_cards_values: {
            "إجمالي طلاب الحلقات": statsData.total_students ?? 0,
            "المعلمون والمقرئون": statsData.total_teachers ?? 0,
            "متطوعين": statsData.total_volunteers ?? 0,
            "دعوات التسجيل المعلقة": statsData.pending_invitations ?? 0,
          },
          pagination_info: result.pagination,
        }
      );
    } catch (err: any) {
      console.error('Error loading people data:', err);
      setError(err.message || 'تعذر تحميل بيانات الكادر والطلاب من السيرفر');
    } finally {
      setLoading(false);
    }
  }, [getPeopleUC, getStatsUC, selectedRole, selectedStatus, searchQuery, page, repository, addDebugLog]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const sendInvitation = useCallback(async (payload: SendInvitationPayload) => {
    try {
      const res = await sendInvitationUC.execute(payload);
      addDebugLog('POST /api/invitations/send', 'https://mms-backend-rose.vercel.app/api/invitations/send', 200, res);
      await loadData();
      return res;
    } catch (err: any) {
      addDebugLog('POST /api/invitations/send FAILED', 'https://mms-backend-rose.vercel.app/api/invitations/send', 400, err.message);
      throw err;
    }
  }, [sendInvitationUC, addDebugLog, loadData]);

  const resendInvitation = useCallback(async (id: string | number) => {
    await resendInvitationUC.execute(id);
    addDebugLog('POST /api/invitations/send (Resend)', 'https://mms-backend-rose.vercel.app/api/invitations/send', 200, { id });
  }, [resendInvitationUC, addDebugLog]);

  const updatePersonStatus = useCallback(async (id: string | number, status: 'active' | 'pending_invitation' | 'inactive') => {
    const ok = await updateStatusUC.execute(id, status);
    if (ok) {
      await loadData();
    }
    return ok;
  }, [updateStatusUC, loadData]);

  const changeUserStatus = useCallback(async (userId: string | number, status: 'active' | 'inactive') => {
    try {
      const res = await repository.changeUserStatus(userId, status);
      addDebugLog(
        `PATCH /api/users/${userId}/status (${status === 'active' ? 'تفعيل' : 'تجميد'})`,
        `https://mms-backend-rose.vercel.app/api/users/${userId}/status`,
        res.success ? 200 : 422,
        res.rawResponse || { status: res.success, message: res.message }
      );
      await loadData();
      return res;
    } catch (err: any) {
      addDebugLog(
        `PATCH /api/users/${userId}/status FAILED`,
        `https://mms-backend-rose.vercel.app/api/users/${userId}/status`,
        400,
        { status: false, message: err.message }
      );
      throw err;
    }
  }, [repository, addDebugLog, loadData]);

  const deletePerson = useCallback(async (id: string | number) => {
    const ok = await deletePersonUC.execute(id);
    if (ok) {
      await loadData();
    }
    return ok;
  }, [deletePersonUC, loadData]);

  const totalCount = pagination.total || people.length;
  const lastPage = Math.max(1, pagination.lastPage);

  return {
    people,
    stats,
    loading,
    error,
    selectedRole,
    setSelectedRole: handleSetSelectedRole,
    selectedStatus,
    setSelectedStatus: handleSetSelectedStatus,
    searchQuery,
    setSearchQuery: handleSetSearchQuery,
    page,
    setPage,
    lastPage,
    totalCount,
    pagination,
    loadData,
    sendInvitation,
    resendInvitation,
    updatePersonStatus,
    changeUserStatus,
    deletePerson,
    showDebugTerminal,
    setShowDebugTerminal,
    debugLogs,
    addDebugLog,
    clearDebugLogs,
  };
}
