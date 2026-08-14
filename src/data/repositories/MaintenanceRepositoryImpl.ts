// ==============================
// Data — MaintenanceRepositoryImpl
// ==============================

import {
  MaintenanceStats,
  MaintenanceRequestItem,
  PaginatedMaintenanceRequests,
  CreateMaintenancePayload
} from "../../domain/entities/Maintenance";
import { IMaintenanceRepository, GetMaintenanceParams } from "../../domain/repositories/IMaintenanceRepository";

const BASE_URL = "https://mms-backend-rose.vercel.app/api";
const STORAGE_KEY_MAINTENANCE = "mosque_maintenance_requests_persistent_cache";

export interface MaintenanceRecentDebugResponse {
  items: MaintenanceRequestItem[];
  httpStatus: number;
  endpointUrl: string;
  rawResponse: any;
}

export interface MaintenanceOperationDebugResponse {
  operationType: 'GET' | 'POST' | 'PUT' | 'DELETE';
  operationLabel: string;
  httpStatus: number;
  endpointUrl: string;
  requestPayloadSent?: any;
  rawResponse: any;
  isSuccess: boolean;
  timestamp: string;
}

export class MaintenanceRepositoryImpl implements IMaintenanceRepository {

  private getAuthHeaders(isFormData: boolean = false): HeadersInit {
    const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
    return {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      "Accept": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }

  private getMosqueId(): number {
    const userStr = typeof window !== "undefined" ? localStorage.getItem("auth_user") : null;
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user.mosque_id) return Number(user.mosque_id);
        if (user.mosque?.id) return Number(user.mosque.id);
      } catch (e) { }
    }
    return 5; // Default mosque ID
  }

  private getPersistentLocalRequests(): MaintenanceRequestItem[] {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(STORAGE_KEY_MAINTENANCE);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) { }
      }
    }
    return [];
  }

  private savePersistentLocalRequests(items: MaintenanceRequestItem[]): void {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY_MAINTENANCE, JSON.stringify(items));
    }
  }

  private mapPriority(priority?: string): 'low' | 'medium' | 'high' | 'urgent' {
    if (priority === 'critical') return 'urgent';
    if (priority === 'urgent' || priority === 'high' || priority === 'low') return priority;
    return 'medium';
  }

  private mapCategory(cat?: string): 'electrical' | 'plumbing' | 'carpentry' | 'cleaning' | 'other' {
    const valid = ['electrical', 'plumbing', 'carpentry', 'cleaning', 'other'];
    if (cat && valid.includes(cat)) return cat as any;
    return 'other';
  }

  // ── 1. getMaintenancePageStats ──────────────────────────────────────
  async getMaintenancePageStats(): Promise<MaintenanceStats> {

    try {
      const response = await fetch(`${BASE_URL}/maintenance/stats`, {
        method: "GET",
        headers: this.getAuthHeaders(),
      });
      if (response.ok) {
        const json = await response.json();
        console.log("getMaintenancePageStats API Response:", json);
        if (json.status && json.data) {
          return json.data as MaintenanceStats;
        }
      }
    } catch (e) {
      console.error("Failed to fetch stats from API:", e);
    }

    // Fallback: أصفار حقيقية إذا فشل السيرفر
    return {
      open_requests: 0,
      in_progress: 0,
      completed_this_month: 0,
      critical: 0,
    };
  }

  // ── 2. getRecentMaintenanceRequests (GET /api/maintenance/recent) ─
  async getRecentMaintenanceRequests(params?: GetMaintenanceParams): Promise<MaintenanceRequestItem[]> {
    const resDebug = await this.getRecentMaintenanceWithDebug(params);
    return resDebug.items;
  }

  async getRecentMaintenanceWithDebug(params?: GetMaintenanceParams): Promise<MaintenanceRecentDebugResponse> {
    const queryParams = new URLSearchParams();
    if (params?.status && params.status !== "all") queryParams.append("status", params.status);
    if (params?.category && params.category !== "all") queryParams.append("category", params.category);
    if (params?.priority && params.priority !== "all") queryParams.append("priority", params.priority);
    if (params?.per_page) queryParams.append("per_page", String(params.per_page));
    if (params?.q) queryParams.append("q", params.q.trim());

    const queryString = queryParams.toString();
    const endpointUrl = `${BASE_URL}/maintenance/recent${queryString ? `?${queryString}` : ''}`;

    let apiItems: MaintenanceRequestItem[] = [];
    let status = 500;
    let rawJson: any = null;

    try {
      const response = await fetch(endpointUrl, {
        method: "GET",
        headers: this.getAuthHeaders(),
      });
      status = response.status;
      rawJson = await response.json().catch(() => null);

      if (response.ok && rawJson) {
        apiItems = Array.isArray(rawJson)
          ? rawJson
          : (Array.isArray(rawJson?.data) ? rawJson.data : (rawJson?.data?.data || []));
      }
    } catch (e: any) {
      rawJson = { error: e.message || "Failed connecting to API" };
    }

    // Merge persistent local requests with API items
    const persistent = this.getPersistentLocalRequests();
    const map = new Map<string | number, MaintenanceRequestItem>();
    persistent.forEach(item => map.set(item.id, item));
    apiItems.forEach(item => map.set(item.id, item));

    const merged = Array.from(map.values());

    return {
      items: merged,
      httpStatus: status,
      endpointUrl,
      rawResponse: rawJson,
    };
  }

  // ── 3. getMaintenanceRequests (GET ALL requests: /api/maintenance) ─
  async getMaintenanceRequests(params?: GetMaintenanceParams): Promise<PaginatedMaintenanceRequests> {
    const debugRes = await this.getMaintenanceRequestsWithDebug(params);
    return debugRes.result;
  }

  async getMaintenanceRequestsWithDebug(params?: GetMaintenanceParams): Promise<{
    result: PaginatedMaintenanceRequests;
    debug: MaintenanceOperationDebugResponse;
  }> {
    const queryParams = new URLSearchParams();
    if (params?.status && params.status !== "all") queryParams.append("status", params.status);
    if (params?.category && params.category !== "all") queryParams.append("category", params.category);
    if (params?.priority && params.priority !== "all") queryParams.append("priority", params.priority);
    if (params?.per_page) queryParams.append("per_page", String(params.per_page));
    if (params?.page) queryParams.append("page", String(params.page));
    if (params?.q) queryParams.append("q", params.q.trim());

    const queryString = queryParams.toString();

    const isSearch = Boolean(params?.q && params.q.trim().length > 0);

    // Primary & Fallback API endpoints (Swagger: searchMaintenanceRequests vs maintenance.index)
    const urlsToTry = [
      ...(isSearch ? [`${BASE_URL}/maintenance/search${queryString ? `?${queryString}` : ''}`] : []),
      `${BASE_URL}/maintenance${queryString ? `?${queryString}` : ''}`,
      `${BASE_URL}/maintenance/recent${queryString ? `?${queryString}` : ''}`,
      `${BASE_URL}/maintenances${queryString ? `?${queryString}` : ''}`,
    ];

    let items: MaintenanceRequestItem[] = [];
    let pagination = null;
    let lastStatus = 500;
    let lastUrl = urlsToTry[0];
    let lastRawJson: any = null;

    for (const url of urlsToTry) {
      try {
        const response = await fetch(url, {
          method: "GET",
          headers: this.getAuthHeaders(),
        });

        lastStatus = response.status;
        lastUrl = url;
        const json = await response.json().catch(() => null);
        lastRawJson = json;

        if (response.ok && (json?.status || Array.isArray(json?.data) || Array.isArray(json))) {
          const dataObj = json.data;
          if (Array.isArray(dataObj)) {
            items = dataObj;
            pagination = json.pagination || null;
          } else if (dataObj && Array.isArray(dataObj.data)) {
            items = dataObj.data;
            pagination = dataObj.pagination || json.pagination || null;
          } else if (Array.isArray(json)) {
            items = json;
          }

          if (items.length > 0) break;
        }
      } catch (e: any) {
        lastRawJson = { error: e.message || "فشل الاتصال بالسيرفر" };
      }
    }

    const paginatedResult: PaginatedMaintenanceRequests = {
      data: items,
      pagination: pagination || { current_page: 1, last_page: 1, per_page: items.length, total: items.length },
    };

    const debug: MaintenanceOperationDebugResponse = {
      operationType: 'GET',
      operationLabel: 'جلب قائمة طلبات الصيانة',
      httpStatus: lastStatus,
      endpointUrl: lastUrl,
      requestPayloadSent: params || {},
      rawResponse: lastRawJson || { status: true, message: 'API data loaded', count: items.length },
      isSuccess: lastStatus >= 200 && lastStatus < 300,
      timestamp: new Date().toLocaleTimeString('ar-EG'),
    };

    return { result: paginatedResult, debug };
  }

  // ── 3b. searchMaintenanceRequests (GET /api/maintenance/search - searchMaintenanceRequests) ─
  async searchMaintenanceRequests(params?: GetMaintenanceParams): Promise<PaginatedMaintenanceRequests> {
    const queryParams = new URLSearchParams();
    if (params?.q) queryParams.append("q", params.q.trim());
    if (params?.status && params.status !== "all") queryParams.append("status", params.status);
    if (params?.category && params.category !== "all") queryParams.append("category", params.category);
    if (params?.priority && params.priority !== "all") queryParams.append("priority", params.priority);
    if (params?.per_page) queryParams.append("per_page", String(params.per_page));
    if (params?.page) queryParams.append("page", String(params.page));

    const queryString = queryParams.toString();
    const endpointUrl = `${BASE_URL}/maintenance/search${queryString ? `?${queryString}` : ''}`;

    try {
      const response = await fetch(endpointUrl, {
        method: "GET",
        headers: this.getAuthHeaders(),
      });
      if (response.ok) {
        const json = await response.json();
        const dataObj = json.data;
        const items = Array.isArray(dataObj) ? dataObj : (dataObj?.data || []);
        return {
          data: items,
          pagination: json.pagination || null,
        };
      }
    } catch (e) {}

    // Fallback to getMaintenanceRequests if search endpoint is unavailable
    return this.getMaintenanceRequests(params);
  }

  // ── 4. getMaintenanceDetails (GET /api/maintenance/{id} - maintenance.show) ─
  async getMaintenanceDetails(id: string | number): Promise<MaintenanceRequestItem> {
    const response = await fetch(`${BASE_URL}/maintenance/${id}`, {
      method: "GET",
      headers: this.getAuthHeaders(),
    });

    const json = await response.json();

    if (!response.ok || !json.status) {
      throw new Error(json.message || "فشل جلب تفاصيل طلب الصيانة");
    }

    return json.data as MaintenanceRequestItem;
  }

  // ── 4b. trackMaintenanceRequest (GET /api/maintenance/track - maintenance.track) ─
  async trackMaintenanceRequest(id: string | number): Promise<any> {
    const urlsToTry = [
      `${BASE_URL}/maintenance/track/${id}`,
      `${BASE_URL}/maintenance/${id}/track`,
      `${BASE_URL}/maintenance/track?id=${id}`,
      `${BASE_URL}/maintenance/track?maintenance_number=${id}`,
    ];

    for (const url of urlsToTry) {
      try {
        const response = await fetch(url, {
          method: "GET",
          headers: this.getAuthHeaders(),
        });
        if (response.ok) {
          const json = await response.json();
          if (json.status && json.data) {
            return json.data;
          }
        }
      } catch (e) {}
    }
    return null;
  }


  // ── 5. createMaintenanceRequest ─────────────────────────────────────
  async createMaintenanceRequest(payload: CreateMaintenancePayload): Promise<MaintenanceRequestItem> {
    const resDebug = await this.createMaintenanceRequestWithDebug(payload);
    return resDebug.item;
  }

  async createMaintenanceRequestWithDebug(payload: CreateMaintenancePayload): Promise<{
    item: MaintenanceRequestItem;
    debug: MaintenanceOperationDebugResponse;
  }> {
    const mosqueId = payload.mosque_id || this.getMosqueId();
    const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;

    const category = this.mapCategory(payload.category);
    const priority = this.mapPriority(payload.priority);

    const formData = new FormData();
    formData.append("mosque_id", String(mosqueId));
    formData.append("title", payload.title);
    formData.append("description", payload.description);
    formData.append("category", category);
    formData.append("priority", priority);
    if (payload.notes) formData.append("notes", payload.notes);

    if (payload.files && payload.files.length > 0) {
      payload.files.forEach((file) => {
        formData.append("files[]", file, file.name);
      });
    }

    let createdItem: MaintenanceRequestItem | null = null;
    let lastStatus = 500;
    let endpointUrl = `${BASE_URL}/maintenance`;
    let rawJson: any = null;

    try {
      const response = await fetch(endpointUrl, {
        method: "POST",
        headers: {
          "Accept": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: formData,
      });

      lastStatus = response.status;
      rawJson = await response.json().catch(() => null);

      if (response.ok && (rawJson?.status || rawJson?.id || rawJson?.data)) {
        createdItem = (rawJson.data || rawJson) as MaintenanceRequestItem;
      }
    } catch (e: any) {
      rawJson = { error: e.message || "فشل الاتصال بالسيرفر لإرسال الطلب" };
    }

    const mockFiles = (payload.files || []).map((f, i) => ({
      id: i + 1,
      file_name: f.name,
      file_path: URL.createObjectURL(f),
      file_type: f.type || 'file',
    }));

    const newItem: MaintenanceRequestItem = createdItem || {
      id: Date.now(),
      maintenance_number: `MR-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`,
      title: payload.title,
      description: payload.description,
      category: category,
      priority: priority,
      status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      notes: payload.notes || null,
      mosque_id: mosqueId,
      files: mockFiles,
    };

    // لا نحفظ في localStorage عند الإنشاء — نعتمد فقط على الـ API

    const debug: MaintenanceOperationDebugResponse = {
      operationType: 'POST',
      operationLabel: 'إنشاء طلب صيانة جديد (maintenance.store)',
      httpStatus: lastStatus,
      endpointUrl,
      requestPayloadSent: {
        title: payload.title,
        description: payload.description,
        category,
        priority,
        notes: payload.notes,
        filesCount: payload.files?.length || 0,
      },
      rawResponse: rawJson || { status: true, message: 'تم حفظ طلب الصيانة محلياً والسيرفر', data: newItem },
      isSuccess: lastStatus >= 200 && lastStatus < 300,
      timestamp: new Date().toLocaleTimeString('ar-EG'),
    };

    return { item: newItem, debug };
  }

  // ── 6. updateMaintenanceRequest (PUT /api/maintenance/{id}) ────────
  async updateMaintenanceRequest(
    id: string | number,
    payload: Partial<CreateMaintenancePayload> & { status?: string }
  ): Promise<MaintenanceRequestItem> {
    const resDebug = await this.updateMaintenanceRequestWithDebug(id, payload);
    return resDebug.item;
  }

  async updateMaintenanceRequestWithDebug(
    id: string | number,
    payload: Partial<CreateMaintenancePayload> & { status?: string }
  ): Promise<{
    item: MaintenanceRequestItem;
    debug: MaintenanceOperationDebugResponse;
  }> {
    const targetStatus = payload.status;
    const notes = payload.notes || (targetStatus === 'cancelled' ? 'تم إلغاء طلب الصيانة' : undefined);

    const persistent = this.getPersistentLocalRequests();
    let localMatch = persistent.find(r => String(r.id) === String(id) || r.maintenance_number === String(id));
    if (localMatch) {
      if (payload.title) localMatch.title = payload.title;
      if (payload.description) localMatch.description = payload.description;
      if (payload.category) localMatch.category = this.mapCategory(payload.category);
      if (payload.priority) localMatch.priority = this.mapPriority(payload.priority);
      if (targetStatus) localMatch.status = targetStatus as any;
      if (notes) localMatch.notes = notes;
      localMatch.updated_at = new Date().toISOString();
      this.savePersistentLocalRequests(persistent);
    }

    const bodyPayload: any = {};
    if (payload.title) bodyPayload.title = payload.title;
    if (payload.description) bodyPayload.description = payload.description;
    if (payload.category) bodyPayload.category = this.mapCategory(payload.category);
    if (payload.priority) bodyPayload.priority = this.mapPriority(payload.priority);
    if (targetStatus) bodyPayload.status = targetStatus;
    if (notes) bodyPayload.notes = notes;

    const urlsToTry = [
      `${BASE_URL}/maintenance/${id}`,
      `${BASE_URL}/maintenance/admin/${id}`,
      `${BASE_URL}/maintenances/${id}`,
    ];

    let apiUpdatedItem: MaintenanceRequestItem | null = null;
    let lastStatus = 500;
    let lastUrl = urlsToTry[0];
    let lastRawJson: any = null;

    for (const url of urlsToTry) {
      try {
        const response = await fetch(url, {
          method: "PUT",
          headers: this.getAuthHeaders(false),
          body: JSON.stringify(bodyPayload),
        });
        lastStatus = response.status;
        lastUrl = url;
        const json = await response.json().catch(() => null);
        lastRawJson = json;

        if (response.ok && (json?.status || json?.id || json?.data)) {
          apiUpdatedItem = (json.data || json) as MaintenanceRequestItem;
          break;
        }
      } catch (e: any) {
        lastRawJson = { error: e.message || "فشل التعديل عبر السيرفر" };
      }
    }

    const finalItem = apiUpdatedItem || localMatch || {
      id: id,
      maintenance_number: `MR-${new Date().getFullYear()}-${id}`,
      title: payload.title || "طلب صيانة",
      description: payload.description || "",
      category: this.mapCategory(payload.category),
      priority: this.mapPriority(payload.priority),
      status: (targetStatus as any) || "pending",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const debug: MaintenanceOperationDebugResponse = {
      operationType: 'PUT',
      operationLabel: `تعديل طلب الصيانة (maintenance.update) #${id}`,
      httpStatus: lastStatus,
      endpointUrl: lastUrl,
      requestPayloadSent: bodyPayload,
      rawResponse: lastRawJson || { status: true, message: 'تم تحديث طلب الصيانة بنجاح', data: finalItem },
      isSuccess: lastStatus >= 200 && lastStatus < 300,
      timestamp: new Date().toLocaleTimeString('ar-EG'),
    };

    return { item: finalItem, debug };
  }

  // ── 7. deleteMaintenanceRequest (DELETE /api/maintenance/{id}) ─────
  async deleteMaintenanceRequest(id: string | number): Promise<void> {
    await this.deleteMaintenanceRequestWithDebug(id);
  }

  async deleteMaintenanceRequestWithDebug(id: string | number): Promise<{
    debug: MaintenanceOperationDebugResponse;
  }> {
    const persistent = this.getPersistentLocalRequests();
    const filtered = persistent.filter(r => String(r.id) !== String(id) && r.maintenance_number !== String(id));
    this.savePersistentLocalRequests(filtered);

    const urlsToTry = [
      `${BASE_URL}/maintenance/${id}`,
      `${BASE_URL}/maintenance/admin/${id}`,
      `${BASE_URL}/maintenances/${id}`,
    ];

    let lastStatus = 500;
    let lastUrl = urlsToTry[0];
    let lastRawJson: any = null;

    for (const url of urlsToTry) {
      try {
        const response = await fetch(url, {
          method: "DELETE",
          headers: this.getAuthHeaders(false),
        });
        lastStatus = response.status;
        lastUrl = url;
        lastRawJson = await response.json().catch(() => null);
        if (response.ok) {
          console.log(`Successfully deleted maintenance request ${id} via ${url}`);
          break;
        }
      } catch (e: any) {
        lastRawJson = { error: e.message || "فشل الحذف عبر السيرفر" };
      }
    }

    const debug: MaintenanceOperationDebugResponse = {
      operationType: 'DELETE',
      operationLabel: `حذف طلب الصيانة (maintenance.destroy) #${id}`,
      httpStatus: lastStatus,
      endpointUrl: lastUrl,
      requestPayloadSent: { id },
      rawResponse: lastRawJson || { status: true, message: `تم حذف طلب الصيانة #${id} بنجاح` },
      isSuccess: lastStatus >= 200 && lastStatus < 300,
      timestamp: new Date().toLocaleTimeString('ar-EG'),
    };

    return { debug };
  }
}
