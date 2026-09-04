// ==============================
// Data Repository Implementation — ReportRepositoryImpl
// منطق استخراج/تحميل التقارير، منقول من DownloadReportModal.tsx حرفياً
// (نفس الـ endpoints ونفس منطق قراءة الاستجابة) بدون أي تغيير سلوكي.
// ==============================

import { BASE_URL, getMultipartAuthHeaders } from "../http/apiClient";
import { isSuperAdminUser } from "../auth/authStorage";
import { IReportRepository } from "../../domain/repositories/IReportRepository";
import { ReportType, ReportFilters, ReportDownloadResult } from "../../domain/entities/Report";

export class ReportRepositoryImpl implements IReportRepository {
  async downloadReport(reportType: ReportType, filters: ReportFilters): Promise<ReportDownloadResult> {
    const isSuperAdmin = isSuperAdminUser();
    const params = new URLSearchParams();

    if (filters.dateFrom && filters.dateFrom.trim()) {
      params.append("date_from", filters.dateFrom.trim());
    }
    if (filters.dateTo && filters.dateTo.trim()) {
      params.append("date_to", filters.dateTo.trim());
    }
    if (isSuperAdmin && filters.mosqueId && filters.mosqueId !== "all") {
      params.append("mosque_id", String(filters.mosqueId));
    }

    const queryString = params.toString() ? `?${params.toString()}` : "";

    // Determine endpoint based on user role (Super Admin vs Mosque Manager)
    const url = isSuperAdmin
      ? `${BASE_URL}/admin/reports/${reportType}/download${queryString}`
      : `${BASE_URL}/dashboard/mosque-manager/reports/${reportType}${queryString}`;

    const response = await fetch(url, {
      method: "GET",
      headers: getMultipartAuthHeaders(),
    });

    const json = await response.json().catch(() => null);

    if (response.ok) {
      if (json?.data?.url) return { kind: "url", url: json.data.url };
      if (json?.report_url) return { kind: "url", url: json.report_url };
      if (typeof json?.data === "string" && json.data.startsWith("http")) return { kind: "url", url: json.data };
      if (json?.data || json?.items || Array.isArray(json)) {
        return { kind: "items", items: json.data || json.items || json };
      }
      throw new Error(json?.message || "تم استلام رد غير متوقع من السيرفر");
    }

    throw new Error(json?.message || "فشل في إنشاء واستخراج التقرير من السيرفر");
  }
}
