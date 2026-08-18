// ==============================
// Data — ComplaintRepositoryImpl
// ==============================

import { ComplaintStats, ComplaintItem, PaginatedComplaints } from "../../domain/entities/Complaint";
import { IComplaintRepository, GetAdminComplaintsParams } from "../../domain/repositories/IComplaintRepository";

const BASE_URL = "https://mms-backend-rose.vercel.app/api";

export interface ComplaintOperationDebugResponse {
  operationType: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  operationLabel: string;
  httpStatus: number;
  endpointUrl: string;
  requestPayloadSent?: any;
  rawResponse: any;
  isSuccess: boolean;
  timestamp: string;
}

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
    try {
      const response = await fetch(`${BASE_URL}/complaints/stats${query}`, {
        method: "GET",
        headers: this.getAuthHeaders(),
      });

      if (response.ok) {
        const json = await response.json().catch(() => null);
        console.log("📊 [getComplaintPageStats API Server Response]:", json);

        if (json?.status && json?.data) {
          return {
            total_complaints: json.data.total_complaints ?? 0,
            open_complaints: json.data.open_complaints ?? 0,
            urgent_complaints: json.data.urgent_complaints ?? 0,
            resolved_this_month: json.data.resolved_this_month ?? 0,
            avg_response_hours: json.data.avg_response_hours ?? 0,
          };
        }
      }
    } catch (e) {
      console.error("❌ Failed to fetch complaint stats from server:", e);
    }

    // إذا تعذر جلب البيانات مباشرة من السيرفر، تعود جميع قيم الكاردات إلى 0 صراحة
    return {
      total_complaints: 0,
      open_complaints: 0,
      urgent_complaints: 0,
      resolved_this_month: 0,
      avg_response_hours: 0,
    };
  }

  // ── 2. getAdminComplaints / searchComplaints ──────────────────────────
  async getAdminComplaints(params?: GetAdminComplaintsParams): Promise<PaginatedComplaints> {
    const resDebug = await this.getAdminComplaintsWithDebug(params);
    return resDebug.result;
  }

  async searchComplaints(params?: GetAdminComplaintsParams): Promise<PaginatedComplaints> {
    const resDebug = await this.getAdminComplaintsWithDebug(params);
    return resDebug.result;
  }

  async getAdminComplaintsWithDebug(params?: GetAdminComplaintsParams): Promise<{
    result: PaginatedComplaints;
    debug: ComplaintOperationDebugResponse;
  }> {
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

    let status = 500;
    let json: any = null;

    try {
      const response = await fetch(url, {
        method: "GET",
        headers: this.getAuthHeaders(),
      });
      status = response.status;
      json = await response.json().catch(() => null);
    } catch (e: any) {
      json = { error: e.message || "فشل الاتصال بسيرفر الشكاوى" };
    }

    console.log("getAdminComplaints API Response:", json);

    const dataArray = Array.isArray(json?.data) ? json.data : (json?.data?.data || []);

    const paginatedResult: PaginatedComplaints = {
      data: dataArray as ComplaintItem[],
      pagination: json?.pagination || null,
    };

    const debug: ComplaintOperationDebugResponse = {
      operationType: 'GET',
      operationLabel: isSearch ? 'البحث عن شكاوى (Search)' : 'جلب قائمة الشكاوى (Index)',
      httpStatus: status,
      endpointUrl: url,
      requestPayloadSent: params || {},
      rawResponse: json,
      isSuccess: status >= 200 && status < 300,
      timestamp: new Date().toLocaleTimeString('ar-EG'),
    };

    return { result: paginatedResult, debug };
  }

  // ── 3. getComplaintDetails ───────────────────────────────────────────
  async getComplaintDetails(id: string | number): Promise<ComplaintItem> {
    const response = await fetch(`${BASE_URL}/admin/complaints/${id}`, {
      method: "GET",
      headers: this.getAuthHeaders(),
    });

    const json = await response.json();
    console.log("🌐 [API Repository] GET /admin/complaints/" + id + " Raw Server Response:", json);

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

  // ── 5. assignComplaintToAdmin (PATCH /api/admin/complaints/{id}/assign) ──
  async assignComplaintToAdmin(id: string | number, adminId: number, note?: string): Promise<ComplaintItem> {
    const response = await fetch(`${BASE_URL}/admin/complaints/${id}/assign`, {
      method: "PATCH",
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ admin_id: Number(adminId), note: note || null }),
    });

    const json = await response.json();
    console.log("assignComplaintToAdmin API Response:", json);

    if (!response.ok || !json.status) {
      throw new Error(json.message || "فشل إسناد/رفع الشكوى إلى السوبر أدمن");
    }

    return json.data as ComplaintItem;
  }
}
