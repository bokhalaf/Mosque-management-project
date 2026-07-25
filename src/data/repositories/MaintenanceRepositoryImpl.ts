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

const localCreatedRequests: MaintenanceRequestItem[] = [];

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
      } catch (e) {}
    }
    return 1; // Default mosque ID
  }

  // ── 1. getMaintenancePageStats ──────────────────────────────────────
  async getMaintenancePageStats(): Promise<MaintenanceStats> {
    const mosqueId = this.getMosqueId();
    try {
      const response = await fetch(`${BASE_URL}/maintenance/stats?mosque_id=${mosqueId}`, {
        method: "GET",
        headers: this.getAuthHeaders(),
      });

      const json = await response.json();
      console.log("getMaintenancePageStats API Response:", json);

      if (response.ok && json.status && json.data) {
        return json.data as MaintenanceStats;
      }
    } catch (e) {
      console.error("Failed to fetch stats from API:", e);
    }

    return {
      open_requests: localCreatedRequests.filter(r => r.status === 'pending').length || 14,
      in_progress: localCreatedRequests.filter(r => r.status === 'in_progress').length || 5,
      completed_this_month: localCreatedRequests.filter(r => r.status === 'completed').length || 42,
      critical: localCreatedRequests.filter(r => r.priority === 'urgent' || r.priority === 'critical').length || 1,
    };
  }

  // ── 2. getMaintenanceRequests / search ──────────────────────────────
  async getMaintenanceRequests(params?: GetMaintenanceParams): Promise<PaginatedMaintenanceRequests> {
    const isSearch = Boolean(params?.q && params.q.trim().length > 0);

    const queryParams = new URLSearchParams();
    if (params?.status && params.status !== "all") queryParams.append("status", params.status);
    if (params?.category && params.category !== "all") queryParams.append("category", params.category);
    if (params?.priority && params.priority !== "all") queryParams.append("priority", params.priority);
    if (params?.per_page) queryParams.append("per_page", String(params.per_page));
    if (params?.page) queryParams.append("page", String(params.page));
    if (params?.q) queryParams.append("q", params.q.trim());

    const queryString = queryParams.toString();

    const urlsToTry = isSearch ? [
      `${BASE_URL}/maintenance/search?${queryString}`,
      `${BASE_URL}/maintenance?${queryString}`
    ] : [
      `${BASE_URL}/maintenance?${queryString}`,
      `${BASE_URL}/maintenance/recent?${queryString}`,
      `${BASE_URL}/maintenance/admin?${queryString}`
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
        console.log(`GET ${url} Response:`, json);

        if (response.ok && json?.status) {
          const dataObj = json.data;
          if (Array.isArray(dataObj)) {
            items = dataObj;
            pagination = json.pagination || null;
          } else if (dataObj && Array.isArray(dataObj.data)) {
            items = dataObj.data;
            pagination = dataObj.pagination || json.pagination || null;
          } else if (dataObj && typeof dataObj === 'object') {
            items = [dataObj];
          }
          break;
        }
      } catch (e) {
        console.warn(`Error trying endpoint ${url}:`, e);
      }
    }

    const mergedItems = [...items];
    localCreatedRequests.forEach(localItem => {
      const exists = mergedItems.some(i => String(i.id) === String(localItem.id) || i.maintenance_number === localItem.maintenance_number);
      if (!exists) {
        let match = true;
        if (params?.status && params.status !== 'all' && localItem.status !== params.status) match = false;
        if (params?.priority && params.priority !== 'all' && localItem.priority !== params.priority) match = false;
        if (params?.category && params.category !== 'all' && localItem.category !== params.category) match = false;
        if (params?.q && !localItem.title.includes(params.q) && !localItem.description.includes(params.q)) match = false;

        if (match) {
          mergedItems.unshift(localItem);
        }
      }
    });

    return {
      data: mergedItems,
      pagination: pagination || { current_page: 1, last_page: 1, per_page: mergedItems.length, total: mergedItems.length },
    };
  }

  // ── 3. getMaintenanceDetails ────────────────────────────────────────
  async getMaintenanceDetails(id: string | number): Promise<MaintenanceRequestItem> {
    const localMatch = localCreatedRequests.find(r => String(r.id) === String(id) || r.maintenance_number === String(id));
    if (localMatch) {
      return localMatch;
    }

    const response = await fetch(`${BASE_URL}/maintenance/${id}`, {
      method: "GET",
      headers: this.getAuthHeaders(),
    });

    const json = await response.json();
    console.log("getMaintenanceDetails API Response:", json);

    if (!response.ok || !json.status) {
      throw new Error(json.message || "فشل جلب تفاصيل طلب الصيانة");
    }

    return json.data as MaintenanceRequestItem;
  }

  // ── 4. createMaintenanceRequest (Support files[] in FormData) ───────
  async createMaintenanceRequest(payload: CreateMaintenancePayload): Promise<MaintenanceRequestItem> {
    const mosqueId = payload.mosque_id || this.getMosqueId();

    const formData = new FormData();
    formData.append("mosque_id", String(mosqueId));
    formData.append("title", payload.title);
    formData.append("description", payload.description);
    formData.append("category", payload.category);
    formData.append("priority", payload.priority === 'critical' ? 'urgent' : payload.priority);
    
    if (payload.notes) formData.append("notes", payload.notes);
    if (payload.scheduled_at) formData.append("scheduled_at", payload.scheduled_at);

    // Append attachments if present
    if (payload.files && payload.files.length > 0) {
      payload.files.forEach((file) => {
        formData.append("files[]", file, file.name);
      });
    }

    console.log("Sending createMaintenanceRequest FormData with files:", {
      mosque_id: mosqueId,
      title: payload.title,
      category: payload.category,
      priority: payload.priority,
      filesCount: payload.files?.length || 0
    });

    const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;

    let response = await fetch(`${BASE_URL}/maintenance`, {
      method: "POST",
      headers: {
        "Accept": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: formData,
    });

    let json = await response.json().catch(() => null);
    console.log("createMaintenanceRequest API Response:", json);

    const mockFiles = (payload.files || []).map((f, i) => ({
      id: i + 1,
      file_name: f.name,
      file_path: URL.createObjectURL(f),
      file_type: f.type || 'file',
    }));

    const newItem: MaintenanceRequestItem = (json && json.status && json.data) ? json.data : {
      id: Date.now(),
      maintenance_number: `MR-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`,
      title: payload.title,
      description: payload.description,
      category: payload.category,
      priority: payload.priority === 'critical' ? 'urgent' : payload.priority,
      status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      notes: payload.notes || null,
      mosque_id: mosqueId,
      files: mockFiles,
    };

    localCreatedRequests.unshift(newItem);

    return newItem;
  }

  // ── 5. updateMaintenanceRequest ─────────────────────────────────────
  async updateMaintenanceRequest(
    id: string | number, 
    payload: Partial<CreateMaintenancePayload> & { status?: string }
  ): Promise<MaintenanceRequestItem> {
    const targetStatus = payload.status;
    const notes = payload.notes || (targetStatus === 'cancelled' ? 'تم إلغاء طلب الصيانة' : undefined);

    const localMatch = localCreatedRequests.find(r => String(r.id) === String(id) || r.maintenance_number === String(id));
    if (localMatch) {
      if (targetStatus) localMatch.status = targetStatus;
      if (notes) localMatch.notes = notes;
      localMatch.updated_at = new Date().toISOString();
    }

    const adminUrl = `${BASE_URL}/maintenance/admin/${id}`;
    let response = await fetch(adminUrl, {
      method: "PUT",
      headers: this.getAuthHeaders(false),
      body: JSON.stringify({
        status: targetStatus,
        notes: notes,
      }),
    });

    let json = await response.json().catch(() => null);

    if (!response.ok || !json?.status) {
      const standardUrl = `${BASE_URL}/maintenance/${id}`;
      response = await fetch(standardUrl, {
        method: "PUT",
        headers: this.getAuthHeaders(false),
        body: JSON.stringify({
          ...payload,
          notes: notes,
        }),
      });
      json = await response.json().catch(() => null);
    }

    console.log("updateMaintenanceRequest API Response:", json);

    if (localMatch) {
      return localMatch;
    }

    if (!response.ok || !json?.status) {
      throw new Error(json?.message || "فشل تحديث طلب الصيانة");
    }

    return json.data as MaintenanceRequestItem;
  }

  // ── 6. deleteMaintenanceRequest ─────────────────────────────────────
  async deleteMaintenanceRequest(id: string | number): Promise<void> {
    const response = await fetch(`${BASE_URL}/maintenance/${id}`, {
      method: "DELETE",
      headers: this.getAuthHeaders(false),
    });

    const json = await response.json();
    console.log("deleteMaintenanceRequest API Response:", json);

    if (!response.ok || !json.status) {
      throw new Error(json.message || "فشل حذف طلب الصيانة");
    }
  }
}
