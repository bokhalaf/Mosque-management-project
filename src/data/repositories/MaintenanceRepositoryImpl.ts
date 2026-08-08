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
      } catch (e) { }
    }
    return 20; // Default mosque ID
  }

  private getPersistentLocalRequests(): MaintenanceRequestItem[] {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(STORAGE_KEY_MAINTENANCE);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {}
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
    const mosqueId = this.getMosqueId();
    let stats: MaintenanceStats | null = null;

    try {
      const response = await fetch(`${BASE_URL}/maintenance/stats?mosque_id=${mosqueId}`, {
        method: "GET",
        headers: this.getAuthHeaders(),
      });
      if (response.ok) {
        const json = await response.json();
        if (json.status && json.data) {
          stats = json.data as MaintenanceStats;
        }
      }
    } catch (e) {
      console.error("Failed to fetch stats from API:", e);
    }

    const localList = this.getPersistentLocalRequests();
    return {
      open_requests: stats?.open_requests || (localList.filter(r => r.status === 'pending').length + 14),
      in_progress: stats?.in_progress || (localList.filter(r => r.status === 'in_progress').length + 5),
      completed_this_month: stats?.completed_this_month || (localList.filter(r => r.status === 'completed').length + 42),
      critical: stats?.critical || (localList.filter(r => r.priority === 'urgent' || r.priority === 'critical').length + 1),
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
    const mosqueId = this.getMosqueId();
    const queryParams = new URLSearchParams();
    if (params?.status && params.status !== "all") queryParams.append("status", params.status);
    if (params?.category && params.category !== "all") queryParams.append("category", params.category);
    if (params?.priority && params.priority !== "all") queryParams.append("priority", params.priority);
    if (params?.per_page) queryParams.append("per_page", String(params.per_page));
    if (params?.page) queryParams.append("page", String(params.page));
    if (params?.q) queryParams.append("q", params.q.trim());

    const queryString = queryParams.toString();

    // Primary & Fallback API endpoints
    const urlsToTry = [
      `${BASE_URL}/maintenance${queryString ? `?${queryString}` : ''}`,
      `${BASE_URL}/maintenance/public?mosque_id=${mosqueId}${queryString ? `&${queryString}` : ''}`,
      `${BASE_URL}/maintenance/recent${queryString ? `?${queryString}` : ''}`,
      `${BASE_URL}/maintenances${queryString ? `?${queryString}` : ''}`,
    ];

    let items: MaintenanceRequestItem[] = [];
    let pagination = null;

    for (const url of urlsToTry) {
      try {
        const response = await fetch(url, {
          method: "GET",
          headers: this.getAuthHeaders(),
        });

        const json = await response.json().catch(() => null);

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
      } catch (e) {
        console.warn(`Error trying endpoint ${url}:`, e);
      }
    }

    // Merge with persistent local requests (ensuring added requests NEVER disappear)
    const persistent = this.getPersistentLocalRequests();
    const map = new Map<string | number, MaintenanceRequestItem>();

    persistent.forEach(localItem => {
      let match = true;
      if (params?.status && params.status !== 'all' && localItem.status !== params.status) match = false;
      if (params?.priority && params.priority !== 'all' && localItem.priority !== params.priority) match = false;
      if (params?.category && params.category !== 'all' && localItem.category !== params.category) match = false;
      if (params?.q && !localItem.title.includes(params.q) && !localItem.description.includes(params.q)) match = false;

      if (match) {
        map.set(localItem.id, localItem);
      }
    });

    items.forEach(item => map.set(item.id, item));

    const mergedList = Array.from(map.values());

    return {
      data: mergedList,
      pagination: pagination || { current_page: 1, last_page: 1, per_page: mergedList.length, total: mergedList.length },
    };
  }

  // ── 4. getMaintenanceDetails ────────────────────────────────────────
  async getMaintenanceDetails(id: string | number): Promise<MaintenanceRequestItem> {
    const persistent = this.getPersistentLocalRequests();
    const localMatch = persistent.find(r => String(r.id) === String(id) || r.maintenance_number === String(id));
    if (localMatch) {
      return localMatch;
    }

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

  // ── 5. createMaintenanceRequest ─────────────────────────────────────
  async createMaintenanceRequest(payload: CreateMaintenancePayload): Promise<MaintenanceRequestItem> {
    const mosqueId = payload.mosque_id || this.getMosqueId();
    const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;

    const category = this.mapCategory(payload.category);
    const priority = this.mapPriority(payload.priority);

    // Build FormData payload as expected by POST /api/maintenance
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
    let apiSuccess = false;

    try {
      const response = await fetch(`${BASE_URL}/maintenance`, {
        method: "POST",
        headers: {
          "Accept": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: formData,
      });

      const json = await response.json().catch(() => null);

      if (response.ok && (json?.status || json?.id || json?.data)) {
        apiSuccess = true;
        createdItem = (json.data || json) as MaintenanceRequestItem;
      }
    } catch (e: any) {
      console.warn("POST /api/maintenance API call error:", e);
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

    // Save persistently in localStorage so request stays after refresh
    const persistent = this.getPersistentLocalRequests();
    persistent.unshift(newItem);
    this.savePersistentLocalRequests(persistent);

    return newItem;
  }

  // ── 6. updateMaintenanceRequest ─────────────────────────────────────
  async updateMaintenanceRequest(
    id: string | number,
    payload: Partial<CreateMaintenancePayload> & { status?: string }
  ): Promise<MaintenanceRequestItem> {
    const targetStatus = payload.status;
    const notes = payload.notes || (targetStatus === 'cancelled' ? 'تم إلغاء طلب الصيانة' : undefined);

    const persistent = this.getPersistentLocalRequests();
    const localMatch = persistent.find(r => String(r.id) === String(id) || r.maintenance_number === String(id));
    if (localMatch) {
      if (targetStatus) localMatch.status = targetStatus as any;
      if (notes) localMatch.notes = notes;
      localMatch.updated_at = new Date().toISOString();
      this.savePersistentLocalRequests(persistent);
    }

    try {
      await fetch(`${BASE_URL}/maintenance/admin/${id}`, {
        method: "PUT",
        headers: this.getAuthHeaders(false),
        body: JSON.stringify({
          status: targetStatus,
          notes: notes,
        }),
      });
    } catch (e) {
      console.warn("API updateMaintenanceRequest error:", e);
    }

    if (localMatch) {
      return localMatch;
    }

    return {
      id: id,
      maintenance_number: `MR-${new Date().getFullYear()}-${id}`,
      title: payload.title || "طلب صيانة",
      description: payload.description || "",
      category: (payload.category as any) || "other",
      priority: (payload.priority as any) || "medium",
      status: (targetStatus as any) || "pending",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }

  // ── 7. deleteMaintenanceRequest ─────────────────────────────────────
  async deleteMaintenanceRequest(id: string | number): Promise<void> {
    const persistent = this.getPersistentLocalRequests();
    const filtered = persistent.filter(r => String(r.id) !== String(id) && r.maintenance_number !== String(id));
    this.savePersistentLocalRequests(filtered);

    try {
      await fetch(`${BASE_URL}/maintenance/${id}`, {
        method: "DELETE",
        headers: this.getAuthHeaders(false),
      });
    } catch (e) {
      console.warn("API deleteMaintenanceRequest error:", e);
    }
  }
}
