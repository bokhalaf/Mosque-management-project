import { useState, useEffect, useCallback, useMemo } from "react";
import { Campaign, UpdateCampaignPayload } from "../../domain/entities/Donation";
import { DonationRepositoryImpl } from "../../data/repositories/DonationRepositoryImpl";
import { GetCampaignByIdUseCase } from "../../domain/usecases/GetCampaignByIdUseCase";
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

export function useCampaignDetails(campaignId: string | number) {
  const { showToast } = useToast();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modals
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Debug Inspector
  const [showDebugTerminal, setShowDebugTerminal] = useState(true);
  const [debugLogs, setDebugLogs] = useState<ApiDebugLog[]>([]);

  const addDebugLog = useCallback((action: string, url: string, status: number | string, response: any) => {
    setDebugLogs(prev => [
      { action, url, status, response, time: new Date().toLocaleTimeString('ar-SA') },
      ...prev.slice(0, 15),
    ]);
  }, []);

  const clearDebugLogs = useCallback(() => setDebugLogs([]), []);

  const repository = useMemo(() => new DonationRepositoryImpl(), []);
  const getCampaignByIdUC = useMemo(() => new GetCampaignByIdUseCase(repository), [repository]);
  const updateCampaignUC = useMemo(() => new UpdateCampaignUseCase(repository), [repository]);
  const deleteCampaignUC = useMemo(() => new DeleteCampaignUseCase(repository), [repository]);

  const fetchDetails = useCallback(async () => {
    if (!campaignId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getCampaignByIdUC.execute(campaignId);
      addDebugLog(
        `GET /api/campaigns/${campaignId}`,
        `${BASE_URL}/campaigns/${campaignId}`,
        200,
        data._rawResponse || data
      );
      setCampaign(data);
    } catch (err: any) {
      console.error("Error fetching campaign details:", err);
      setError(err.message || "تعذر جلب تفاصيل الحملة من السيرفر");
      addDebugLog(
        `GET /api/campaigns/${campaignId}`,
        `${BASE_URL}/campaigns/${campaignId}`,
        500,
        { status: false, message: err.message || "Error" }
      );
    } finally {
      setLoading(false);
    }
  }, [campaignId, getCampaignByIdUC, addDebugLog]);

  useEffect(() => {
    fetchDetails();
  }, [fetchDetails]);

  const handleUpdate = useCallback(async (payload: UpdateCampaignPayload) => {
    if (!campaignId) return;
    try {
      const updated = await updateCampaignUC.execute(campaignId, payload);
      addDebugLog(
        `POST /api/campaigns/${campaignId} (PUT)`,
        `${BASE_URL}/campaigns/${campaignId}`,
        200,
        updated._rawResponse || updated
      );
      setCampaign(updated);
      setIsEditing(false);
      showToast("تم تحديث الحملة بنجاح", "success");
      return updated;
    } catch (err: any) {
      console.error("Error updating campaign:", err);
      showToast(err.message || "فشل تحديث الحملة", "error");
      throw err;
    }
  }, [campaignId, updateCampaignUC, addDebugLog, showToast]);

  const handleDelete = useCallback(async () => {
    if (!campaignId) return false;
    try {
      const ok = await deleteCampaignUC.execute(campaignId);
      addDebugLog(
        `DELETE /api/campaigns/${campaignId}`,
        `${BASE_URL}/campaigns/${campaignId}`,
        200,
        { status: true, message: "Campaign deleted" }
      );
      setIsDeleting(false);
      showToast("تم حذف الحملة بنجاح", "success");
      return ok;
    } catch (err: any) {
      console.error("Error deleting campaign:", err);
      showToast(err.message || "فشل حذف الحملة", "error");
      throw err;
    }
  }, [campaignId, deleteCampaignUC, addDebugLog, showToast]);

  return {
    campaign,
    loading,
    error,
    refresh: fetchDetails,
    isEditing,
    setIsEditing,
    isDeleting,
    setIsDeleting,
    handleUpdate,
    handleDelete,
    // Debug Inspector
    showDebugTerminal,
    setShowDebugTerminal,
    debugLogs,
    addDebugLog,
    clearDebugLogs,
  };
}
