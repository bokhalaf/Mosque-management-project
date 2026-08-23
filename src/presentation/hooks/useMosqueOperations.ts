'use client';

// ==============================
// Hook — useMosqueOperations
// جلب سجل عمليات ونشاطات المساجد الحية من السيرفر مع الفلترة والباجنيشن
// ==============================

import { useState, useEffect, useCallback, useMemo } from 'react';
import { MosqueOperation, MosqueOperationModule, MosqueOperationsStats } from '../../domain/entities/MosqueOperation';

const BASE_URL = 'https://mms-backend-rose.vercel.app/api';

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

  const isSuperAdmin = useMemo(() => {
    if (typeof window === 'undefined') return false;
    try {
      const rawUser = JSON.parse(localStorage.getItem('auth_user') || '{}');
      const userRole = localStorage.getItem('user_role') || rawUser.role || rawUser.user_type || '';
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
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : '';
      const params = new URLSearchParams();

      if (page > 1) params.append('page', String(page));
      if (perPage !== 15) params.append('per_page', String(perPage));
      if (selectedModule && selectedModule !== 'all') {
        params.append('module', selectedModule);
      }
      if (dateFrom && dateFrom.trim()) {
        params.append('date_from', dateFrom.trim());
      }
      if (dateTo && dateTo.trim()) {
        params.append('date_to', dateTo.trim());
      }

      const queryString = params.toString() ? `?${params.toString()}` : '';
      const endpoint = isSuperAdmin
        ? `${BASE_URL}/admin/mosque-operations${queryString}`
        : `${BASE_URL}/dashboard/mosque-manager/mosque-operations${queryString}`;

      const res = await fetch(endpoint, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      const json = await res.json().catch(() => null);

      if (res.ok && json) {
        let rawItems: any[] = [];
        if (Array.isArray(json)) {
          rawItems = json;
        } else if (Array.isArray(json.data)) {
          rawItems = json.data;
        } else if (Array.isArray(json.data?.data)) {
          rawItems = json.data.data;
        } else if (Array.isArray(json.items)) {
          rawItems = json.items;
        } else if (Array.isArray(json.operations)) {
          rawItems = json.operations;
        }

        const formatted: MosqueOperation[] = rawItems.map((item: any, idx: number) => ({
          id: item.id || `op-${idx + 1}`,
          module: (item.module || item.type || 'general') as MosqueOperationModule,
          action: item.action || item.event || item.operation || 'تحديث سجل',
          title: item.title || item.name || item.description || 'عملية إدارية',
          description: item.description || item.note || item.notes || '',
          mosque_id: item.mosque_id || item.mosque?.id,
          mosque_name: item.mosque_name || item.mosque?.name || 'جامع المنطقة',
          user_name: item.user_name || item.user?.name || item.changed_by || 'مدير النظام',
          user_role: item.user_role || item.role || '',
          old_status: item.old_status,
          new_status: item.new_status,
          amount: item.amount ? Number(item.amount) : undefined,
          currency: item.currency || 'SYP',
          created_at: item.created_at || item.changed_at || item.date || new Date().toISOString(),
        }));

        setOperations(formatted);

        // Pagination extraction
        const total = json.pagination?.total || json.data?.total || json.total || formatted.length;
        const last = json.pagination?.last_page || json.data?.last_page || json.last_page || 1;
        setTotalCount(total);
        setLastPage(Math.max(1, last));

        // Compute stats
        const statsObj: MosqueOperationsStats = {
          total,
          complaints_count: formatted.filter(o => o.module === 'complaints').length,
          maintenance_count: formatted.filter(o => o.module === 'maintenance').length,
          donations_count: formatted.filter(o => o.module === 'donations').length,
          sermons_count: formatted.filter(o => o.module === 'sermons').length,
          mosques_count: formatted.filter(o => o.module === 'mosques').length,
        };
        setStats(statsObj);
      } else {
        throw new Error(json?.message || 'فشل في استرداد سجل عمليات المساجد من السيرفر');
      }
    } catch (err: any) {
      console.warn('Failed to load mosque operations:', err);
      setError(err.message || 'حدث خطأ أثناء تحميل سجل العمليات.');
    } finally {
      setLoading(false);
    }
  }, [isSuperAdmin, page, perPage, selectedModule, dateFrom, dateTo]);

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
