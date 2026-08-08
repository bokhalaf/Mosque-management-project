// ==============================
// Data — DawahProgramRepositoryImpl
// ==============================

import {
  DawahProgram,
  ProgramSchedule,
  CreateDawahProgramPayload,
  UpdateDawahProgramPayload,
  CreateProgramSchedulePayload,
  UpdateProgramSchedulePayload,
  DawahProgramStats,
} from "../../domain/entities/DawahProgram";
import { IDawahProgramRepository } from "../../domain/repositories/IDawahProgramRepository";

const BASE_URL = "https://mms-backend-rose.vercel.app/api";
const STORAGE_KEY_PROGRAMS = "dawah_programs_unified_cache";

export class DawahProgramRepositoryImpl implements IDawahProgramRepository {
  private getAuthHeaders(): HeadersInit {
    const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
    return {
      "Content-Type": "application/json",
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
    return 20; // Default to active mosque ID 20 if none specified
  }

  private getLocalPrograms(): DawahProgram[] {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(STORAGE_KEY_PROGRAMS);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {}
      }
    }
    return [];
  }

  private saveLocalPrograms(programs: DawahProgram[]): void {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY_PROGRAMS, JSON.stringify(programs));
    }
  }

  // ── 1. getDawahPrograms (Live API Fetch with fallback) ─────────────────────
  async getDawahPrograms(params?: { mosque_id?: number; status?: string; type?: string; q?: string }): Promise<DawahProgram[]> {
    const mosqueId = params?.mosque_id || this.getMosqueId();
    let apiPrograms: DawahProgram[] = [];
    let fetchSuccess = false;

    // 1. Call GET /api/program/dawah_programs and GET /api/program/mosques/{mosqueId}/dawah_programs
    try {
      const [allRes, mosqueRes] = await Promise.all([
        fetch(`${BASE_URL}/program/dawah_programs`, { headers: this.getAuthHeaders() }).catch(() => null),
        fetch(`${BASE_URL}/program/mosques/${mosqueId}/dawah_programs`, { headers: this.getAuthHeaders() }).catch(() => null),
      ]);

      const rawItems: any[] = [];

      if (allRes && allRes.ok) {
        const json = await allRes.json();
        if (json.status && Array.isArray(json.data)) {
          rawItems.push(...json.data);
          fetchSuccess = true;
        }
      }

      if (mosqueRes && mosqueRes.ok) {
        const json = await mosqueRes.json();
        if (json.status && Array.isArray(json.data)) {
          rawItems.push(...json.data);
          fetchSuccess = true;
        }
      }

      // Deduplicate and format items from live API
      const map = new Map<number | string, DawahProgram>();
      rawItems.forEach((item: any) => {
        if (item && item.id) {
          map.set(item.id, {
            id: item.id,
            mosque_id: item.mosque_id || mosqueId,
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

      apiPrograms = Array.from(map.values());

      if (fetchSuccess) {
        // Merge with locally created programs
        const localList = this.getLocalPrograms();
        localList.forEach(p => {
          if (!map.has(p.id)) {
            apiPrograms.unshift(p);
          }
        });
        this.saveLocalPrograms(apiPrograms);
      }
    } catch (e) {
      console.warn("API getDawahPrograms fetch failed, using local storage:", e);
    }

    if (!fetchSuccess && apiPrograms.length === 0) {
      apiPrograms = this.getLocalPrograms();
    }

    let result = apiPrograms;

    if (params?.status && params.status !== "all") {
      result = result.filter(p => p.status === params.status);
    }
    if (params?.type && params.type !== "all") {
      result = result.filter(p => p.type === params.type);
    }
    if (params?.q && params.q.trim()) {
      const q = params.q.trim().toLowerCase();
      result = result.filter(p =>
        p.program_name.toLowerCase().includes(q) ||
        p.presenter.toLowerCase().includes(q) ||
        (p.description && p.description.toLowerCase().includes(q))
      );
    }

    return result;
  }

  async getDawahProgramById(id: number | string): Promise<DawahProgram | null> {
    const list = await this.getDawahPrograms();
    return list.find(p => String(p.id) === String(id)) || null;
  }

  // ── 2. createDawahProgram (POST /api/program/mosques/{mosque_id}/dawah_programs) ─────
  async createDawahProgram(payload: CreateDawahProgramPayload): Promise<DawahProgram> {
    const mosqueId = payload.mosque_id || this.getMosqueId();
    let createdProgram: DawahProgram | null = null;

    // Ensure type matches API OpenAPI enum: 'lecture' | 'course' | 'competition' | 'other'
    let apiType = payload.type;
    if ((apiType as string) === 'compition') {
      apiType = 'competition';
    }

    // Schedules is a REQUIRED array in OpenAPI POST schema
    const defaultSchedules = payload.schedules && payload.schedules.length > 0
      ? payload.schedules
      : [{
          title: "الجلسة الأولى",
          notes: "جلسة جديدة",
          date: new Date().toISOString().split("T")[0],
          start_time: "16:30",
          end_time: "18:00",
        }];

    const requestBody = {
      space_id: Number(payload.space_id || 1),
      program_name: payload.program_name,
      description: payload.description || "",
      type: apiType,
      presenter: payload.presenter,
      is_featured: payload.is_featured ?? false,
      status: payload.status || "active",
      level: payload.level || "beginner",
      schedules: defaultSchedules,
    };

    console.log("POST DawahProgram Payload:", requestBody);

    try {
      const response = await fetch(`${BASE_URL}/program/mosques/${mosqueId}/dawah_programs`, {
        method: "POST",
        headers: this.getAuthHeaders(),
        body: JSON.stringify(requestBody),
      });

      const json = await response.json().catch(() => null);
      console.log("POST DawahProgram Response:", response.status, json);

      if (response.ok && json && (json.status || json.data)) {
        const item = json.data || json;
        createdProgram = {
          id: item.id || Date.now(),
          mosque_id: Number(mosqueId),
          space_id: Number(payload.space_id || 1),
          program_name: item.program_name || payload.program_name,
          description: item.description || payload.description,
          type: item.type || payload.type,
          presenter: item.presenter || payload.presenter,
          is_featured: item.is_featured ?? payload.is_featured ?? false,
          status: item.status || payload.status || "active",
          level: item.level || payload.level || "beginner",
          schedules: item.schedules || defaultSchedules,
          created_at: item.created_at || new Date().toISOString(),
        };
      } else if (json) {
        if (json.errors) {
          const errMsgs = Object.values(json.errors).flat().join(" - ");
          throw new Error(errMsgs || json.message || "خطأ في التحقق من بيانات البرنامج الدعوي");
        }
        if (json.message) {
          throw new Error(json.message);
        }
      }
    } catch (e: any) {
      console.warn("API createDawahProgram error:", e);
      if (e.message && !e.message.includes("Failed to fetch") && !e.message.includes("fetch")) {
        throw e;
      }
    }

    if (!createdProgram) {
      createdProgram = {
        id: Date.now(),
        mosque_id: Number(mosqueId),
        space_id: Number(payload.space_id || 1),
        program_name: payload.program_name,
        description: payload.description,
        type: payload.type,
        presenter: payload.presenter,
        is_featured: payload.is_featured ?? false,
        status: payload.status || "active",
        level: payload.level || "beginner",
        schedules: defaultSchedules as any,
        created_at: new Date().toISOString(),
      };
    }

    const currentList = this.getLocalPrograms();
    currentList.unshift(createdProgram);
    this.saveLocalPrograms(currentList);
    return createdProgram;
  }

  // ── 3. updateDawahProgram (POST /api/program/mosques/{mosque}/dawah_programs/{program}) ─
  async updateDawahProgram(id: number | string, payload: UpdateDawahProgramPayload): Promise<DawahProgram> {
    const mosqueId = payload.mosque_id || this.getMosqueId();

    try {
      await fetch(`${BASE_URL}/program/mosques/${mosqueId}/dawah_programs/${id}`, {
        method: "POST",
        headers: this.getAuthHeaders(),
        body: JSON.stringify(payload),
      });
    } catch (e) {
      console.warn("API updateDawahProgram failed:", e);
    }

    const currentList = this.getLocalPrograms();
    const index = currentList.findIndex(p => String(p.id) === String(id));
    if (index !== -1) {
      currentList[index] = {
        ...currentList[index],
        ...(payload as any),
        updated_at: new Date().toISOString(),
      };
      this.saveLocalPrograms(currentList);
      return currentList[index];
    }

    throw new Error("البرنامج الدعوي غير موجود");
  }

  // ── 4. deleteDawahProgram (DELETE /api/program/mosques/{mosque}/dawah_programs/{program}) ─
  async deleteDawahProgram(id: number | string): Promise<boolean> {
    const mosqueId = this.getMosqueId();

    try {
      await fetch(`${BASE_URL}/program/mosques/${mosqueId}/dawah_programs/${id}`, {
        method: "DELETE",
        headers: this.getAuthHeaders(),
      });
    } catch (e) {
      console.warn("API deleteDawahProgram failed:", e);
    }

    const currentList = this.getLocalPrograms();
    const newList = currentList.filter(p => String(p.id) !== String(id));
    this.saveLocalPrograms(newList);
    return true;
  }

  // ── 5. Schedules Endpoints ─────────────────────────────────────────────
  async getSchedules(programId: number | string): Promise<ProgramSchedule[]> {
    try {
      const response = await fetch(`${BASE_URL}/program/dawah_programs/${programId}/schedules`, {
        headers: this.getAuthHeaders(),
      });
      if (response.ok) {
        const json = await response.json();
        return json.data || json || [];
      }
    } catch (e) {
      console.warn("API getSchedules failed:", e);
    }

    const program = await this.getDawahProgramById(programId);
    return program?.schedules || [];
  }

  async addSchedule(programId: number | string, payload: CreateProgramSchedulePayload): Promise<ProgramSchedule> {
    const mosqueId = this.getMosqueId();
    let newSchedule: ProgramSchedule | null = null;

    try {
      const response = await fetch(`${BASE_URL}/program/mosques/${mosqueId}/dawah_programs/${programId}/schedules`, {
        method: "POST",
        headers: this.getAuthHeaders(),
        body: JSON.stringify(payload),
      });
      if (response.ok) {
        const json = await response.json();
        newSchedule = json.data || json;
      }
    } catch (e) {
      console.warn("API addSchedule failed:", e);
    }

    if (!newSchedule) {
      newSchedule = {
        id: Date.now(),
        dawah_program_id: programId,
        title: payload.title || "جلسة جديدة",
        notes: payload.notes,
        date: payload.date,
        start_time: payload.start_time,
        end_time: payload.end_time,
        created_at: new Date().toISOString(),
      };
    }

    const currentList = this.getLocalPrograms();
    const program = currentList.find(p => String(p.id) === String(programId));
    if (program) {
      if (!program.schedules) program.schedules = [];
      program.schedules.push(newSchedule);
      this.saveLocalPrograms(currentList);
    }

    return newSchedule;
  }

  async updateSchedule(programId: number | string, scheduleId: number | string, payload: UpdateProgramSchedulePayload): Promise<ProgramSchedule> {
    const mosqueId = this.getMosqueId();

    try {
      await fetch(`${BASE_URL}/program/mosques/${mosqueId}/dawah_programs/${programId}/schedules/${scheduleId}`, {
        method: "PUT",
        headers: this.getAuthHeaders(),
        body: JSON.stringify(payload),
      });
    } catch (e) {
      console.warn("API updateSchedule failed:", e);
    }

    const currentList = this.getLocalPrograms();
    const program = currentList.find(p => String(p.id) === String(programId));
    if (program && program.schedules) {
      const sIndex = program.schedules.findIndex(s => String(s.id) === String(scheduleId));
      if (sIndex !== -1) {
        program.schedules[sIndex] = {
          ...program.schedules[sIndex],
          ...payload,
          updated_at: new Date().toISOString(),
        };
        this.saveLocalPrograms(currentList);
        return program.schedules[sIndex];
      }
    }

    throw new Error("الجلسة غير موجودة");
  }

  async deleteSchedule(programId: number | string, scheduleId: number | string): Promise<boolean> {
    const mosqueId = this.getMosqueId();

    try {
      await fetch(`${BASE_URL}/program/mosques/${mosqueId}/dawah_programs/${programId}/schedules/${scheduleId}`, {
        method: "DELETE",
        headers: this.getAuthHeaders(),
      });
    } catch (e) {
      console.warn("API deleteSchedule failed:", e);
    }

    const currentList = this.getLocalPrograms();
    const program = currentList.find(p => String(p.id) === String(programId));
    if (program && program.schedules) {
      program.schedules = program.schedules.filter(s => String(s.id) !== String(scheduleId));
      this.saveLocalPrograms(currentList);
    }

    return true;
  }

  async getStats(): Promise<DawahProgramStats> {
    const list = await this.getDawahPrograms();
    return {
      total_programs: list.length,
      active_programs: list.filter(p => p.status === "active").length,
      total_lectures: list.filter(p => p.type === "lecture").length,
      total_courses: list.filter(p => p.type === "course").length,
      total_competitions: list.filter(p => p.type === "compition").length,
      featured_count: list.filter(p => p.is_featured).length,
    };
  }
}
