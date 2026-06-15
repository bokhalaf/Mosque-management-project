import { useState, useEffect, useMemo, useCallback } from "react";
import { Campaign, AddCampaignPayload } from "../../domain/entities/Donation";
import { DonationRepositoryImpl } from "../../data/repositories/DonationRepositoryImpl";
import { GetCampaignsUseCase } from "../../domain/usecases/GetCampaignsUseCase";
import { GetCampaignStatsUseCase } from "../../domain/usecases/GetCampaignStatsUseCase";
import { GetCampaignByIdUseCase } from "../../domain/usecases/GetCampaignByIdUseCase";
import { AddCampaignUseCase } from "../../domain/usecases/AddCampaignUseCase";

export function useCampaigns() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [campaignStats, setCampaignStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const repository = useMemo(() => new DonationRepositoryImpl(), []);
  
  const getCampaignsUC = useMemo(() => new GetCampaignsUseCase(repository), [repository]);
  const getCampaignStatsUC = useMemo(() => new GetCampaignStatsUseCase(repository), [repository]);
  const getCampaignByIdUC = useMemo(() => new GetCampaignByIdUseCase(repository), [repository]);
  const addCampaignUC = useMemo(() => new AddCampaignUseCase(repository), [repository]);

  useEffect(() => {
    async function fetchData() {
      try {
        const [cList, stats] = await Promise.all([
          getCampaignsUC.execute(),
          getCampaignStatsUC.execute(),
        ]);
        setCampaigns(cList);
        setCampaignStats(stats);
      } catch (error) {
        console.error("Failed to fetch campaigns data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [getCampaignsUC, getCampaignStatsUC]);

  const getCampaignById = useCallback(async (id: string) => {
    return await getCampaignByIdUC.execute(id);
  }, [getCampaignByIdUC]);

  const addCampaign = useCallback(async (payload: AddCampaignPayload) => {
    return await addCampaignUC.execute(payload);
  }, [addCampaignUC]);

  return {
    campaigns,
    campaignStats,
    loading,
    getCampaignById,
    addCampaign
  };
}
