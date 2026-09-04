'use client';

// ==============================
// Hook — useMosqueOperations
// جلب سجل عمليات ونشاطات المساجد الحية من السيرفر مع الفلترة والباجنيشن
// ==============================

import { useState, useEffect, useCallback, useMemo } from 'react';
import { MosqueOperation, MosqueOperationsStats } from '../../domain/entities/MosqueOperation';
import { getAuthUser, getUserRole } from '../../data/auth/authStorage';
import { getMosqueOperationRepository } from '../../data/factories/repositoryFactory';
import { GetMosqueOperationsUseCase } from '../../domain/usecases/mosque-operations';

export function useMosqueOperations() {
  const [operations, setOperations] = useState<MosqueOperation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Pagination
  const [selectedModule, setSelectedModule] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const [perPage, setPerPage] = useState<number>(15);
  const [lastPage, setLastPage] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);

  const [stats, setStats] = useState<MosqueOperationsStats>({
    total: 0,
    complaints_count: 0,
    maintenance_count: 0,
    donations_count: 0,
    sermons_count: 0,
    mosques_count: 0,
  });

  const repository = useMemo(() => getMosqueOperationRepository(), []);
  const getMosqueOperationsUC = useMemo(() => new GetMosqueOperationsUseCase(repository), [repository]);

  const isSuperAdmin = useMemo(() => {
    if (typeof window === 'undefined') return false;
    try {
      const rawUser = getAuthUser() || {};
      const userRole = getUserRole() || rawUser.role || rawUser.user_type || '';
      const roles = Array.isArray(rawUser.roles) ? rawUser.roles : [];
      return (
        userRole === 'super_admin' ||
        userRole === 'admin' ||
        userRole === 'administrator' ||
        roles.includes('super_admin') ||
        roles.includes('admin') ||
        Boolean(rawUser.is_super_admin)
      );
    } catch {
      return false;
    }
  }, []);

  const fetchOperations = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await getMosqueOperationsUC.execute({
        isSuperAdmin,
        page,
        perPage,
        module: selectedModule,
        dateFrom,
        dateTo,
      });

      setOperations(result.operations);
      setTotalCount(result.totalCount);
      setLastPage(result.lastPage);
      setStats(result.stats);
    } catch (err: any) {
      console.warn('Failed to load mosque operations:', err);
      setError(err.message || 'حدث خطأ أثناء تحميل سجل العمليات.');
    } finally {
      setLoading(false);
    }
  }, [getMosqueOperationsUC, isSuperAdmin, page, perPage, selectedModule, dateFrom, dateTo]);

  useEffect(() => {
    fetchOperations();
  }, [fetchOperations]);

  // Client-side search filtering
  const filteredOperations = useMemo(() => {
    if (!searchQuery.trim()) return operations;
    const q = searchQuery.toLowerCase().trim();
    return operations.filter(
      (op) =>
        op.title.toLowerCase().includes(q) ||
        op.action.toLowerCase().includes(q) ||
        (op.mosque_name && op.mosque_name.toLowerCase().includes(q)) ||
        (op.user_name && op.user_name.toLowerCase().includes(q)) ||
        (op.description && op.description.toLowerCase().includes(q))
    );
  }, [operations, searchQuery]);

  return {
    operations: filteredOperations,
    loading,
    error,
    stats,
    page,
    setPage,
    perPage,
    setPerPage,
    lastPage,
    totalCount,
    selectedModule,
    setSelectedModule,
    searchQuery,
    setSearchQuery,
    dateFrom,
    setDateFrom,
    dateTo,
    setDateTo,
    refresh: fetchOperations,
    isSuperAdmin,
  };
}
