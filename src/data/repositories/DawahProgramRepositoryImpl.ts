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

export const BASE_URL = "https://mms-backend-rose.vercel.app/api";

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

  private checkIsSuperAdmin(): boolean {
    if (typeof window !== "undefined") {
      try {
        const userStr = localStorage.getItem("auth_user");
        if (userStr) {
          const user = JSON.parse(userStr);
          const roles: string[] = Array.isArray(user.roles) ? user.roles : (user.role ? [user.role] : []);
          if (roles.includes("super_admin") || Boolean(user.is_super_admin)) {
            return true;
          }
        }
      } catch (e) {}
    }
    return false;
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

  private mapProgramItem(item: any, defaultMosqueId: number): DawahProgram {
    const pMosqueId = Number(item.mosque_id || item.mosque?.id || defaultMosqueId);
    if (item.id) {
      this.programsMosqueMap.set(item.id, pMosqueId);
    }
    return {
      id: item.id,
      mosque_id: pMosqueId,
      mosque_name: item.mosque?.name || item.mosque_name,
      mosque: item.mosque,
      space_id: item.space_id || 1,
      space_name: item.space?.name || item.space_name,
      program_name: item.program_name || item.name || "برنامج دعوي",
      description: item.description || "",
      type: (item.type as any) || "lecture",
      image: item.image || item.image_url || null,
      presenter: item.presenter || "المحاضر",
      presenter_image: item.presenter_image || null,
      is_featured: !!item.is_featured,
      status: (item.status as any) || "active",
      level: (item.level as any) || "beginner",
      schedules: Array.isArray(item.schedules) ? item.schedules : [],
      created_at: item.created_at,
      updated_at: item.updated_at,
    };
  }

  // ── 1. getDawahPrograms (Live API Fetch from Server) ─────────────────────
  async getDawahPrograms(params?: { mosque_id?: number; status?: string; type?: string; q?: string }): Promise<DawahProgram[]> {
    const isSuperAdmin = this.checkIsSuperAdmin();
    const mosqueId = params?.mosque_id || this.getMosqueId();
    const rawItems: any[] = [];

    try {
      if (isSuperAdmin) {
        // Super Admin gets all programs across all mosques: GET /program/dawah_programs
        const res = await fetch(`${BASE_URL}/program/dawah_programs?per_page=50`, {
          headers: this.getAuthHeaders(),
        }).catch(() => null);

        if (res && res.ok) {
          const json = await res.json();
          const dataObj = json.data || json;
          const items = Array.isArray(dataObj) ? dataObj : (Array.isArray(dataObj.data) ? dataObj.data : []);
          rawItems.push(...items);
        }
      } else {
        // Mosque Manager gets programs for their mosque: GET /program/mosques/{mosque}/dawah_programs
        const res = await fetch(`${BASE_URL}/program/mosques/${mosqueId}/dawah_programs`, {
          headers: this.getAuthHeaders(),
        }).catch(() => null);

        if (res && res.ok) {
          const json = await res.json();
          const dataObj = json.data || json;
          const items = Array.isArray(dataObj) ? dataObj : (Array.isArray(dataObj.data) ? dataObj.data : []);
          rawItems.push(...items);
        }
      }
    } catch (e) {
      console.error("Error fetching live dawah programs from server:", e);
    }

    // Deduplicate and format items directly from live server API
    const map = new Map<number | string, DawahProgram>();
    rawItems.forEach((item: any) => {
      if (item && item.id) {
        const mapped = this.mapProgramItem(item, mosqueId);
        map.set(item.id, mapped);
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
        (p.description && p.description.toLowerCase().includes(q)) ||
        (p.mosque_name && p.mosque_name.toLowerCase().includes(q))
      );
    }

    return result;
  }

  // ── 2. getDawahProgramsPaginated (Server Paginated) ───────────────────────
  async getDawahProgramsPaginated(params?: { mosque_id?: number; status?: string; type?: string; q?: string; page?: number; per_page?: number }): Promise<DawahPaginatedResponse> {
    const page = params?.page || 1;
    const perPage = params?.per_page || 6;
    const isSuperAdmin = this.checkIsSuperAdmin();
    const mosqueId = params?.mosque_id || this.getMosqueId();

    try {
      const queryParams = new URLSearchParams();
      queryParams.set('page', String(page));
      queryParams.set('per_page', String(perPage));
      if (params?.type && params.type !== 'all') {
        queryParams.set('type', params.type === 'competition' ? 'course' : params.type);
      }
      if (params?.q && params.q.trim()) {
        queryParams.set('q', params.q.trim());
      }

      // Endpoint:
      // Super Admin: GET /program/dawah_programs (getAllDawahPrograms)
      // Mosque Manager: GET /program/mosques/{mosque}/dawah_programs (getMosqueDawahPrograms)
      const url = isSuperAdmin
        ? `${BASE_URL}/program/dawah_programs?${queryParams.toString()}`
        : `${BASE_URL}/program/mosques/${mosqueId}/dawah_programs?${queryParams.toString()}`;

      console.log(`Fetching Dawah Programs: ${url}`);
      const res = await fetch(url, {
        headers: this.getAuthHeaders(),
      });

      if (res.ok) {
        const json = await res.json();
        console.log(`Dawah Programs Response from ${url}:`, json);
        const dataObj = json.data || json;
        const itemsArray = Array.isArray(dataObj) ? dataObj : (Array.isArray(dataObj.data) ? dataObj.data : []);

        const currentPage = Number(dataObj.current_page || json.current_page || json.pagination?.currentPage || page);
        const lastPage = Number(dataObj.last_page || json.last_page || json.pagination?.totalPages || Math.max(1, Math.ceil((dataObj.total || itemsArray.length) / perPage)));
        const total = Number(dataObj.total ?? json.total ?? itemsArray.length);

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

  // ── 3. getDawahProgramById ───────────────────────────────────────────────
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
          return this.mapProgramItem(item, mosqueId);
        }
      }
    } catch (e) {
      console.warn(`Error fetching program #${id}:`, e);
    }

    const all = await this.getDawahPrograms();
    return all.find(p => String(p.id) === String(id)) || null;
  }

  // ── 4. createDawahProgram ────────────────────────────────────────────────
  async createDawahProgram(payload: CreateDawahProgramPayload): Promise<DawahProgram> {
    const mosqueId = payload.mosque_id || this.getMosqueId();
    const bodyObj: any = {
      program_name: payload.program_name,
      description: payload.description || "",
      type: payload.type,
      presenter: payload.presenter,
      space_id: payload.space_id || 1,
      status: payload.status || "active",
      level: payload.level || "beginner",
      is_featured: Boolean(payload.is_featured),
    };

    console.log(`POST /program/mosques/${mosqueId}/dawah_programs Payload:`, bodyObj);

    const response = await fetch(`${BASE_URL}/program/mosques/${mosqueId}/dawah_programs`, {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(bodyObj),
    });

    const json = await response.json().catch(() => null);
    console.log(`POST /program/mosques/${mosqueId}/dawah_programs Response:`, json);

    if (response.ok && json && json.status !== false) {
      const item = json.data || json;
      const created = this.mapProgramItem(item, mosqueId);

      // If payload has initial schedules, create them
      if (payload.schedules && payload.schedules.length > 0) {
        for (const s of payload.schedules) {
          try {
            await this.addSchedule(created.id, s);
          } catch (err) {
            console.warn("Failed to add initial schedule:", err);
          }
        }
      }

      return created;
    }

    const errMsg = json?.message || (json?.errors ? Object.values(json.errors).flat().join(', ') : `فشل إنشاء البرنامج الدعوي (HTTP ${response.status})`);
    const err: any = new Error(errMsg);
    err.serverResponse = json;
    throw err;
  }

  // ── 5. updateDawahProgram ────────────────────────────────────────────────
  async updateDawahProgram(id: number | string, payload: UpdateDawahProgramPayload): Promise<DawahProgram> {
    const mosqueId = this.programsMosqueMap.get(id) || payload.mosque_id || this.getMosqueId();
    const bodyObj: any = {
      ...(payload.program_name ? { program_name: payload.program_name } : {}),
      ...(payload.description !== undefined ? { description: payload.description } : {}),
      ...(payload.type ? { type: payload.type } : {}),
      ...(payload.presenter ? { presenter: payload.presenter } : {}),
      ...(payload.space_id ? { space_id: payload.space_id } : {}),
      ...(payload.status ? { status: payload.status } : {}),
      ...(payload.level ? { level: payload.level } : {}),
      ...(payload.is_featured !== undefined ? { is_featured: payload.is_featured } : {}),
    };

    console.log(`POST /program/mosques/${mosqueId}/dawah_programs/${id} Payload:`, bodyObj);

    const response = await fetch(`${BASE_URL}/program/mosques/${mosqueId}/dawah_programs/${id}`, {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(bodyObj),
    });

    const json = await response.json().catch(() => null);
    console.log(`POST /program/mosques/${mosqueId}/dawah_programs/${id} Response:`, json);

    if (response.ok && json && json.status !== false) {
      const item = json.data || json;
      return this.mapProgramItem(item, mosqueId);
    }

    const errMsg = json?.message || (json?.errors ? Object.values(json.errors).flat().join(', ') : `فشل تحديث البرنامج الدعوي (HTTP ${response.status})`);
    const err: any = new Error(errMsg);
    err.serverResponse = json;
    throw err;
  }

  // ── 6. deleteDawahProgram ────────────────────────────────────────────────
  async deleteDawahProgram(id: number | string): Promise<boolean> {
    const mosqueId = this.programsMosqueMap.get(id) || this.getMosqueId();
    const response = await fetch(`${BASE_URL}/program/mosques/${mosqueId}/dawah_programs/${id}`, {
      method: "DELETE",
      headers: this.getAuthHeaders(),
    });

    const json = await response.json().catch(() => null);
    console.log(`DELETE /program/mosques/${mosqueId}/dawah_programs/${id} Response:`, json);

    if (response.ok && json?.status !== false) {
      return true;
    }
    return false;
  }

  // ── 7. getSchedules ──────────────────────────────────────────────────────
  async getSchedules(programId: number | string): Promise<ProgramSchedule[]> {
    try {
      const response = await fetch(`${BASE_URL}/program/dawah_programs/${programId}/schedules?per_page=50`, {
        headers: this.getAuthHeaders(),
      });
      if (response.ok) {
        const json = await response.json();
        const dataObj = json.data || json;
        const items = Array.isArray(dataObj) ? dataObj : (Array.isArray(dataObj.data) ? dataObj.data : []);
        return items.map((s: any) => ({
          id: s.id,
          dawah_program_id: s.dawah_program_id || programId,
          title: s.title || "",
          notes: s.notes || "",
          date: s.date ? s.date.split("T")[0] : s.date,
          start_time: s.start_time || "09:00",
          end_time: s.end_time || "10:00",
          created_at: s.created_at,
          updated_at: s.updated_at,
        }));
      }
    } catch (e) {
      console.warn(`Error fetching schedules for program #${programId}:`, e);
    }
    return [];
  }

  // ── 8. addSchedule ───────────────────────────────────────────────────────
  async addSchedule(programId: number | string, payload: CreateProgramSchedulePayload): Promise<ProgramSchedule> {
    const mosqueId = this.programsMosqueMap.get(programId) || this.getMosqueId();
    const bodyObj = {
      title: payload.title || "جلسة دعوية",
      notes: payload.notes || "",
      date: payload.date,
      start_time: payload.start_time,
      end_time: payload.end_time,
    };

    const response = await fetch(`${BASE_URL}/program/mosques/${mosqueId}/dawah_programs/${programId}/schedules`, {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(bodyObj),
    });

    const json = await response.json().catch(() => null);
    console.log(`POST schedule Response:`, json);

    if (response.ok && json && json.status !== false) {
      const s = json.data || json;
      return {
        id: s.id,
        dawah_program_id: s.dawah_program_id || programId,
        title: s.title || bodyObj.title,
        notes: s.notes || bodyObj.notes,
        date: s.date || bodyObj.date,
        start_time: s.start_time || bodyObj.start_time,
        end_time: s.end_time || bodyObj.end_time,
        created_at: s.created_at,
        updated_at: s.updated_at,
      };
    }

    throw new Error(json?.message || `فشل إضافة الجلسة (HTTP ${response.status})`);
  }

  // ── 9. updateSchedule ────────────────────────────────────────────────────
  async updateSchedule(programId: number | string, scheduleId: number | string, payload: UpdateProgramSchedulePayload): Promise<ProgramSchedule> {
    const mosqueId = this.programsMosqueMap.get(programId) || this.getMosqueId();
    const bodyObj: any = {
      ...(payload.title !== undefined ? { title: payload.title } : {}),
      ...(payload.notes !== undefined ? { notes: payload.notes } : {}),
      ...(payload.date ? { date: payload.date } : {}),
      ...(payload.start_time ? { start_time: payload.start_time } : {}),
      ...(payload.end_time ? { end_time: payload.end_time } : {}),
    };

    const response = await fetch(`${BASE_URL}/program/mosques/${mosqueId}/dawah_programs/${programId}/schedules/${scheduleId}`, {
      method: "PUT",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(bodyObj),
    });

    const json = await response.json().catch(() => null);
    if (response.ok && json && json.status !== false) {
      const s = json.data || json;
      return {
        id: s.id || scheduleId,
        dawah_program_id: s.dawah_program_id || programId,
        title: s.title || payload.title,
        notes: s.notes || payload.notes,
        date: s.date || payload.date,
        start_time: s.start_time || payload.start_time,
        end_time: s.end_time || payload.end_time,
      };
    }

    throw new Error(json?.message || `فشل تحديث الجلسة (HTTP ${response.status})`);
  }

  // ── 10. deleteSchedule ───────────────────────────────────────────────────
  async deleteSchedule(programId: number | string, scheduleId: number | string): Promise<boolean> {
    const mosqueId = this.programsMosqueMap.get(programId) || this.getMosqueId();
    const response = await fetch(`${BASE_URL}/program/mosques/${mosqueId}/dawah_programs/${programId}/schedules/${scheduleId}`, {
      method: "DELETE",
      headers: this.getAuthHeaders(),
    });

    const json = await response.json().catch(() => null);
    return response.ok && json?.status !== false;
  }

  // ── 11. getStats ─────────────────────────────────────────────────────────
  async getStats(): Promise<DawahProgramStats> {
    const all = await this.getDawahPrograms();
    return {
      total_programs: all.length,
      active_programs: all.filter(p => p.status === 'active').length,
      total_lectures: all.filter(p => p.type === 'lecture').length,
      total_courses: all.filter(p => p.type === 'course').length,
      total_competitions: all.filter(p => p.type === 'competition' || (p.type as string) === 'compition').length,
      featured_count: all.filter(p => p.is_featured).length,
    };
  }

  // ── 12. getMyMosque & getMosqueSpaces ─────────────────────────────────────
  async getMyMosque(): Promise<MyMosqueDetails | null> {
    const mosqueId = this.getMosqueId();
    try {
      const response = await fetch(`${BASE_URL}/mosques/${mosqueId}`, {
        headers: this.getAuthHeaders(),
      });
      if (response.ok) {
        const json = await response.json();
        const m = json.data || json;
        return {
          id: m.id || mosqueId,
          name: m.name || "المسجد الرئيسي",
          city: m.city || m.city_name,
          district: m.district,
          spaces: m.spaces || [
            { id: 1, name: "المصلى الرئيسي للرجال", type: "prayer_hall" },
            { id: 2, name: "مصلى النساء", type: "prayer_hall" },
            { id: 3, name: "قاعة المحاضرات والدروس", type: "hall" },
          ],
        };
      }
    } catch (e) {
      console.warn("Error fetching my mosque:", e);
    }
    return {
      id: mosqueId,
      name: "المسجد الرئيسي",
      spaces: [
        { id: 1, name: "المصلى الرئيسي للرجال", type: "prayer_hall" },
        { id: 2, name: "مصلى النساء", type: "prayer_hall" },
        { id: 3, name: "قاعة المحاضرات والدروس", type: "hall" },
      ],
    };
  }

  async getMosqueSpaces(mosqueId?: number): Promise<MosqueSpace[]> {
    const targetMosque = mosqueId || this.getMosqueId();
    try {
      const response = await fetch(`${BASE_URL}/mosques/${targetMosque}`, {
        headers: this.getAuthHeaders(),
      });
      if (response.ok) {
        const json = await response.json();
        const m = json.data || json;
        if (m.spaces && m.spaces.length > 0) return m.spaces;
      }
    } catch (e) {}
    return [
      { id: 1, name: "المصلى الرئيسي للرجال", type: "prayer_hall" },
      { id: 2, name: "مصلى النساء", type: "prayer_hall" },
      { id: 3, name: "قاعة المحاضرات والدروس", type: "hall" },
    ];
  }
}
