// ==============================
// Data — ComplaintRepositoryImpl
// ==============================

import { ComplaintStats, ComplaintItem, PaginatedComplaints } from "../../domain/entities/Complaint";
import { IComplaintRepository, GetAdminComplaintsParams } from "../../domain/repositories/IComplaintRepository";

const BASE_URL = "https://mms-backend-rose.vercel.app/api";

export class ComplaintRepositoryImpl implements IComplaintRepository {

  private getAuthHeaders(): HeadersInit {
    const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
    return {
      "Content-Type": "application/json",
      "Accept": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }

  // ── 1. getComplaintPageStats ──────────────────────────────────────────
  async getComplaintPageStats(mosqueId?: number): Promise<ComplaintStats> {
    const query = mosqueId ? `?mosque_id=${mosqueId}` : "";
    const response = await fetch(`${BASE_URL}/complaints/stats${query}`, {
      method: "GET",
      headers: this.getAuthHeaders(),
    });

    const json = await response.json();
    console.log("getComplaintPageStats API Response:", json);

    if (!response.ok || !json.status) {
      throw new Error(json.message || "فشل جلب إحصائيات الشكاوى");
    }

    return json.data as ComplaintStats;
  }

  // ── 2. getAdminComplaints / searchComplaints ──────────────────────────
  async getAdminComplaints(params?: GetAdminComplaintsParams): Promise<PaginatedComplaints> {
    // If search query is present, use search complaints endpoint or filter param
    const isSearch = Boolean(params?.q && params.q.trim().length > 0);
    const endpoint = isSearch ? `${BASE_URL}/admin/complaints/search` : `${BASE_URL}/admin/complaints`;

    const queryParams = new URLSearchParams();
    if (params?.status && params.status !== "all") queryParams.append("status", params.status);
    if (params?.priority && params.priority !== "all") queryParams.append("priority", params.priority);
    if (params?.complaint_type && params.complaint_type !== "all") queryParams.append("complaint_type", params.complaint_type);
    if (params?.mosque_id) queryParams.append("mosque_id", String(params.mosque_id));
    if (params?.per_page) queryParams.append("per_page", String(params.per_page));
    if (params?.page) queryParams.append("page", String(params.page));
    if (params?.q) queryParams.append("q", params.q.trim());

    const queryString = queryParams.toString();
    const url = `${endpoint}${queryString ? `?${queryString}` : ""}`;

    const response = await fetch(url, {
      method: "GET",
      headers: this.getAuthHeaders(),
    });

    const json = await response.json();
    console.log("getAdminComplaints API Response:", json);

    if (!response.ok || !json.status) {
      throw new Error(json.message || "فشل جلب قائمة الشكاوى");
    }

    const dataArray = Array.isArray(json.data) ? json.data : (json.data?.data || []);

    return {
      data: dataArray as ComplaintItem[],
      pagination: json.pagination || null,
    };
  }

  // ── 3. getComplaintDetails ───────────────────────────────────────────
  async getComplaintDetails(id: string | number): Promise<ComplaintItem> {
    const response = await fetch(`${BASE_URL}/admin/complaints/${id}`, {
      method: "GET",
      headers: this.getAuthHeaders(),
    });

    const json = await response.json();
    console.log("getComplaintDetails API Response:", json);

    if (!response.ok || !json.status) {
      throw new Error(json.message || "فشل جلب تفاصيل الشكوى");
    }

    return json.data as ComplaintItem;
  }

  // ── 4. updateComplaintStatus ─────────────────────────────────────────
  async updateComplaintStatus(id: string | number, status: string, note?: string): Promise<ComplaintItem> {
    const response = await fetch(`${BASE_URL}/admin/complaints/${id}/status`, {
      method: "PATCH",
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ status, note }),
    });

    const json = await response.json();
    console.log("updateComplaintStatus API Response:", json);

    if (!response.ok || !json.status) {
      throw new Error(json.message || "فشل تحديث حالة الشكوى");
    }

    return json.data as ComplaintItem;
  }
}
