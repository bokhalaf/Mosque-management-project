// ==============================
// Presentation — Hook
// useComplaints: يتولى جلب الإحصائيات وقائمة الشكاوى مع إدارة الفلاتر ومراقب السيرفر (Debug)
// ==============================

import { useState, useEffect, useCallback } from 'react';
import { ComplaintRepositoryImpl, ComplaintOperationDebugResponse } from '../../data/repositories/ComplaintRepositoryImpl';
import { ComplaintItem, ComplaintStats } from '../../domain/entities/Complaint';
import { GetComplaintStatsUseCase } from '../../domain/usecases/complaints/GetComplaintStatsUseCase';
import { GetAdminComplaintsUseCase } from '../../domain/usecases/complaints/GetAdminComplaintsUseCase';
import { SearchComplaintsUseCase } from '../../domain/usecases/complaints/SearchComplaintsUseCase';

const complaintRepo = new ComplaintRepositoryImpl();
const getStatsUseCase = new GetComplaintStatsUseCase(complaintRepo);
const getAdminComplaintsUseCase = new GetAdminComplaintsUseCase(complaintRepo);
const searchComplaintsUseCase = new SearchComplaintsUseCase(complaintRepo);

export interface ComplaintFilters {
  searchQuery: string;
  statusFilter: string;
  priorityFilter: string;
  typeFilter: string;
}

export function useComplaints() {
  const [filters, setFilters] = useState<ComplaintFilters>({
    searchQuery: '',
    statusFilter: 'all',
    priorityFilter: 'all',
    typeFilter: 'all',
  });

  const [stats, setStats] = useState<ComplaintStats>({
    total_complaints: 0,
    open_complaints: 0,
    urgent_complaints: 0,
    resolved_this_month: 0,
    avg_response_hours: 0,
  });

  const [complaints, setComplaints] = useState<ComplaintItem[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingComplaints, setLoadingComplaints] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Debug Box State
  const [debugData, setDebugData] = useState<ComplaintOperationDebugResponse | null>(null);
  const [copiedDebug, setCopiedDebug] = useState(false);

  const loadStats = useCallback(async () => {
    setLoadingStats(true);
    try {
      const data = await getStatsUseCase.execute();
      setStats({
        total_complaints: data?.total_complaints ?? 0,
        open_complaints: data?.open_complaints ?? 0,
        urgent_complaints: data?.urgent_complaints ?? 0,
        resolved_this_month: data?.resolved_this_month ?? 0,
        avg_response_hours: data?.avg_response_hours ?? 0,
      });
    } catch (err: any) {
      console.error('Error loading complaint stats:', err);
      setStats({
        total_complaints: 0,
        open_complaints: 0,
        urgent_complaints: 0,
        resolved_this_month: 0,
        avg_response_hours: 0,
      });
    } finally {
      setLoadingStats(false);
    }
  }, []);

  const loadComplaints = useCallback(async () => {
    setLoadingComplaints(true);
    setError(null);
    try {
      const params = {
        q: filters.searchQuery,
        status: filters.statusFilter,
        priority: filters.priorityFilter,
        complaint_type: filters.typeFilter,
      };

      const isSearchMode = Boolean(filters.searchQuery && filters.searchQuery.trim().length > 0);
      const paginatedResult = isSearchMode
        ? await searchComplaintsUseCase.execute(params)
        : await getAdminComplaintsUseCase.execute(params);

      setComplaints(paginatedResult.data || []);

      const resDebug = await complaintRepo.getAdminComplaintsWithDebug(params);
      setDebugData(resDebug.debug);
    } catch (err: any) {
      console.error('Error loading admin complaints:', err);
      setError(err.message || 'حدث خطأ أثناء جلب قائمة الشكاوى');
    } finally {
      setLoadingComplaints(false);
    }
  }, [filters]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadComplaints();
    }, 300);
    return () => clearTimeout(timer);
  }, [loadComplaints]);

  const refresh = useCallback(() => {
    loadStats();
    loadComplaints();
  }, [loadStats, loadComplaints]);

  const resetFilters = useCallback(() => {
    setFilters({ searchQuery: '', statusFilter: 'all', priorityFilter: 'all', typeFilter: 'all' });
  }, []);

  const setSearchQuery = (v: string) => setFilters(f => ({ ...f, searchQuery: v }));
  const setStatusFilter = (v: string) => setFilters(f => ({ ...f, statusFilter: v }));
  const setPriorityFilter = (v: string) => setFilters(f => ({ ...f, priorityFilter: v }));
  const setTypeFilter = (v: string) => setFilters(f => ({ ...f, typeFilter: v }));

  const copyDebugToClipboard = () => {
    if (debugData) {
      navigator.clipboard.writeText(JSON.stringify(debugData, null, 2));
      setCopiedDebug(true);
      setTimeout(() => setCopiedDebug(false), 2000);
    }
  };

  const closeDebugBox = () => {
    setDebugData(null);
  };

  const hasActiveFilters =
    filters.statusFilter !== 'all' ||
    filters.priorityFilter !== 'all' ||
    filters.typeFilter !== 'all' ||
    filters.searchQuery.trim() !== '';

  return {
    // Data
    stats,
    complaints,
    // Loading states
    loadingStats,
    loadingComplaints,
    error,
    // Filter state
    filters,
    hasActiveFilters,
    // Debug state & actions
    debugData,
    copiedDebug,
    copyDebugToClipboard,
    closeDebugBox,
    // Filter setters
    setSearchQuery,
    setStatusFilter,
    setPriorityFilter,
    setTypeFilter,
    resetFilters,
    // Actions
    refresh,
  };
}
