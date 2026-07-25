import { useState, useEffect, useMemo, useCallback } from "react";
import { Donation, Campaign, FinancialStats, AddCashDonationPayload } from "../../domain/entities/Donation";
import { DonationRepositoryImpl } from "../../data/repositories/DonationRepositoryImpl";
import { GetDonationsUseCase } from "../../domain/usecases/GetDonationsUseCase";
import { GetCampaignsUseCase } from "../../domain/usecases/GetCampaignsUseCase";
import { GetDonationStatsUseCase } from "../../domain/usecases/GetDonationStatsUseCase";
import { AddCashDonationUseCase } from "../../domain/usecases/AddCashDonationUseCase";
import { GetDonationByReferenceUseCase } from "../../domain/usecases/GetDonationByReferenceUseCase";
import { DownloadReceiptUseCase } from "../../domain/usecases/DownloadReceiptUseCase";
import { GetDailySummaryUseCase } from "../../domain/usecases/GetDailySummaryUseCase";

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

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      if (search !== debouncedSearch) setPage(1);
    }, 500);
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

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [donationsRes, c, s, ds] = await Promise.all([
          getDonationsUC.execute(page, 10, debouncedSearch, filter, statusFilter),
          getCampaignsUC.execute(),
          getStatsUC.execute(),
          getDailySummaryUC.execute(),
        ]);
        setDonations(donationsRes.data);
        setPagination(donationsRes.pagination);
        setCampaigns(c);
        setStats(s);
        setDailySummary(ds);
      } catch (error) {
        console.error("Failed to fetch donations data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [getDonationsUC, getCampaignsUC, getStatsUC, getDailySummaryUC, page, debouncedSearch, filter, statusFilter]);

  const addCashDonation = useCallback(async (payload: AddCashDonationPayload) => {
    return await addCashDonationUC.execute(payload);
  }, [addCashDonationUC]);

  const getDonationByReference = useCallback(async (reference: string) => {
    return await getDonationByReferenceUC.execute(reference);
  }, [getDonationByReferenceUC]);

  const downloadReceipt = useCallback(async (reference: string) => {
    return await downloadReceiptUC.execute(reference);
  }, [downloadReceiptUC]);

  return { 
    donations, 
    campaigns, 
    stats, 
    dailySummary,
    loading, 
    pagination,
    page,
    setPage,
    search,
    setSearch,
    filter,
    setFilter,
    statusFilter,
    setStatusFilter,
    addCashDonation,
    getDonationByReference,
    downloadReceipt
  };
}
