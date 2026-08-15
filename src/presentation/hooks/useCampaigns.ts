import { useState, useEffect, useMemo, useCallback } from "react";
import { Campaign, AddCampaignPayload, UpdateCampaignPayload } from "../../domain/entities/Donation";
import { DonationRepositoryImpl } from "../../data/repositories/DonationRepositoryImpl";
import { GetCampaignsUseCase } from "../../domain/usecases/GetCampaignsUseCase";
import { GetCampaignStatsUseCase } from "../../domain/usecases/GetCampaignStatsUseCase";
import { GetCampaignByIdUseCase } from "../../domain/usecases/GetCampaignByIdUseCase";
import { AddCampaignUseCase } from "../../domain/usecases/AddCampaignUseCase";
import { UpdateCampaignUseCase } from "../../domain/usecases/UpdateCampaignUseCase";
import { DeleteCampaignUseCase } from "../../domain/usecases/DeleteCampaignUseCase";
import { useToast } from "../../app/components/ui/Toast";

export interface ApiDebugLog {
  action: string;
  url: string;
  status: number | string;
  response: any;
  time: string;
}

const BASE_URL = "https://mms-backend-rose.vercel.app/api";

export function useCampaigns() {
  const { showToast } = useToast();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [campaignStats, setCampaignStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Pagination state — 4 items per page
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<{
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    has_more_pages?: boolean;
  }>({
    current_page: 1,
    last_page: 1,
    per_page: 4,
    total: 0,
  });

  // Filters state
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");

  // Modal states
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
  const [deletingCampaign, setDeletingCampaign] = useState<Campaign | null>(null);

  // Debug Logger state
  const [showDebugTerminal, setShowDebugTerminal] = useState(false);
  const [debugLogs, setDebugLogs] = useState<ApiDebugLog[]>([]);

  const addDebugLog = useCallback((action: string, url: string, status: number | string, response: any) => {
    setDebugLogs(prev => [
      { action, url, status, response, time: new Date().toLocaleTimeString('ar-SA') },
      ...prev.slice(0, 15),
    ]);
  }, []);

  const clearDebugLogs = useCallback(() => setDebugLogs([]), []);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1); // Reset page on search change
    }, 400);
    return () => clearTimeout(handler);
  }, [search]);

  const repository = useMemo(() => new DonationRepositoryImpl(), []);
  
  const getCampaignsUC = useMemo(() => new GetCampaignsUseCase(repository), [repository]);
  const getCampaignStatsUC = useMemo(() => new GetCampaignStatsUseCase(repository), [repository]);
  const getCampaignByIdUC = useMemo(() => new GetCampaignByIdUseCase(repository), [repository]);
  const addCampaignUC = useMemo(() => new AddCampaignUseCase(repository), [repository]);
  const updateCampaignUC = useMemo(() => new UpdateCampaignUseCase(repository), [repository]);
  const deleteCampaignUC = useMemo(() => new DeleteCampaignUseCase(repository), [repository]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [paginatedRes, stats] = await Promise.all([
        getCampaignsUC.execute(page, 4, debouncedSearch, statusFilter, priorityFilter),
        getCampaignStatsUC.execute(),
      ]);

      const targetUrl = `${BASE_URL}/campaigns?page=${page}&per_page=4${debouncedSearch ? `&search=${encodeURIComponent(debouncedSearch)}` : ''}${statusFilter ? `&status=${encodeURIComponent(statusFilter)}` : ''}${priorityFilter ? `&priority=${encodeURIComponent(priorityFilter)}` : ''}`;
      addDebugLog('GET /api/campaigns (listAllCampaigns)', targetUrl, 200, paginatedRes._rawResponse || paginatedRes);
      addDebugLog('GET /api/mosques/campaigns/stats', `${BASE_URL}/mosques/1/campaigns/stats`, 200, stats);

      setCampaigns(paginatedRes.data || []);
      if (paginatedRes.pagination) {
        setPagination(paginatedRes.pagination);
      }
      setCampaignStats(stats);
    } catch (error: any) {
      console.error("Failed to fetch campaigns data:", error);
    } finally {
      setLoading(false);
    }
  }, [getCampaignsUC, getCampaignStatsUC, page, debouncedSearch, statusFilter, priorityFilter, addDebugLog]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const getCampaignById = useCallback(async (id: string | number) => {
    const res = await getCampaignByIdUC.execute(id);
    addDebugLog(`GET /api/campaigns/${id}`, `${BASE_URL}/campaigns/${id}`, 200, res._rawResponse || res);
    return res;
  }, [getCampaignByIdUC, addDebugLog]);

  const addCampaign = useCallback(async (payload: AddCampaignPayload) => {
    const res = await addCampaignUC.execute(payload);
    addDebugLog('POST /api/campaigns', `${BASE_URL}/campaigns`, 201, res);
    showToast("تم إنشاء الحملة بنجاح", "success");
    await fetchData();
    return res;
  }, [addCampaignUC, addDebugLog, fetchData, showToast]);

  const updateCampaign = useCallback(async (id: string | number, payload: UpdateCampaignPayload) => {
    const res = await updateCampaignUC.execute(id, payload);
    addDebugLog(`POST /api/campaigns/${id} (PUT)`, `${BASE_URL}/campaigns/${id}`, 200, res._rawResponse || res);
    showToast("تم تعديل الحملة بنجاح", "success");
    await fetchData();
    return res;
  }, [updateCampaignUC, addDebugLog, fetchData, showToast]);

  const deleteCampaign = useCallback(async (id: string | number) => {
    const res = await deleteCampaignUC.execute(id);
    addDebugLog(`DELETE /api/campaigns/${id}`, `${BASE_URL}/campaigns/${id}`, 200, { status: true, message: "Deleted" });
    showToast("تم حذف الحملة بنجاح", "success");
    await fetchData();
    return res;
  }, [deleteCampaignUC, addDebugLog, fetchData, showToast]);

  const resetFilters = useCallback(() => {
    setSearch("");
    setStatusFilter("");
    setPriorityFilter("");
    setPage(1);
  }, []);

  const hasActiveFilters = Boolean(search || statusFilter || priorityFilter);

  return {
    campaigns,
    campaignStats,
    loading,
    page,
    setPage,
    pagination,
    search,
    setSearch,
    statusFilter,
    setStatusFilter: (s: string) => { setStatusFilter(s); setPage(1); },
    priorityFilter,
    setPriorityFilter: (p: string) => { setPriorityFilter(p); setPage(1); },
    hasActiveFilters,
    resetFilters,
    refresh: fetchData,
    getCampaignById,
    addCampaign,
    updateCampaign,
    deleteCampaign,
    // Modals
    editingCampaign,
    setEditingCampaign,
    deletingCampaign,
    setDeletingCampaign,
    // Debug Inspector
    showDebugTerminal,
    setShowDebugTerminal,
    debugLogs,
    addDebugLog,
    clearDebugLogs,
  };
}
