// ==============================
// Presentation — Hook
// useDownloadReport: منطق نافذة تصدير التقارير (تحميل قائمة المساجد للأدمن،
// واستخراج/تنزيل التقرير) — منقول من DownloadReportModal.tsx ليصبح المكوّن
// عرضياً بحتاً بدون fetch/localStorage مباشر.
// ==============================

import { useState, useEffect, useMemo } from 'react';
import { getMosqueRepository, getReportRepository } from '../../data/factories/repositoryFactory';
import { GetMosquesUseCase } from '../../domain/usecases/mosques/GetMosquesUseCase';
import { DownloadReportUseCase } from '../../domain/usecases/reports/DownloadReportUseCase';
import { ReportType, ReportFilters, ReportDownloadResult } from '../../domain/entities/Report';
import { isSuperAdminUser } from '../../data/auth/authStorage';

export interface ReportMosqueOption {
  id: number;
  name: string;
  city?: string;
}

export function useDownloadReport(isOpen: boolean) {
  const mosqueRepository = useMemo(() => getMosqueRepository(), []);
  const getMosquesUseCase = useMemo(() => new GetMosquesUseCase(mosqueRepository), [mosqueRepository]);
  const reportRepository = useMemo(() => getReportRepository(), []);
  const downloadReportUseCase = useMemo(() => new DownloadReportUseCase(reportRepository), [reportRepository]);

  const [mosques, setMosques] = useState<ReportMosqueOption[]>([]);
  const [loadingMosques, setLoadingMosques] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reportResult, setReportResult] = useState<any>(null);

  // Same role check DownloadReportModal used to compute inline via React.useMemo.
  const isSuperAdmin = useMemo(() => isSuperAdminUser(), []);

  // Fetch mosques catalog for the dropdown (Super Admin only) — mirrors the modal's
  // original `useEffect(() => { if (!isOpen || !isSuperAdmin) return; ... }, [isOpen])`.
  useEffect(() => {
    if (!isOpen || !isSuperAdmin) return;

    let isMounted = true;
    (async () => {
      setLoadingMosques(true);
      try {
        const result = await getMosquesUseCase.execute({ page: 1, limit: 100 });
        if (isMounted) {
          setMosques(result.data.map((m: any) => ({ id: Number(m.id), name: m.name, city: m.city })));
        }
      } catch (err) {
        console.warn('Failed to load mosques list:', err);
      } finally {
        if (isMounted) setLoadingMosques(false);
      }
    })();

    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, isSuperAdmin]);

  const downloadReport = async (reportType: ReportType, filters: ReportFilters): Promise<ReportDownloadResult> => {
    setError(null);
    setDownloading(true);
    try {
      const result = await downloadReportUseCase.execute(reportType, filters);
      if (result.kind === 'items') {
        setReportResult(result.items);
      }
      return result;
    } catch (err: any) {
      console.error('Download report failed:', err);
      setError(err.message || 'حدث خطأ غير متوقع أثناء استخراج التقرير.');
      throw err;
    } finally {
      setDownloading(false);
    }
  };

  return {
    mosques,
    loadingMosques,
    downloading,
    error,
    reportResult,
    setReportResult,
    isSuperAdmin,
    downloadReport,
  };
}
