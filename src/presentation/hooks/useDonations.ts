import { useState, useEffect, useMemo, useCallback } from "react";
import { Donation, Campaign, FinancialStats, AddCashDonationPayload } from "../../domain/entities/Donation";
import { DonationRepositoryImpl } from "../../data/repositories/DonationRepositoryImpl";
import { GetDonationsUseCase } from "../../domain/usecases/donations/GetDonationsUseCase";
import { GetCampaignsUseCase } from "../../domain/usecases/donations/GetCampaignsUseCase";
import { GetDonationStatsUseCase } from "../../domain/usecases/donations/GetDonationStatsUseCase";
import { AddCashDonationUseCase } from "../../domain/usecases/donations/AddCashDonationUseCase";
import { GetDonationByReferenceUseCase } from "../../domain/usecases/donations/GetDonationByReferenceUseCase";
import { DownloadReceiptUseCase } from "../../domain/usecases/donations/DownloadReceiptUseCase";
import { GetDailySummaryUseCase } from "../../domain/usecases/donations/GetDailySummaryUseCase";

export interface ApiDebugLog {
  action: string;
  url: string;
  status: number | string;
  response: any;
  time: string;
}

export function useDonations() {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [stats, setStats] = useState<FinancialStats | null>(null);
  const [dailySummary, setDailySummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [pagination, setPagination] = useState<any>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filter, setFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [printingReceiptId, setPrintingReceiptId] = useState<string | number | null>(null);

  // Debug Terminal Logger state
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
      if (search !== debouncedSearch) setPage(1);
    }, 400);
    return () => clearTimeout(handler);
  }, [search, debouncedSearch]);

  const repository = useMemo(() => new DonationRepositoryImpl(), []);

  const getDonationsUC = useMemo(() => new GetDonationsUseCase(repository), [repository]);
  const getCampaignsUC = useMemo(() => new GetCampaignsUseCase(repository), [repository]);
  const getStatsUC = useMemo(() => new GetDonationStatsUseCase(repository), [repository]);
  const addCashDonationUC = useMemo(() => new AddCashDonationUseCase(repository), [repository]);
  const getDonationByReferenceUC = useMemo(() => new GetDonationByReferenceUseCase(repository), [repository]);
  const downloadReceiptUC = useMemo(() => new DownloadReceiptUseCase(repository), [repository]);
  const getDailySummaryUC = useMemo(() => new GetDailySummaryUseCase(repository), [repository]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [donationsRes, c, s, ds] = await Promise.all([
        getDonationsUC.execute(page, 5, debouncedSearch, filter, statusFilter),
        getCampaignsUC.execute(),
        getStatsUC.execute(),
        getDailySummaryUC.execute(),
      ]);

      const baseUrl = "https://mms-backend-rose.vercel.app/api";

      addDebugLog(
        'GET /api/mosques/donations',
        `${baseUrl}/mosques/1/donations?page=${page}&per_page=5${debouncedSearch ? `&search=${encodeURIComponent(debouncedSearch)}` : ''}${filter ? `&type=${encodeURIComponent(filter)}` : ''}${statusFilter ? `&status=${encodeURIComponent(statusFilter)}` : ''}`,
        200,
        donationsRes._rawResponse || donationsRes
      );
      addDebugLog('GET /api/mosques/campaigns', `${baseUrl}/mosques/1/campaigns`, 200, c);
      addDebugLog('GET /api/mosques/donations/stats', `${baseUrl}/mosques/1/donations/stats`, 200, s);
      addDebugLog('GET /api/mosques/donations/summary', `${baseUrl}/mosques/1/donations/summary`, 200, ds);

      setDonations(donationsRes.data);
      setPagination(donationsRes.pagination);
      setCampaigns(c.data || (Array.isArray(c) ? c : []));
      setStats(s);
      setDailySummary(ds);
    } catch (error: any) {
      console.error("Failed to fetch donations data:", error);
    } finally {
      setLoading(false);
    }
  }, [getDonationsUC, getCampaignsUC, getStatsUC, getDailySummaryUC, page, debouncedSearch, filter, statusFilter, addDebugLog]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const addCashDonation = useCallback(async (payload: AddCashDonationPayload) => {
    const res = await addCashDonationUC.execute(payload);
    addDebugLog('POST /api/donations/admin/cash', 'https://mms-backend-rose.vercel.app/api/donations/admin/cash', 201, res);
    await fetchData();
    return res;
  }, [addCashDonationUC, addDebugLog, fetchData]);

  const getDonationByReference = useCallback(async (reference: string) => {
    const res = await getDonationByReferenceUC.execute(reference);
    addDebugLog(`GET /api/donations/${reference}`, `https://mms-backend-rose.vercel.app/api/donations/${reference}`, 200, res._rawResponse || res);
    return res;
  }, [getDonationByReferenceUC, addDebugLog]);

  const handlePrintReceipt = useCallback(async (referenceOrId: string | number) => {
    setPrintingReceiptId(referenceOrId);
    const targetUrl = `https://mms-backend-rose.vercel.app/api/donations/${referenceOrId}/receipt`;
    try {
      const receiptUrl = await downloadReceiptUC.execute(referenceOrId);
      addDebugLog(
        `GET /api/donations/${referenceOrId}/receipt`,
        targetUrl,
        200,
        { status: true, message: "Success", data: { receipt_url: receiptUrl } }
      );
      if (receiptUrl) {
        window.open(receiptUrl, '_blank');
      }
    } catch (e: any) {
      console.error('Error downloading receipt:', e);
      addDebugLog(
        `GET /api/donations/${referenceOrId}/receipt`,
        targetUrl,
        500,
        { status: false, message: e.message || 'Failed to get receipt URL' }
      );
    } finally {
      setPrintingReceiptId(null);
    }
  }, [downloadReceiptUC, addDebugLog]);

  const resetFilters = useCallback(() => {
    setSearch("");
    setFilter("");
    setStatusFilter("");
    setPage(1);
  }, []);

  const hasActiveFilters = Boolean(search || filter || statusFilter);

  return {
    donations,
    campaigns,
    stats,
    dailySummary,
    pagination,
    page,
    setPage,
    search,
    setSearch,
    filter,
    setFilter,
    statusFilter,
    setStatusFilter,
    hasActiveFilters,
    resetFilters,
    loading,
    refresh: fetchData,
    addCashDonation,
    getDonationByReference,
    handlePrintReceipt,
    printingReceiptId,
    // Debug Inspector
    showDebugTerminal,
    setShowDebugTerminal,
    debugLogs,
    addDebugLog,
    clearDebugLogs,
  };
}
