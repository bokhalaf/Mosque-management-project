// ==============================
// Data — SermonRepositoryImpl
// ==============================

import { 
  Sermon, 
  CreateSermonPayload, 
  SermonSelection, 
  StoreSermonSelectionPayload 
} from "../../domain/entities/Sermon";
import { ISermonRepository } from "../../domain/repositories/ISermonRepository";

export const BASE_URL = "https://mms-backend-rose.vercel.app/api";

const STORAGE_KEY_UPCOMING = "selected_friday_sermon_persistent";
const STORAGE_KEY_HISTORY = "sermon_selections_history_persistent";

export interface SermonCreateApiResponse {
  sermon: Sermon;
  httpStatus: number;
  endpointUrl: string;
  rawResponse: any;
}

export class SermonRepositoryImpl implements ISermonRepository {

  private getAuthHeaders(isFormData: boolean = false): HeadersInit {
    const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
    return {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      "Accept": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }

  // Helper to map API sermon format safely
  private formatSermon(item: any): Sermon {
    return {
      ...item,
      speaker_name: item.speaker_name || item.preacher || 'الشيخ الخطيب',
      sermon_date: item.sermon_date || item.date || item.created_at?.split('T')[0],
      content: item.content || item.description || item.notes || '',
      status: item.status || 'archived',
    };
  }

  // ── 1. getSermons (GET /api/sermons) ────────────────────────────────
  async getSermons(): Promise<Sermon[]> {
    try {
      const response = await fetch(`${BASE_URL}/sermons`, {
        method: "GET",
        headers: this.getAuthHeaders(),
      });

      const json = await response.json().catch(() => null);
      console.log("getSermons API Response:", json);

      if (response.ok && json && (json.status || Array.isArray(json.data) || Array.isArray(json))) {
        const items: any[] = Array.isArray(json) 
          ? json 
          : (Array.isArray(json.data) ? json.data : (json.data?.data || []));
        if (items.length > 0) {
          return items.map(item => this.formatSermon(item));
        }
      }
    } catch (e) {
      console.warn("Failed fetching sermons from API:", e);
    }
    return [];
  }

  // ── 2. getArchivedSermons (GET /api/sermons/archived) ───────────────
  async getArchivedSermons(): Promise<Sermon[]> {
    try {
      const response = await fetch(`${BASE_URL}/sermons/archived`, {
        method: "GET",
        headers: this.getAuthHeaders(),
      });

      const json = await response.json().catch(() => null);
      console.log("getArchivedSermons API Response:", json);

      if (response.ok && json && json.status !== false) {
        const items: any[] = Array.isArray(json)
          ? json
          : (Array.isArray(json.data) ? json.data : (json.data?.data || []));
        if (items.length > 0) {
          return items.map(item => ({ ...this.formatSermon(item), status: 'archived' }));
        }
      }
    } catch (e) {
      console.warn("Failed fetching archived sermons:", e);
    }

    return [];
  }

  // ── 3. getPendingSermons (GET /api/sermons/pending) ─────────────────
  async getPendingSermons(): Promise<Sermon[]> {
    try {
      const response = await fetch(`${BASE_URL}/sermons/pending`, {
        method: "GET",
        headers: this.getAuthHeaders(),
      });

      const json = await response.json().catch(() => null);
      console.log("getPendingSermons API Response:", json);

      if (response.ok && json && json.status !== false) {
        const items: any[] = Array.isArray(json)
          ? json
          : (Array.isArray(json.data) ? json.data : (json.data?.data || []));
        return items.map(item => ({ ...this.formatSermon(item), status: 'pending' }));
      }
    } catch (e) {
      console.warn("Failed fetching pending sermons:", e);
    }

    return [];
  }

  // ── 4. searchSermons (GET /api/sermons/search?q={query}) ───────────
  async searchSermons(query: string): Promise<Sermon[]> {
    if (!query || !query.trim()) return this.getArchivedSermons();

    try {
      const encoded = encodeURIComponent(query.trim());
      const response = await fetch(`${BASE_URL}/sermons/search?q=${encoded}`, {
        method: "GET",
        headers: this.getAuthHeaders(),
      });

      const json = await response.json().catch(() => null);
      console.log(`searchSermons (${query}) API Response:`, json);

      if (response.ok && json && json.status !== false) {
        const items: any[] = Array.isArray(json)
          ? json
          : (Array.isArray(json.data) ? json.data : (json.data?.data || []));
        if (items.length > 0) {
          return items.map(item => this.formatSermon(item));
        }
      }
    } catch (e) {
      console.warn("Failed searching sermons:", e);
    }

    // Local search fallback
    const all = await this.getArchivedSermons();
    const q = query.trim().toLowerCase();
    return all.filter(s => s.title.toLowerCase().includes(q) || (s.speaker_name && s.speaker_name.toLowerCase().includes(q)));
  }

  // ── 5. getSermonById (GET /api/sermons/{id}) ─────────────────────────
  async getSermonById(id: string | number): Promise<Sermon> {
    try {
      const response = await fetch(`${BASE_URL}/sermons/${id}`, {
        method: "GET",
        headers: this.getAuthHeaders(),
      });

      const json = await response.json().catch(() => null);
      console.log("getSermonById API Response:", json);

      if (response.ok && json && json.status) {
        return this.formatSermon(json.data);
      }
    } catch (e) {
      console.warn(`Failed fetching sermon #${id} from API:`, e);
    }

    const all = await this.getArchivedSermons();
    const match = all.find(s => String(s.id) === String(id));
    if (match) return match;

    throw new Error(`فشل جلب تفاصيل الخطبة #${id}`);
  }

  // ── 6. createSermon (POST /api/sermons) ─────────────────────────────
  async createSermon(payload: CreateSermonPayload): Promise<Sermon> {
    const resDebug = await this.createSermonWithDebug(payload);
    return resDebug.sermon;
  }

  async createSermonWithDebug(payload: CreateSermonPayload): Promise<SermonCreateApiResponse> {
    const todayStr = new Date().toISOString().split('T')[0];
    const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
    const endpointUrl = `${BASE_URL}/sermons`;

    let response: Response;
    let requestPayloadSent: any;

    if (payload.attachments && payload.attachments.length > 0) {
      const formData = new FormData();
      formData.append("title", payload.title);
      formData.append("content", payload.content);
      formData.append("speaker_name", payload.speaker_name);
      formData.append("sermon_date", payload.sermon_date || todayStr);
      if (payload.category) formData.append("category", payload.category);

      payload.attachments.forEach(file => {
        formData.append("attachments[]", file, file.name);
      });

      requestPayloadSent = {
        title: payload.title,
        speaker_name: payload.speaker_name,
        sermon_date: payload.sermon_date || todayStr,
        contentLength: payload.content.length,
        attachmentsCount: payload.attachments.length
      };

      response = await fetch(endpointUrl, {
        method: "POST",
        headers: {
          "Accept": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: formData,
      });
    } else {
      const jsonBody = {
        title: payload.title,
        content: payload.content,
        speaker_name: payload.speaker_name,
        sermon_date: payload.sermon_date || todayStr,
        category: payload.category || undefined,
      };

      requestPayloadSent = jsonBody;

      response = await fetch(endpointUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(jsonBody),
      });
    }

    const json = await response.json().catch(() => null);
    console.log("createSermon API Response:", json);

    const httpStatus = response.status;

    if (!response.ok || !json?.status) {
      const errorObj: any = new Error(
        json?.message || (json?.errors ? JSON.stringify(json.errors) : `خطأ من السيرفر (HTTP ${httpStatus})`)
      );
      errorObj.debugInfo = {
        httpStatus,
        endpointUrl,
        requestPayloadSent,
        rawResponse: json,
      };
      throw errorObj;
    }

    const sermon = this.formatSermon(json.data || json);
    return {
      sermon,
      httpStatus,
      endpointUrl,
      rawResponse: json,
    };
  }

  // ── 7. SERMON SELECTIONS API IMPLEMENTATION ─────────────────────────

  // 7.1 GET /api/sermon-selections/my (mySermonSelections) with fallback to /api/sermon-selections (indexSermonSelections)
  async getSermonSelections(params?: { from_date?: string; to_date?: string }): Promise<SermonSelection[]> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.from_date) queryParams.append("from_date", params.from_date);
      if (params?.to_date) queryParams.append("to_date", params.to_date);

