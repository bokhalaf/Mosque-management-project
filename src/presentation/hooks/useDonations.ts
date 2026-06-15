import { useState, useEffect, useMemo, useCallback } from "react";
import { Donation, Campaign, FinancialStats, AddCashDonationPayload } from "../../domain/entities/Donation";
import { DonationRepositoryImpl } from "../../data/repositories/DonationRepositoryImpl";
import { GetDonationsUseCase } from "../../domain/usecases/GetDonationsUseCase";
import { GetCampaignsUseCase } from "../../domain/usecases/GetCampaignsUseCase";
import { GetDonationStatsUseCase } from "../../domain/usecases/GetDonationStatsUseCase";
import { AddCashDonationUseCase } from "../../domain/usecases/AddCashDonationUseCase";
import { GetDonationByReferenceUseCase } from "../../domain/usecases/GetDonationByReferenceUseCase";
import { DownloadReceiptUseCase } from "../../domain/usecases/DownloadReceiptUseCase";

export function useDonations() {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [stats, setStats] = useState<FinancialStats | null>(null);
  const [loading, setLoading] = useState(true);

  const repository = useMemo(() => new DonationRepositoryImpl(), []);
  
  const getDonationsUC = useMemo(() => new GetDonationsUseCase(repository), [repository]);
  const getCampaignsUC = useMemo(() => new GetCampaignsUseCase(repository), [repository]);
  const getStatsUC = useMemo(() => new GetDonationStatsUseCase(repository), [repository]);
  const addCashDonationUC = useMemo(() => new AddCashDonationUseCase(repository), [repository]);
  const getDonationByReferenceUC = useMemo(() => new GetDonationByReferenceUseCase(repository), [repository]);
  const downloadReceiptUC = useMemo(() => new DownloadReceiptUseCase(repository), [repository]);

  useEffect(() => {
    async function fetchData() {
      try {
        const [d, c, s] = await Promise.all([
          getDonationsUC.execute(),
          getCampaignsUC.execute(),
          getStatsUC.execute(),
        ]);
        setDonations(d);
        setCampaigns(c);
        setStats(s);
      } catch (error) {
        console.error("Failed to fetch donations data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [getDonationsUC, getCampaignsUC, getStatsUC]);

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
    loading,
    addCashDonation,
    getDonationByReference,
    downloadReceipt
  };
}
