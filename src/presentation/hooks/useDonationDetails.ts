// ==============================
// Presentation — Hook
// useDonationDetails: جلب تفاصيل التبرع من السيرفر، وفتح رابط الإيصال مباشرة
// ==============================

import { useState, useEffect, useCallback, useMemo } from "react";
import { DonationDetails } from "../../domain/entities/Donation";
import { DonationRepositoryImpl } from "../../data/repositories/DonationRepositoryImpl";
import { GetDonationByReferenceUseCase } from "../../domain/usecases/donations/GetDonationByReferenceUseCase";
import { DownloadReceiptUseCase } from "../../domain/usecases/donations/DownloadReceiptUseCase";
import { useToast } from "../../app/components/ui/Toast";

export interface ApiDebugLog {
  action: string;
  url: string;
  status: number | string;
  response: any;
  time: string;
}

const BASE_URL = "https://mms-backend-rose.vercel.app/api";

export function useDonationDetails(donationReferenceOrId: string | number) {
  const { showToast } = useToast();
  const [donation, setDonation] = useState<DonationDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloadingReceipt, setDownloadingReceipt] = useState(false);

  // Debug Terminal Logger state
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
  const getDonationUC = useMemo(() => new GetDonationByReferenceUseCase(repository), [repository]);
  const downloadReceiptUC = useMemo(() => new DownloadReceiptUseCase(repository), [repository]);

  const fetchDetails = useCallback(async () => {
    if (!donationReferenceOrId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getDonationUC.execute(donationReferenceOrId);
      const target = data.reference || donationReferenceOrId;
      addDebugLog(
        `GET /api/donations/${target}`,
        `${BASE_URL}/donations/${target}`,
        200,
        data._rawResponse || data
      );
      setDonation(data);
    } catch (err: any) {
      console.error("Error fetching donation details:", err);
      setError(err.message || "تعذر جلب تفاصيل التبرع من السيرفر");
      addDebugLog(
        `GET /api/donations/${donationReferenceOrId}`,
        `${BASE_URL}/donations/${donationReferenceOrId}`,
        500,
        { status: false, message: err.message || "Error" }
      );
    } finally {
      setLoading(false);
    }
  }, [donationReferenceOrId, getDonationUC, addDebugLog]);

  useEffect(() => {
    fetchDetails();
  }, [fetchDetails]);

  // فتح الرابط الذي يأتيه من الريسبونس مباشرة
  const handleDownloadReceipt = useCallback(async () => {
    if (!donation) return;
    setDownloadingReceipt(true);
    const targetId = donation.id || donation.reference;
    const targetUrl = `${BASE_URL}/donations/${targetId}/receipt`;

    try {
      const receiptUrl = await downloadReceiptUC.execute(targetId);
      
      addDebugLog(
        `GET /api/donations/${targetId}/receipt`,
        targetUrl,
        200,
        { status: true, message: "Success", data: { receipt_url: receiptUrl } }
      );

      // فتح الرابط القادم من الريسبونس مباشرة
      if (receiptUrl) {
        window.open(receiptUrl, '_blank');
        showToast("تم فتح رابط الإيصال في نافذة جديدة", "success");
      }
    } catch (err: any) {
      console.error("Error downloading receipt:", err);
      addDebugLog(
        `GET /api/donations/${targetId}/receipt`,
        targetUrl,
        500,
        { status: false, message: err.message || "Failed to get receipt URL" }
      );
      showToast(err.message || "تعذر جلب رابط الإيصال من السيرفر", "error");
    } finally {
      setDownloadingReceipt(false);
    }
  }, [donation, downloadReceiptUC, addDebugLog, showToast]);

  return {
    donation,
    loading,
    error,
    downloadingReceipt,
    handleDownloadReceipt,
    fetchDetails,
    // Debug Inspector
    showDebugTerminal,
    setShowDebugTerminal,
    debugLogs,
    addDebugLog,
    clearDebugLogs,
  };
}