      const queryString = queryParams.toString() ? `?${queryParams.toString()}` : "";
      
      // Try mySermonSelections endpoint first (/api/sermon-selections/my)
      let response = await fetch(`${BASE_URL}/sermon-selections/my${queryString}`, {
        method: "GET",
        headers: this.getAuthHeaders(),
      });

      let json = await response.json().catch(() => null);
      console.log(`GET /api/sermon-selections/my${queryString} Response:`, json);

      // Fallback to indexSermonSelections endpoint (/api/sermon-selections) if /my returns empty or error
      if (!response.ok || !json || json.status === false || (Array.isArray(json.data) && json.data.length === 0)) {
        const fallbackRes = await fetch(`${BASE_URL}/sermon-selections${queryString}`, {
          method: "GET",
          headers: this.getAuthHeaders(),
        });
        const fallbackJson = await fallbackRes.json().catch(() => null);
        console.log(`Fallback GET /api/sermon-selections${queryString} Response:`, fallbackJson);
        if (fallbackRes.ok && fallbackJson && fallbackJson.status !== false) {
          response = fallbackRes;
          json = fallbackJson;
        }
      }

      let selectionsList: SermonSelection[] = [];

      if (response.ok && json && json.status !== false) {
        const items: any[] = Array.isArray(json)
          ? json
          : (Array.isArray(json.data) ? json.data : (json.data?.data || []));

        if (items.length > 0) {
          selectionsList = items.map((item: any) => ({
            id: item.id,
            sermon_id: item.sermon_id || item.sermon?.id,
            selection_date: item.selection_date || item.date || item.created_at?.split('T')[0],
            notes: item.notes || null,
            sermon: item.sermon ? this.formatSermon(item.sermon) : undefined,
            created_at: item.created_at,
          }));

          if (typeof window !== "undefined" && !queryString) {
            localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(selectionsList));
          }
        }
      }

      if (selectionsList.length === 0 && typeof window !== "undefined") {
        const savedHistory = localStorage.getItem(STORAGE_KEY_HISTORY);
        if (savedHistory) {
          try {
            selectionsList = JSON.parse(savedHistory);
          } catch (e) {}
        }
      }

      // Filter by date range if provided
      if (params?.from_date || params?.to_date) {
        selectionsList = selectionsList.filter(item => {
          const itemDate = item.selection_date;
          if (!itemDate) return true;
          if (params.from_date && itemDate < params.from_date) return false;
          if (params.to_date && itemDate > params.to_date) return false;
          return true;
        });
      }

      return selectionsList;
    } catch (e) {
      console.warn("Error fetching sermon selections from API:", e);
      return [];
    }
  }

  // 7.2 GET /api/sermon-selections/upcoming (Upcoming Sermon Selection)
  async getUpcomingSermonSelection(): Promise<SermonSelection | null> {
    try {
      const response = await fetch(`${BASE_URL}/sermon-selections/upcoming`, {
        method: "GET",
        headers: this.getAuthHeaders(),
      });

      const json = await response.json().catch(() => null);
      console.log("GET /api/sermon-selections/upcoming Response:", json);

      if (response.ok && json && json.status !== false) {
        const data = json.data || json;
        if (data && (data.id || data.sermon_id)) {
          const selection: SermonSelection = {
            id: data.id || Date.now(),
            sermon_id: data.sermon_id || data.sermon?.id,
            selection_date: data.selection_date || data.date || new Date().toISOString().split('T')[0],
            notes: data.notes || null,
            sermon: data.sermon ? this.formatSermon(data.sermon) : undefined,
            created_at: data.created_at,
          };
          
          if (typeof window !== "undefined") {
            localStorage.setItem(STORAGE_KEY_UPCOMING, JSON.stringify(selection));
          }
          return selection;
        }
      }
    } catch (e) {
      console.warn("Error fetching upcoming sermon selection:", e);
    }

    // Fallback to persistent localStorage
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(STORAGE_KEY_UPCOMING);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {}
      }
    }

    return null;
  }

  // 7.3 POST /api/sermon-selections (Store Sermon Selection)
  async storeSermonSelection(payload: StoreSermonSelectionPayload): Promise<SermonSelection> {
    const todayStr = new Date().toISOString().split('T')[0];
    const bodyObj = {
      sermon_id: Number(payload.sermon_id),
      selection_date: payload.selection_date || todayStr,
      notes: payload.notes || undefined,
    };

    console.log("POST /api/sermon-selections Payload:", bodyObj);

    let createdSelection: SermonSelection | null = null;

    try {
      const response = await fetch(`${BASE_URL}/sermon-selections`, {
        method: "POST",
        headers: this.getAuthHeaders(false),
        body: JSON.stringify(bodyObj),
      });

      const json = await response.json().catch(() => null);
      console.log("POST /api/sermon-selections Response:", json);

      if (response.ok && json && json.status !== false) {
        const data = json.data || json;
        createdSelection = {
          id: data.id || Date.now(),
          sermon_id: payload.sermon_id,
          selection_date: payload.selection_date || todayStr,
          notes: payload.notes || null,
          sermon: data.sermon ? this.formatSermon(data.sermon) : undefined,
          created_at: new Date().toISOString(),
        };
      }
    } catch (e) {
      console.warn("Error storing sermon selection on API:", e);
    }

    const fallbackSelection: SermonSelection = createdSelection || {
      id: Date.now(),
      sermon_id: payload.sermon_id,
      selection_date: payload.selection_date || todayStr,
      notes: payload.notes || null,
      created_at: new Date().toISOString(),
    };

    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY_UPCOMING, JSON.stringify(fallbackSelection));

      // Append to history list
      const savedHistory = localStorage.getItem(STORAGE_KEY_HISTORY);
      let historyList: SermonSelection[] = [];
      if (savedHistory) {
        try { historyList = JSON.parse(savedHistory); } catch (e) {}
      }
      historyList.unshift(fallbackSelection);
      localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(historyList));
    }

    return fallbackSelection;
  }

  // 7.4 DELETE /api/sermon-selections/{id} (Delete Sermon Selection)
  async deleteSermonSelection(id: string | number): Promise<void> {
    try {
      const response = await fetch(`${BASE_URL}/sermon-selections/${id}`, {
        method: "DELETE",
        headers: this.getAuthHeaders(false),
      });

      const json = await response.json().catch(() => null);
      console.log(`DELETE /api/sermon-selections/${id} Response:`, json);
    } catch (e) {
      console.warn(`Error deleting sermon selection #${id}:`, e);
    }

    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEY_UPCOMING);

      const savedHistory = localStorage.getItem(STORAGE_KEY_HISTORY);
      if (savedHistory) {
        try {
          let historyList: SermonSelection[] = JSON.parse(savedHistory);
          historyList = historyList.filter(s => String(s.id) !== String(id));
          localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(historyList));
        } catch (e) {}
      }
    }
  }
}
