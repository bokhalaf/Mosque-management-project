// ==============================
// Data — VolunteerRepositoryImpl (Live API Only — Flexible Array & Key Extraction)
// ==============================

import {
  VolunteerOpportunity,
  VolunteerApplication,
  VolunteerTask,
  VolunteerLog,
  VolunteerCertificate,
  VolunteerUser,
  VolunteerUsersPaginatedResponse,
  CreateOpportunityPayload,
  AssignTaskPayload,
  LogHoursPayload,
  VolunteerPaginatedResponse,
  VolunteerStats,
} from "../../domain/entities/Volunteer";
import { IVolunteerRepository } from "../../domain/repositories/IVolunteerRepository";

const BASE_URL = "https://mms-backend-rose.vercel.app/api";

export class VolunteerRepositoryImpl implements IVolunteerRepository {
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
    return 20;
  }

  private parseErrorResponse(json: any): string {
    if (json?.data && typeof json.data === 'object' && !Array.isArray(json.data)) {
      return Object.entries(json.data)
        .map(([f, msgs]) => `${f}: ${Array.isArray(msgs) ? msgs.join(', ') : msgs}`)
        .join(" | ");
    }
    if (json?.errors && typeof json.errors === 'object') {
      return Object.entries(json.errors)
        .map(([f, msgs]) => `${f}: ${Array.isArray(msgs) ? msgs.join(', ') : msgs}`)
        .join(" | ");
    }
    return json?.message || "";
  }

  private extractItems(json: any): any[] {
    if (!json) return [];
    if (Array.isArray(json)) return json;
    if (Array.isArray(json.data)) return json.data;
    if (json.data && Array.isArray(json.data.data)) return json.data.data;
    if (Array.isArray(json.opportunities)) return json.opportunities;
    if (json.data && Array.isArray(json.data.opportunities)) return json.data.opportunities;
    return [];
  }

  private mapOpportunity(item: any): VolunteerOpportunity {
    return {
      id: item.id,
      mosque_id: item.mosque_id || this.getMosqueId(),
      title: item.title || item.name || item.opportunity_title || "فرصة تطوعية",
      description: item.description || item.details || item.notes || "",
      required_volunteers: Number(item.required_volunteers || item.volunteers_needed || 0),
      current_volunteers: Number(item.current_volunteers || item.volunteers_count || item.accepted_volunteers_count || 0),
      start_date: item.start_date || item.start_at || "",
      end_date: item.end_date || item.end_at || "",
      status: item.status || (item.is_active === false || item.closed ? "closed" : "open"),
      created_at: item.created_at || new Date().toISOString(),
    };
  }

  private mapApplication(item: any, opportunityId?: number | string): VolunteerApplication {
    const vName =
      item.volunteer_name ||
      item.user?.name ||
      item.user?.full_name ||
      item.volunteer?.name ||
      item.volunteer?.full_name ||
      item.name ||
      "متطوع";

    return {
      id: item.id,
      opportunity_id: item.opportunity_id || (opportunityId ? Number(opportunityId) : 0),
      opportunity_title: item.opportunity_title || item.opportunity?.title || item.opportunity_name || "",
      volunteer_id: item.volunteer_id || item.user_id || item.user?.id || item.id,
      volunteer_name: vName,
      phone: item.phone || item.user?.phone || item.user?.phone_number || item.volunteer?.phone || "—",
      email: item.email || item.user?.email || item.volunteer?.email || "",
      status: item.status || "pending",
      applied_at: item.created_at || item.applied_at || new Date().toISOString(),
      notes: item.notes || "",
    };
  }

  private mapTask(item: any, opportunityId?: number | string): VolunteerTask {
    const vName =
      item.volunteer_name ||
      item.volunteer?.name ||
      item.volunteer?.full_name ||
      item.user?.name ||
      item.user?.full_name ||
      item.application?.volunteer_name ||
      item.application?.user?.name ||
      (item.application_id ? "متطوع مسند" : "غير مسند");

    const isDone = item.is_completed === true || item.status === 'completed';
    const computedStatus = isDone ? 'completed' : (item.status || (item.application_id ? 'assigned' : 'unassigned'));

    return {
      id: item.id,
      application_id: item.application_id || "",
      volunteer_id: item.volunteer_id || item.user_id,
      volunteer_name: vName,
      opportunity_id: item.opportunity_id || opportunityId,
      opportunity_title: item.opportunity_title || item.opportunity?.title || item.opportunity_name || "",
      task_description: item.task_description || item.description || item.title || "",
      status: computedStatus,
      created_at: item.created_at || new Date().toISOString(),
    };
  }

  // ── 1. OPPORTUNITIES ─────────────────────────────────────────────────────
  // GET /api/volunteer/manager/opportunities & fallback /api/volunteer/opportunities
  async getManagerOpportunities(): Promise<VolunteerOpportunity[]> {
    const urls = [
      `${BASE_URL}/volunteer/manager/opportunities`,
      `${BASE_URL}/volunteer/opportunities`,
    ];

    for (const url of urls) {
      try {
        const res = await fetch(url, { headers: this.getAuthHeaders() });
        if (res.ok) {
          const json = await res.json();
          const items = this.extractItems(json);
          if (items.length > 0) {
            return items.map((item: any) => this.mapOpportunity(item));
          }
        }
      } catch (e) {
        console.warn(`API getManagerOpportunities (${url}) error:`, e);
      }
    }
    return [];
  }

  async getManagerOpportunitiesPaginated(page: number = 1, perPage: number = 6): Promise<VolunteerPaginatedResponse> {
    const urls = [
      `${BASE_URL}/volunteer/manager/opportunities?page=${page}&per_page=${perPage}`,
      `${BASE_URL}/volunteer/opportunities?page=${page}&per_page=${perPage}`,
    ];

    for (const url of urls) {
      try {
        const res = await fetch(url, { headers: this.getAuthHeaders() });
        if (res.ok) {
          const json = await res.json();
          const items = this.extractItems(json);

          // Extract server pagination metadata
          const meta = json.pagination || json.meta || json.data?.pagination || json.data || {};
          const currentPage = Number(meta.current_page || meta.currentPage || page);
          const lastPage = Number(meta.last_page || meta.lastPage || Math.ceil((meta.total || items.length) / perPage) || 1);
          const total = Number(meta.total ?? (meta.total_count || items.length));

          return {
            data: items.map((item: any) => this.mapOpportunity(item)),
            pagination: {
              currentPage,
              lastPage: Math.max(1, lastPage),
              total,
              perPage,
            },
          };
        }
      } catch (e) {
        console.warn(`API getManagerOpportunitiesPaginated (${url}) error:`, e);
      }
    }

    return {
      data: [],
      pagination: { currentPage: 1, lastPage: 1, total: 0, perPage },
    };
  }

  // GET /api/volunteer/stats or /api/volunteer/opportunities/stats
  async getStats(): Promise<VolunteerStats> {
    try {
      const urls = [
        `${BASE_URL}/volunteer/stats`,
        `${BASE_URL}/volunteer/opportunities/stats`,
      ];

      for (const url of urls) {
        try {
          const res = await fetch(url, {
            headers: this.getAuthHeaders(),
          });
          if (res.ok) {
            const json = await res.json();
            const data = json.data || json;
            if (data && typeof data === 'object') {
              return {
                total_opportunities: Number(data.opportunities_total ?? data.total_opportunities ?? data.opportunities_count ?? data.total ?? 0),
                active_opportunities: Number(data.active_opportunities ?? data.open_opportunities_count ?? data.active ?? 0),
                pending_applications: Number(data.pending_applications ?? data.applications_pending_count ?? data.pending ?? 0),
                approved_volunteers: Number(data.volunteers_count ?? data.approved_volunteers ?? data.approved ?? 0),
                active_tasks: Number(data.active_tasks ?? data.tasks_count ?? 0),
                total_hours: Number(data.total_hours ?? data.hours_count ?? 0),
              };
            }
          }
        } catch {
          // continue to next URL
        }
      }
    } catch (e) {
      console.warn('API getStats error:', e);
    }

    // Fallback: calculate from opportunities, applications, tasks, logs
    const [opps, apps, tasks, logs] = await Promise.all([
      this.getManagerOpportunities(),
      this.getOpportunityApplications(),
      this.getTasks(),
      this.getLogs(),
    ]);

    return {
      total_opportunities: opps.length,
      active_opportunities: opps.filter(o => o.status === 'open').length,
      pending_applications: apps.filter(a => a.status === 'pending').length,
      approved_volunteers: apps.filter(a => a.status === 'approved').length,
      active_tasks: tasks.filter(t => t.status === 'assigned').length,
      total_hours: logs.reduce((sum, l) => sum + (Number(l.logged_hours) || 0), 0),
    };
  }

  // GET /api/volunteer/opportunities/{id}
  async getOpportunityById(id: number | string): Promise<VolunteerOpportunity | null> {
    try {
      const res = await fetch(`${BASE_URL}/volunteer/opportunities/${id}`, {
        headers: this.getAuthHeaders(),
      });
      if (res.ok) {
        const json = await res.json();
        const item = json.data || json;
        if (item && (item.id || item.title)) return this.mapOpportunity(item);
      }
    } catch (e) {
      console.warn(`API getOpportunityById(${id}) error:`, e);
    }
    // Fallback: search from manager list
    const all = await this.getManagerOpportunities();
    return all.find(o => String(o.id) === String(id)) || null;
  }

  // POST /api/volunteer/opportunities
  async createOpportunity(payload: CreateOpportunityPayload): Promise<VolunteerOpportunity> {
    const mosqueId = payload.mosque_id || this.getMosqueId();
    const tasksArray = Array.isArray(payload.tasks)
      ? payload.tasks.filter(t => typeof t === 'string' && t.trim().length > 0)
      : [];

    const requestBody: Record<string, any> = {
      mosque_id: Number(mosqueId),
      title: payload.title.trim(),
      description: payload.description?.trim() || null,
      required_volunteers: Number(payload.required_volunteers),
      start_date: payload.start_date,
      end_date: payload.end_date || null,
      tasks: tasksArray,
    };

    const res = await fetch(`${BASE_URL}/volunteer/opportunities`, {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(requestBody),
    });

    const json = await res.json().catch(() => null);
    if (!res.ok || (json && json.status === false)) {
      throw new Error(this.parseErrorResponse(json) || `فشل إنشاء الفرصة التطوعية (HTTP ${res.status})`);
    }

    const item = json.data || json;
    const created = this.mapOpportunity(item);

    // Safeguard: Ensure sub-tasks are posted if array was provided
    const createdTasks = (created as any).tasks || (item && item.tasks);
    if ((!createdTasks || createdTasks.length === 0) && tasksArray.length > 0) {
      for (const taskDesc of tasksArray) {
        try {
          await fetch(`${BASE_URL}/volunteer/opportunities/${created.id}/tasks`, {
            method: "POST",
            headers: this.getAuthHeaders(),
            body: JSON.stringify({ task_description: taskDesc }),
          });
        } catch (e) {
          console.warn("Sub-task post error:", e);
        }
      }
    }

    return created;
  }

  // PUT /api/volunteer/opportunities/{id}
  async updateOpportunity(id: number | string, payload: Partial<CreateOpportunityPayload>): Promise<VolunteerOpportunity> {
    const corePayload: Record<string, any> = {};
    if (payload.title) corePayload.title = payload.title.trim();
    if (payload.description !== undefined) corePayload.description = payload.description?.trim() || null;
    if (payload.required_volunteers) corePayload.required_volunteers = Number(payload.required_volunteers);
    if (payload.start_date) corePayload.start_date = payload.start_date;
    if (payload.end_date !== undefined) corePayload.end_date = payload.end_date || null;

    if (Object.keys(corePayload).length > 0) {
      const res = await fetch(`${BASE_URL}/volunteer/opportunities/${id}`, {
        method: "PUT",
        headers: this.getAuthHeaders(),
        body: JSON.stringify(corePayload),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || (json && json.status === false)) {
        throw new Error(this.parseErrorResponse(json) || `فشل تعديل الفرصة (HTTP ${res.status})`);
      }
    }

    // Create new tasks via tasks endpoint if provided
    const tasksArray = Array.isArray(payload.tasks)
      ? payload.tasks.filter(t => typeof t === 'string' && t.trim().length > 0)
      : [];

    for (const taskDesc of tasksArray) {
      try {
        await fetch(`${BASE_URL}/volunteer/opportunities/${id}/tasks`, {
          method: "POST",
          headers: this.getAuthHeaders(),
          body: JSON.stringify({ task_description: taskDesc }),
        });
      } catch (e) {
        console.warn("Failed to create task:", taskDesc, e);
      }
    }

    const updated = await this.getOpportunityById(id);
    return updated || {
      id,
      mosque_id: this.getMosqueId(),
      title: payload.title || "",
      description: payload.description || "",
      required_volunteers: Number(payload.required_volunteers || 0),
      current_volunteers: 0,
      start_date: payload.start_date || "",
      end_date: payload.end_date || "",
      status: "open",
      created_at: new Date().toISOString(),
    };
  }

  // POST /api/volunteer/opportunities/{id}/close
  async closeOpportunity(id: number | string): Promise<boolean> {
    const res = await fetch(`${BASE_URL}/volunteer/opportunities/${id}/close`, {
      method: "POST",
      headers: this.getAuthHeaders(),
    });
    const json = await res.json().catch(() => null);
    if (!res.ok || (json && json.status === false)) {
      throw new Error(json?.message || `فشل إغلاق الفرصة (HTTP ${res.status})`);
    }
    return true;
  }

  // ── 2. APPLICATIONS ──────────────────────────────────────────────────────
  // GET /api/volunteer/opportunities/{id}/applications
  async getOpportunityApplications(
    opportunityId?: number | string,
    status?: string,
    page?: number,
    perPage?: number
  ): Promise<VolunteerApplication[]> {
    if (!opportunityId) {
      const url = `${BASE_URL}/volunteer/my-applications`;
      try {
        const res = await fetch(url, { headers: this.getAuthHeaders() });
        if (res.ok) {
          const json = await res.json();
          const items = this.extractItems(json);
          return items.map((item: any) => this.mapApplication(item));
        }
      } catch (e) {
        console.warn(`API getOpportunityApplications error:`, e);
      }
      return [];
    }

    const params = new URLSearchParams();
    if (status && status !== 'all') params.set('status', status);
    if (page) params.set('page', String(page));
    if (perPage) params.set('per_page', String(perPage));

    const queryString = params.toString();
    const url = `${BASE_URL}/volunteer/opportunities/${opportunityId}/applications${queryString ? `?${queryString}` : ''}`;

    try {
      const res = await fetch(url, { headers: this.getAuthHeaders() });
      if (res.ok) {
        const json = await res.json();
        const items = this.extractItems(json);
        return items.map((item: any) => this.mapApplication(item, opportunityId));
      }
    } catch (e) {
      console.warn(`API getOpportunityApplications error:`, e);
    }
    return [];
  }

  // POST /api/volunteer/applications/{id}/approve
  async approveApplication(applicationId: number | string): Promise<boolean> {
    const res = await fetch(`${BASE_URL}/volunteer/applications/${applicationId}/approve`, {
      method: "POST",
      headers: this.getAuthHeaders(),
    });
    const json = await res.json().catch(() => null);
    if (!res.ok || (json && json.status === false)) {
      throw new Error(json?.message || `فشل قبول الطلب (HTTP ${res.status})`);
    }
    return true;
  }

  // POST /api/volunteer/applications/{id}/reject
  async rejectApplication(applicationId: number | string): Promise<boolean> {
    const res = await fetch(`${BASE_URL}/volunteer/applications/${applicationId}/reject`, {
      method: "POST",
      headers: this.getAuthHeaders(),
    });
    const json = await res.json().catch(() => null);
    if (!res.ok || (json && json.status === false)) {
      throw new Error(json?.message || `فشل رفض الطلب (HTTP ${res.status})`);
    }
    return true;
  }

  // ── 3. TASKS ──────────────────────────────────────────────────────────────
  // GET /api/volunteer/opportunities/{id}/tasks
  async getOpportunityTasks(opportunityId: number | string): Promise<VolunteerTask[]> {
    try {
      const res = await fetch(`${BASE_URL}/volunteer/opportunities/${opportunityId}/tasks`, {
        headers: this.getAuthHeaders(),
      });
      if (res.ok) {
        const json = await res.json();
        const items = this.extractItems(json);
        return items.map((item: any) => this.mapTask(item, opportunityId));
      }
    } catch (e) {
      console.warn(`API getOpportunityTasks(${opportunityId}) error:`, e);
    }
    return [];
  }

  // POST /api/volunteer/opportunities/{id}/tasks
  async createOpportunityTask(opportunityId: number | string, taskDescription: string): Promise<VolunteerTask> {
    const res = await fetch(`${BASE_URL}/volunteer/opportunities/${opportunityId}/tasks`, {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ task_description: taskDescription }),
    });
    const json = await res.json().catch(() => null);
    if (!res.ok || (json && json.status === false)) {
      throw new Error(json?.message || "فشل إنشاء المهمة بالسيرفر");
    }
    return this.mapTask(json.data || json, opportunityId);
  }

  // POST /api/volunteer/tasks/{id}/assign
  async assignTaskToVolunteer(taskId: number | string, applicationId: number | string): Promise<VolunteerTask> {
    const res = await fetch(`${BASE_URL}/volunteer/tasks/${taskId}/assign`, {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ application_id: Number(applicationId) }),
    });
    const json = await res.json().catch(() => null);
    if (!res.ok || (json && json.status === false)) {
      throw new Error(json?.message || "فشل إسناد المهمة للمتطوع");
    }
    return this.mapTask(json.data || json);
  }

  async assignTask(payload: AssignTaskPayload): Promise<VolunteerTask> {
    if (payload.taskId) {
      return await this.assignTaskToVolunteer(payload.taskId, payload.application_id);
    }

    const opportunityId = payload.opportunity_id;
    if (!opportunityId) throw new Error("opportunityId مطلوب لإسناد المهمة");

    const createdTask = await this.createOpportunityTask(opportunityId, payload.task_description || "مهمة تطوعية");
    try {
      return await this.assignTaskToVolunteer(createdTask.id, payload.application_id);
    } catch (e) {
      return { ...createdTask, application_id: payload.application_id };
    }
  }

  async getTasks(): Promise<VolunteerTask[]> {
    try {
      const opps = await this.getManagerOpportunities();
      const results = await Promise.all(opps.map(opp => this.getOpportunityTasks(opp.id)));
      return results.flat();
    } catch (e) {
      console.warn("API getTasks error:", e);
      return [];
    }
  }

  // ── 4. HOURS & LOGS ───────────────────────────────────────────────────────
  // POST /api/volunteer/logs
  async logVolunteerHours(payload: LogHoursPayload): Promise<VolunteerLog> {
    const res = await fetch(`${BASE_URL}/volunteer/logs`, {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: JSON.stringify({
        volunteer_id: payload.volunteer_id,
        opportunity_id: payload.opportunity_id,
        logged_hours: Number(payload.logged_hours),
        manager_evaluation: payload.manager_evaluation,
        notes: payload.notes || "",
      }),
    });
    const json = await res.json().catch(() => null);
    if (!res.ok || (json && json.status === false)) {
      throw new Error(json?.message || "فشل تسجيل ساعات المتطوع بالسيرفر");
    }
    const item = json?.data || json;
    return {
      id: item.id || Date.now(),
      volunteer_id: item.volunteer_id || payload.volunteer_id,
      volunteer_name: item.volunteer_name || "متطوع",
      opportunity_id: item.opportunity_id || payload.opportunity_id,
      opportunity_title: item.opportunity_title || "",
      logged_hours: Number(item.logged_hours || payload.logged_hours),
      manager_evaluation: item.manager_evaluation || payload.manager_evaluation,
      notes: item.notes || payload.notes,
      created_at: item.created_at || new Date().toISOString(),
    };
  }

  // GET /api/volunteer/hours/{volunteerId}/{opportunityId}
  async getVolunteerHours(volunteerId: number | string, opportunityId: number | string): Promise<number> {
    try {
      const res = await fetch(`${BASE_URL}/volunteer/hours/${volunteerId}/${opportunityId}`, {
        headers: this.getAuthHeaders(),
      });
      if (res.ok) {
        const json = await res.json();
        if (typeof json.total_hours === 'number') return json.total_hours;
        if (json.data?.total_hours) return json.data.total_hours;
      }
    } catch (e) {
      console.warn("API getVolunteerHours error:", e);
    }
    return 0;
  }

  // GET /api/volunteer/my-logs
  async getLogs(): Promise<VolunteerLog[]> {
    try {
      const res = await fetch(`${BASE_URL}/volunteer/my-logs`, {
        headers: this.getAuthHeaders(),
      });
      if (res.ok) {
        const json = await res.json();
        const items = this.extractItems(json);
        return items.map((item: any) => ({
          id: item.id,
          volunteer_id: item.volunteer_id,
          volunteer_name: item.volunteer_name || item.volunteer?.name || "متطوع",
          opportunity_id: item.opportunity_id,
          opportunity_title: item.opportunity_title || item.opportunity?.title || "",
          logged_hours: Number(item.logged_hours || 0),
          manager_evaluation: item.manager_evaluation || "",
          notes: item.notes || "",
          created_at: item.created_at || new Date().toISOString(),
        }));
      }
    } catch (e) {
      console.warn("API getLogs error:", e);
    }
    return [];
  }

  // ── 5. CERTIFICATES ───────────────────────────────────────────────────────
  // POST /api/volunteer/certificates/{volunteerId}/{opportunityId}
  async issueCertificate(volunteerId: number | string, opportunityId: number | string): Promise<VolunteerCertificate> {
    const volIdNum = Number(volunteerId);
    const oppIdNum = Number(opportunityId);

    if (!volIdNum || isNaN(volIdNum)) {
      throw new Error("معرف المتطوع غير صالح لإصدار الشهادة");
    }
    if (!oppIdNum || isNaN(oppIdNum)) {
      throw new Error("معرف الفرصة غير صالح لإصدار الشهادة");
    }

    const res = await fetch(`${BASE_URL}/volunteer/certificates/${volIdNum}/${oppIdNum}`, {
      method: "POST",
      headers: this.getAuthHeaders(),
    });
    const json = await res.json().catch(() => null);
    if (!res.ok || (json && json.status === false)) {
      const parsedErr = this.parseErrorResponse(json);
      throw new Error(parsedErr || json?.message || `فشل إصدار شهادة التطوع بالسيرفر (HTTP ${res.status})`);
    }
    const item = json?.data || json;
    const streamUrl = `${BASE_URL}/volunteer/certificates/${volIdNum}/${oppIdNum}/stream`;
    return {
      id: item.id || Date.now(),
      volunteer_id: item.volunteer_id || volIdNum,
      volunteer_name: item.volunteer_name || item.name || "متطوع",
      opportunity_id: item.opportunity_id || oppIdNum,
      opportunity_title: item.opportunity_title || item.title || "",
      certificate_url: item.certificate_url || streamUrl,
      issued_at: item.issued_at || item.created_at || new Date().toISOString(),
      total_hours: Number(item.total_hours || 0),
    };
  }

  // GET /api/volunteer/my-certificates
  async getCertificates(): Promise<VolunteerCertificate[]> {
    try {
      const res = await fetch(`${BASE_URL}/volunteer/my-certificates`, {
        headers: this.getAuthHeaders(),
      });
      if (res.ok) {
        const json = await res.json();
        const items = this.extractItems(json);
        return items.map((item: any) => ({
          id: item.id,
          volunteer_id: item.volunteer_id,
          volunteer_name: item.volunteer_name || item.volunteer?.name || "متطوع",
          opportunity_id: item.opportunity_id,
          opportunity_title: item.opportunity_title || item.opportunity?.title || "",
          certificate_url: item.certificate_url || (item.volunteer_id && item.opportunity_id ? `${BASE_URL}/volunteer/certificates/${item.volunteer_id}/${item.opportunity_id}/stream` : ""),
          issued_at: item.issued_at || item.created_at || new Date().toISOString(),
          total_hours: Number(item.total_hours || 0),
        }));
      }
    } catch (e) {
      console.warn("API getCertificates error:", e);
    }
    return [];
  }

  // ── 6. VOLUNTEERS LIST ───────────────────────────────────────────────────
  // GET /api/volunteer/volunteers?page=1&per_page=15&search=&status=
  async getVolunteers(
    page: number = 1,
    perPage: number = 15,
    search?: string,
    status?: string
  ): Promise<VolunteerUsersPaginatedResponse> {
    const params = new URLSearchParams();
    if (page) params.append("page", String(page));
    if (perPage) params.append("per_page", String(perPage));
    if (search && search.trim()) params.append("search", search.trim());
    if (status && status.trim()) params.append("status", status.trim());

    const url = `${BASE_URL}/volunteer/volunteers?${params.toString()}`;

    try {
      const res = await fetch(url, { headers: this.getAuthHeaders() });
      if (res.ok) {
        const json = await res.json();
        const items = this.extractItems(json);

        const meta = json.pagination || json.meta || json.data?.pagination || {};
        const currentPage = Number(meta.current_page || meta.currentPage || page);
        const lastPage = Number(meta.last_page || meta.totalPages || Math.ceil((meta.total || items.length) / perPage) || 1);
        const total = Number(meta.total !== undefined ? meta.total : items.length);

        const mappedUsers: VolunteerUser[] = items.map((item: any) => ({
          id: Number(item.id),
          first_name: item.first_name || "",
          last_name: item.last_name || "",
          name: item.name || `${item.first_name || ''} ${item.last_name || ''}`.trim() || "متطوع",
          email: item.email || "",
          phone: item.phone || item.phone_number || null,
          status: item.status || "active",
          roles: Array.isArray(item.roles) ? item.roles : (item.role ? [item.role] : ["volunteer"]),
          created_at: item.created_at || new Date().toISOString(),
        }));

        return {
          data: mappedUsers,
          pagination: {
            currentPage,
            lastPage,
            total,
            perPage,
          },
        };
      }
    } catch (e) {
      console.warn("API getVolunteers error:", e);
    }

    return {
      data: [],
      pagination: {
        currentPage: page,
        lastPage: 1,
        total: 0,
        perPage,
      },
    };
  }
}

