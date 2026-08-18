// ==============================
// Data — DawahProgramRepositoryImpl (Direct Server API Persistence)
// ==============================

import {
  DawahProgram,
  ProgramSchedule,
  CreateDawahProgramPayload,
  UpdateDawahProgramPayload,
  CreateProgramSchedulePayload,
  UpdateProgramSchedulePayload,
  DawahProgramStats,
  MosqueSpace,
  MyMosqueDetails,
  DawahPaginatedResponse,
} from "../../domain/entities/DawahProgram";
import { IDawahProgramRepository } from "../../domain/repositories/IDawahProgramRepository";

const BASE_URL = "https://mms-backend-rose.vercel.app/api";

export class DawahProgramRepositoryImpl implements IDawahProgramRepository {
  private programsMosqueMap = new Map<number | string, number>();

  private getAuthHeaders(): HeadersInit {
    const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
    return {
      "Content-Type": "application/json",
      "Accept": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }

  private getMosqueId(): number {
    if (typeof window !== "undefined") {
      const activeMosque = localStorage.getItem("active_mosque_id");
      if (activeMosque && !isNaN(Number(activeMosque))) return Number(activeMosque);

      const userStr = localStorage.getItem("auth_user");
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          if (user.mosque_id) return Number(user.mosque_id);
          if (user.mosque?.id) return Number(user.mosque.id);
        } catch (e) {}
      }
    }
    return 1;
  }

  // ── 1. getDawahPrograms (Live API Fetch from Server) ─────────────────────
  async getDawahPrograms(params?: { mosque_id?: number; status?: string; type?: string; q?: string }): Promise<DawahProgram[]> {
    const mosqueId = params?.mosque_id || this.getMosqueId();
    const rawItems: any[] = [];

    try {
      const [allRes, mosqueRes] = await Promise.all([
        fetch(`${BASE_URL}/program/dawah_programs`, { headers: this.getAuthHeaders() }).catch(() => null),
        fetch(`${BASE_URL}/program/mosques/${mosqueId}/dawah_programs`, { headers: this.getAuthHeaders() }).catch(() => null),
      ]);

      if (mosqueRes && mosqueRes.ok) {
        const json = await mosqueRes.json();
        if (json.status && Array.isArray(json.data)) {
          rawItems.push(...json.data);
        } else if (Array.isArray(json)) {
          rawItems.push(...json);
        }
      }

      if (allRes && allRes.ok) {
        const json = await allRes.json();
        if (json.status && Array.isArray(json.data)) {
          rawItems.push(...json.data);
        } else if (Array.isArray(json)) {
          rawItems.push(...json);
        }
      }
    } catch (e) {
      console.error("Error fetching live dawah programs from server:", e);
    }

    // Deduplicate and format items directly from live server API
    const map = new Map<number | string, DawahProgram>();
    rawItems.forEach((item: any) => {
      if (item && item.id) {
        const pMosqueId = Number(item.mosque_id || mosqueId);
        this.programsMosqueMap.set(item.id, pMosqueId);
        map.set(item.id, {
          id: item.id,
          mosque_id: pMosqueId,
          space_id: item.space_id || 1,
          program_name: item.program_name || item.name || "برنامج دعوي",
          description: item.description || "",
          type: (item.type as any) || "lecture",
          image: item.image || item.image_url || null,
          presenter: item.presenter || "المحاضر",
          presenter_image: item.presenter_image || null,
          is_featured: !!item.is_featured,
          status: (item.status as any) || "active",
          level: (item.level as any) || "beginner",
          schedules: item.schedules || [],
          created_at: item.created_at,
          updated_at: item.updated_at,
        });
      }
    });

    let result = Array.from(map.values());

    if (params?.status && params.status !== "all") {
      result = result.filter(p => p.status === params.status);
    }
    if (params?.type && params.type !== "all") {
      const targetType = params.type;
      result = result.filter(p => {
        if (targetType === 'competition' || targetType === 'compition') {
          return p.type === 'competition' || (p.type as string) === 'compition';
        }
        return p.type === targetType;
      });
    }
    if (params?.q && params.q.trim()) {
      const q = params.q.trim().toLowerCase();
      result = result.filter(p =>
        p.program_name.toLowerCase().includes(q) ||
        p.presenter.toLowerCase().includes(q) ||
        (p.description && p.description.toLowerCase().includes(q))
      );
    }

    // Populate live schedules from server in parallel for each program
    const populated = await Promise.all(
      result.map(async (p) => {
        try {
          if (Array.isArray(p.schedules) && p.schedules.length > 0) {
            return p;
          }
          const schedules = await this.getSchedules(p.id);
          return {
            ...p,
            schedules: schedules || [],
          };
        } catch {
          return p;
        }
      })
    );

    return populated;
  }

  private mapProgramItem(item: any, defaultMosqueId: number): DawahProgram {
    const pMosqueId = Number(item.mosque_id || defaultMosqueId);
    if (item.id) {
      this.programsMosqueMap.set(item.id, pMosqueId);
    }
    return {
      id: item.id,
      mosque_id: pMosqueId,
      space_id: item.space_id || 1,
      program_name: item.program_name || item.name || "برنامج دعوي",
      description: item.description || "",
      type: (item.type as any) || "lecture",
      image: item.image || item.image_url || null,
      presenter: item.presenter || "المحاضر",
      presenter_image: item.presenter_image || null,
      is_featured: !!item.is_featured,
      status: (item.status as any) || "active",
      level: (item.level as any) || "beginner",
      schedules: item.schedules || [],
      created_at: item.created_at,
      updated_at: item.updated_at,
    };
  }

  async getDawahProgramsPaginated(params?: { mosque_id?: number; status?: string; type?: string; q?: string; page?: number; per_page?: number }): Promise<DawahPaginatedResponse> {
    const page = params?.page || 1;
    const perPage = params?.per_page || 6;
    const mosqueId = params?.mosque_id || this.getMosqueId();

    try {
      const queryParams = new URLSearchParams();
      queryParams.set('page', String(page));
      queryParams.set('per_page', String(perPage));
      if (params?.status && params.status !== 'all') queryParams.set('status', params.status);
      if (params?.type && params.type !== 'all') queryParams.set('type', params.type);
      if (params?.q && params.q.trim()) queryParams.set('q', params.q.trim());

      const res = await fetch(`${BASE_URL}/program/mosques/${mosqueId}/dawah_programs?${queryParams.toString()}`, {
        headers: this.getAuthHeaders(),
      });

      if (res.ok) {
        const json = await res.json();
        const rawItems = json.data || json;
        const itemsArray = Array.isArray(rawItems) ? rawItems : Array.isArray(rawItems.data) ? rawItems.data : [];

        const meta = json.pagination || json.meta || json.data?.pagination || {};
        const currentPage = Number(meta.current_page || meta.currentPage || page);
        const lastPage = Number(meta.last_page || meta.lastPage || Math.ceil((meta.total || itemsArray.length) / perPage) || 1);
        const total = Number(meta.total ?? itemsArray.length);

        if (itemsArray.length > 0) {
          const mapped = itemsArray.map((item: any) => this.mapProgramItem(item, mosqueId));
          return {
            data: mapped,
            pagination: {
              currentPage,
              lastPage: Math.max(1, lastPage),
              total,
              perPage,
            },
          };
        }
      }
    } catch (e) {
      console.warn("API getDawahProgramsPaginated error:", e);
    }

    const all = await this.getDawahPrograms(params);
    const total = all.length;
    const lastPage = Math.max(1, Math.ceil(total / perPage));
    const startIndex = (page - 1) * perPage;

    return {
      data: all.slice(startIndex, startIndex + perPage),
      pagination: {
        currentPage: page,
        lastPage,
        total,
        perPage,
      },
    };
  }

  async getDawahProgramById(id: number | string): Promise<DawahProgram | null> {
    const mosqueId = this.programsMosqueMap.get(id) || this.getMosqueId();
    try {
      const res = await fetch(`${BASE_URL}/program/mosques/${mosqueId}/dawah_programs/${id}`, {
        headers: this.getAuthHeaders(),
      });
      if (res.ok) {
        const json = await res.json();
        const item = json.data || json;
        if (item && item.id) {
          return {
            id: item.id,
            mosque_id: Number(item.mosque_id || mosqueId),
            space_id: item.space_id || 1,
            program_name: item.program_name || item.name || "",
            description: item.description || "",
            type: item.type || "lecture",
            image: item.image || null,
            presenter: item.presenter || "",
            presenter_image: item.presenter_image || null,
            is_featured: !!item.is_featured,
            status: item.status || "active",
            level: item.level || "beginner",
            schedules: item.schedules || [],
            created_at: item.created_at,
            updated_at: item.updated_at,
          };
        }
      }
    } catch (e) {
      console.warn("getDawahProgramById error:", e);
    }
    return null;
  }

  // ── 2. createDawahProgram (POST /api/program/mosques/{mosque}/dawah_programs) ─
  async createDawahProgram(payload: CreateDawahProgramPayload): Promise<DawahProgram> {
    const mosqueId = payload.mosque_id || this.getMosqueId();
    const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;

    let spaceId = payload.space_id;
    if (!spaceId || isNaN(Number(spaceId))) {
      try {
        const spaces = await this.getMosqueSpaces(mosqueId);
        if (spaces && spaces.length > 0) {
          spaceId = spaces[0].id;
        }
      } catch (e) {}
    }
    if (!spaceId) spaceId = 1;

    const todayStr = new Date().toISOString().split('T')[0];
    const defaultSchedules = payload.schedules && payload.schedules.length > 0
      ? payload.schedules
      : [{
          title: "الجلسة الافتتاحية",
          notes: "المقدمة والتعريف بالبرنامج",
          date: todayStr,
          start_time: "16:30",
          end_time: "18:00",
        }];

    const formData = new FormData();
    formData.append("space_id", String(spaceId));
    formData.append("program_name", payload.program_name);
    formData.append("presenter", payload.presenter);
    formData.append("type", payload.type);
    formData.append("level", payload.level || "beginner");
    formData.append("status", payload.status || "active");
    if (payload.description) {
      formData.append("description", payload.description);
    }
    formData.append("is_featured", payload.is_featured ? "1" : "0");

    defaultSchedules.forEach((s, idx) => {
      if (s.title) formData.append(`schedules[${idx}][title]`, s.title);
      if (s.notes) formData.append(`schedules[${idx}][notes]`, s.notes);
      formData.append(`schedules[${idx}][date]`, s.date);
      formData.append(`schedules[${idx}][start_time]`, s.start_time);
      formData.append(`schedules[${idx}][end_time]`, s.end_time);
    });

    const headers: HeadersInit = {
      "Accept": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };

    const response = await fetch(`${BASE_URL}/program/mosques/${mosqueId}/dawah_programs`, {
      method: "POST",
      headers,
      body: formData,
    });
    const json = await response.json().catch(() => null);

    if (!response.ok || !json || (!json.status && !json.data)) {
      let errMsgs = "";
      if (json?.data && typeof json.data === 'object' && !Array.isArray(json.data)) {
        errMsgs = Object.entries(json.data)
          .map(([field, msgs]) => `${field}: ${Array.isArray(msgs) ? msgs.join(', ') : msgs}`)
          .join(" | ");
      } else if (json?.errors && typeof json.errors === 'object') {
        errMsgs = Object.entries(json.errors)
          .map(([field, msgs]) => `${field}: ${Array.isArray(msgs) ? msgs.join(', ') : msgs}`)
          .join(" | ");
      }
      throw new Error(errMsgs || json?.message || `فشل إنشاء البرنامج على السيرفر (HTTP ${response.status})`);
    }

    const item = json.data || json;
    const createdId = item.id;
    const finalMosqueId = Number(item.mosque_id || mosqueId);
    if (createdId) {
      this.programsMosqueMap.set(createdId, finalMosqueId);
    }

    return {
      id: createdId,
      mosque_id: finalMosqueId,
      space_id: Number(item.space_id || spaceId),
      program_name: item.program_name || payload.program_name,
      description: item.description || payload.description,
      type: item.type || payload.type,
      presenter: item.presenter || payload.presenter,
      is_featured: item.is_featured === true || item.is_featured === 'true' || item.is_featured === 1,
      status: item.status || payload.status || "active",
      level: item.level || payload.level || "beginner",
      schedules: item.schedules || defaultSchedules,
      created_at: item.created_at || new Date().toISOString(),
      updated_at: item.updated_at,
    };
  }

  // ── 3. updateDawahProgram (POST /api/program/mosques/{mosque}/dawah_programs/{program}) ─
  async updateDawahProgram(id: number | string, payload: UpdateDawahProgramPayload): Promise<DawahProgram> {
    const mosqueId = payload.mosque_id || this.programsMosqueMap.get(id) || this.getMosqueId();
    const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;

    const formData = new FormData();
    formData.append("_method", "PUT");
    if (payload.space_id) formData.append("space_id", String(payload.space_id));
    if (payload.program_name) formData.append("program_name", payload.program_name);
    if (payload.presenter) formData.append("presenter", payload.presenter);
    if (payload.type) formData.append("type", payload.type);
    if (payload.level) formData.append("level", payload.level);
    if (payload.status) formData.append("status", payload.status);
    if (payload.description !== undefined) formData.append("description", payload.description || "");
    if (payload.is_featured !== undefined) {
      formData.append("is_featured", payload.is_featured ? "1" : "0");
    }

    if (payload.schedules && payload.schedules.length > 0) {
      payload.schedules.forEach((s, idx) => {
        if (s.title) formData.append(`schedules[${idx}][title]`, s.title);
        if (s.notes) formData.append(`schedules[${idx}][notes]`, s.notes);
        formData.append(`schedules[${idx}][date]`, s.date);
        formData.append(`schedules[${idx}][start_time]`, s.start_time);
        formData.append(`schedules[${idx}][end_time]`, s.end_time);
      });
    }

    const headers: HeadersInit = {
      "Accept": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };

    let response = await fetch(`${BASE_URL}/program/mosques/${mosqueId}/dawah_programs/${id}`, {
      method: "POST",
      headers,
      body: formData,
    });

    // Fallback if mosqueId was not matching
    if (!response.ok && response.status === 404) {
      const altMosqueId = this.getMosqueId();
      if (altMosqueId !== mosqueId) {
        response = await fetch(`${BASE_URL}/program/mosques/${altMosqueId}/dawah_programs/${id}`, {
          method: "POST",
          headers,
          body: formData,
        });
      }
    }

    const json = await response.json().catch(() => null);

    if (!response.ok || !json || (!json.status && !json.data)) {
      let errMsgs = "";
      if (json?.data && typeof json.data === 'object' && !Array.isArray(json.data)) {
        errMsgs = Object.entries(json.data)
          .map(([field, msgs]) => `${field}: ${Array.isArray(msgs) ? msgs.join(', ') : msgs}`)
          .join(" | ");
      } else if (json?.errors && typeof json.errors === 'object') {
        errMsgs = Object.entries(json.errors)
          .map(([field, msgs]) => `${field}: ${Array.isArray(msgs) ? msgs.join(', ') : msgs}`)
          .join(" | ");
      }
      throw new Error(errMsgs || json?.message || `فشل تعديل البرنامج على السيرفر (HTTP ${response.status})`);
    }

    const item = json.data || json;
    return {
      id: item.id || id,
      mosque_id: Number(item.mosque_id || mosqueId),
      space_id: Number(item.space_id || payload.space_id || 1),
      program_name: item.program_name || payload.program_name || "",
      description: item.description || payload.description || "",
      type: item.type || payload.type || "lecture",
      presenter: item.presenter || payload.presenter || "",
      is_featured: item.is_featured === true || item.is_featured === 'true' || item.is_featured === 1,
      status: item.status || payload.status || "active",
      level: item.level || payload.level || "beginner",
      schedules: item.schedules || [],
      created_at: item.created_at,
      updated_at: item.updated_at || new Date().toISOString(),
    };
  }

  // ── 4. deleteDawahProgram (DELETE /api/program/mosques/{mosque}/dawah_programs/{program}) ─
  async deleteDawahProgram(id: number | string): Promise<boolean> {
    const mosqueId = this.programsMosqueMap.get(id) || this.getMosqueId();

    let response = await fetch(`${BASE_URL}/program/mosques/${mosqueId}/dawah_programs/${id}`, {
      method: "DELETE",
      headers: this.getAuthHeaders(),
    });

    if (!response.ok && (response.status === 404 || response.status === 403)) {
      const fallbackMosqueId = this.getMosqueId();
      if (fallbackMosqueId !== mosqueId) {
        const retryRes = await fetch(`${BASE_URL}/program/mosques/${fallbackMosqueId}/dawah_programs/${id}`, {
          method: "DELETE",
          headers: this.getAuthHeaders(),
        });
        if (retryRes.ok) {
          this.programsMosqueMap.delete(id);
          return true;
        }
      }
    }

    const json = await response.json().catch(() => null);
    if (!response.ok) {
      throw new Error(json?.message || `فشل حذف البرنامج من السيرفر (HTTP ${response.status})`);
    }
    this.programsMosqueMap.delete(id);
    return true;
  }

  // ── 5. Schedules Endpoints (Direct Server API Persistence) ─────────────
  async getSchedules(programId: number | string): Promise<ProgramSchedule[]> {
    const response = await fetch(`${BASE_URL}/program/dawah_programs/${programId}/schedules`, {
      headers: this.getAuthHeaders(),
    });
    if (response.ok) {
      const json = await response.json();
      let items: any[] = [];
      if (Array.isArray(json.data)) {
        items = json.data;
      } else if (json.data && Array.isArray(json.data.data)) {
        items = json.data.data;
      } else if (Array.isArray(json)) {
        items = json;
      }
      return items;
    }

    const program = await this.getDawahProgramById(programId);
    return program?.schedules || [];
  }

  async addSchedule(programId: number | string, payload: CreateProgramSchedulePayload): Promise<ProgramSchedule> {
    const mosqueId = this.getMosqueId();

    const response = await fetch(`${BASE_URL}/program/mosques/${mosqueId}/dawah_programs/${programId}/schedules`, {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    const json = await response.json().catch(() => null);
    if (!response.ok || !json || (!json.status && !json.data && !json.id)) {
      let errMsgs = "";
      if (json?.data && typeof json.data === 'object' && !Array.isArray(json.data)) {
        errMsgs = Object.entries(json.data)
          .map(([field, msgs]) => `${field}: ${Array.isArray(msgs) ? msgs.join(', ') : msgs}`)
          .join(" | ");
      } else if (json?.errors && typeof json.errors === 'object') {
        errMsgs = Object.entries(json.errors)
          .map(([field, msgs]) => `${field}: ${Array.isArray(msgs) ? msgs.join(', ') : msgs}`)
          .join(" | ");
      }
      throw new Error(errMsgs || json?.message || `فشل إضافة الجلسة على السيرفر (HTTP ${response.status})`);
    }

    return json.data || json;
  }

  async updateSchedule(programId: number | string, scheduleId: number | string, payload: UpdateProgramSchedulePayload): Promise<ProgramSchedule> {
    const mosqueId = this.getMosqueId();

    const response = await fetch(`${BASE_URL}/program/mosques/${mosqueId}/dawah_programs/${programId}/schedules/${scheduleId}`, {
      method: "PUT",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    const json = await response.json().catch(() => null);
    if (!response.ok || !json || (!json.status && !json.data && !json.id)) {
      let errMsgs = "";
      if (json?.data && typeof json.data === 'object' && !Array.isArray(json.data)) {
        errMsgs = Object.entries(json.data)
          .map(([field, msgs]) => `${field}: ${Array.isArray(msgs) ? msgs.join(', ') : msgs}`)
          .join(" | ");
      } else if (json?.errors && typeof json.errors === 'object') {
        errMsgs = Object.entries(json.errors)
          .map(([field, msgs]) => `${field}: ${Array.isArray(msgs) ? msgs.join(', ') : msgs}`)
          .join(" | ");
      }
      throw new Error(errMsgs || json?.message || `فشل تحديث الجلسة على السيرفر (HTTP ${response.status})`);
    }

    return json.data || json;
  }

  async deleteSchedule(programId: number | string, scheduleId: number | string): Promise<boolean> {
    const mosqueId = this.getMosqueId();

    const response = await fetch(`${BASE_URL}/program/mosques/${mosqueId}/dawah_programs/${programId}/schedules/${scheduleId}`, {
      method: "DELETE",
      headers: this.getAuthHeaders(),
    });
    const json = await response.json().catch(() => null);
    if (!response.ok) {
      throw new Error(json?.message || `فشل حذف الجلسة من السيرفر (HTTP ${response.status})`);
    }
    return true;
  }

  // ── 6. Stats & Mosque Spaces ──────────────────────────────────────────
  async getStats(): Promise<DawahProgramStats> {
    const list = await this.getDawahPrograms();
    return {
      total_programs: list.length,
      active_programs: list.filter(p => p.status === "active").length,
      total_lectures: list.filter(p => p.type === "lecture").length,
      total_courses: list.filter(p => p.type === "course").length,
      total_competitions: list.filter(p => p.type === "compition" || (p.type as string) === "competition").length,
      featured_count: list.filter(p => p.is_featured).length,
    };
  }

  async getMyMosque(): Promise<MyMosqueDetails | null> {
    try {
      const response = await fetch(`${BASE_URL}/mosques/mine`, {
        headers: this.getAuthHeaders(),
      });
      const json = await response.json();
      if (response.ok && json.status && Array.isArray(json.data) && json.data.length > 0) {
        const item = json.data[0];
        const details: MyMosqueDetails = {
          id: item.id,
          name: item.name,
          city: item.city,
          district: item.district,
          spaces: item.spaces || [],
        };
        if (typeof window !== "undefined" && item.id) {
          localStorage.setItem("active_mosque_id", String(item.id));
        }
        return details;
      }
    } catch (e) {
      console.warn("Failed to fetch /mosques/mine:", e);
    }
    return null;
  }

  async getMosqueSpaces(mosqueId?: number): Promise<MosqueSpace[]> {
    const id = mosqueId || this.getMosqueId();
    try {
      const response = await fetch(`${BASE_URL}/mosques/${id}/spaces`, {
        headers: this.getAuthHeaders(),
      });
      const json = await response.json();
      if (response.ok && json.status && Array.isArray(json.data)) {
        return json.data;
      }
    } catch (e) {
      console.warn("Failed to fetch spaces:", e);
    }

    const myMosque = await this.getMyMosque();
    if (myMosque && myMosque.spaces && myMosque.spaces.length > 0) {
      return myMosque.spaces;
    }

    return [
      { id: 1, name: "المصلى الرئيسي للرجال", capacity: 500 },
      { id: 2, name: "مكتبة المسجد وقاعة المحاضرات", capacity: 60 },
      { id: 3, name: "مصلى النساء", capacity: 150 },
    ];
  }
}
