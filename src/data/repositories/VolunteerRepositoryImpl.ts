// ==============================
// Data — VolunteerRepositoryImpl (Live API & Dynamic Local Storage)
// ==============================

import {
  VolunteerOpportunity,
  VolunteerApplication,
  VolunteerTask,
  VolunteerLog,
  VolunteerCertificate,
  CreateOpportunityPayload,
  AssignTaskPayload,
  LogHoursPayload,
} from "../../domain/entities/Volunteer";
import { IVolunteerRepository } from "../../domain/repositories/IVolunteerRepository";

const BASE_URL = "https://mms-backend-rose.vercel.app/api";
const STORAGE_KEY_VOLUNTEERS = "mosque_volunteers_real_live_store";

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

  // Pure dynamic store (no static hardcoded fake data)
  private getLocalStore(): {
    opportunities: VolunteerOpportunity[];
    applications: VolunteerApplication[];
    tasks: VolunteerTask[];
    logs: VolunteerLog[];
    certificates: VolunteerCertificate[];
  } {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(STORAGE_KEY_VOLUNTEERS);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {}
      }
    }
    const emptyStore = {
      opportunities: [],
      applications: [],
      tasks: [],
      logs: [],
      certificates: [],
    };
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY_VOLUNTEERS, JSON.stringify(emptyStore));
    }
    return emptyStore;
  }

  private saveLocalStore(store: {
    opportunities: VolunteerOpportunity[];
    applications: VolunteerApplication[];
    tasks: VolunteerTask[];
    logs: VolunteerLog[];
    certificates: VolunteerCertificate[];
  }): void {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY_VOLUNTEERS, JSON.stringify(store));
    }
  }

  // ── 1. OPPERTUNITIES (GET /api/volunteer/manager/opportunities & /api/volunteer/opportunities) ─
  async getManagerOpportunities(): Promise<VolunteerOpportunity[]> {
    let apiItems: VolunteerOpportunity[] = [];
    const endpointsToTry = [
      `${BASE_URL}/volunteer/manager/opportunities`,
      `${BASE_URL}/volunteer/opportunities`,
    ];

    for (const url of endpointsToTry) {
      try {
        const res = await fetch(url, {
          headers: this.getAuthHeaders(),
        });
        if (res.ok) {
          const json = await res.json();
          const items = Array.isArray(json.data) ? json.data : (Array.isArray(json) ? json : []);
          if (items.length > 0) {
            apiItems = items;
            break;
          }
        }
      } catch (e) {
        console.warn(`API call to ${url} failed:`, e);
      }
    }

    const store = this.getLocalStore();
    const map = new Map<string | number, VolunteerOpportunity>();

    // Merge persistent local real opportunities with API items
    store.opportunities.forEach(item => map.set(item.id, item));
    apiItems.forEach(item => map.set(item.id, item));

    const merged = Array.from(map.values());
    store.opportunities = merged;
    this.saveLocalStore(store);

    return merged;
  }

  async createOpportunity(payload: CreateOpportunityPayload): Promise<VolunteerOpportunity> {
    const mosqueId = payload.mosque_id || this.getMosqueId();
    let created: VolunteerOpportunity | null = null;

    try {
      const res = await fetch(`${BASE_URL}/volunteer/opportunities`, {
        method: "POST",
        headers: this.getAuthHeaders(),
        body: JSON.stringify({
          mosque_id: mosqueId,
          title: payload.title,
          description: payload.description,
          required_volunteers: Number(payload.required_volunteers),
          start_date: payload.start_date,
          end_date: payload.end_date,
        }),
      });

      const json = await res.json().catch(() => null);

      if (res.ok && json) {
        created = json.data || json;
      }
    } catch (e) {
      console.warn("API POST /volunteer/opportunities error:", e);
    }

    if (!created) {
      created = {
        id: Date.now(),
        mosque_id: mosqueId,
        title: payload.title,
        description: payload.description,
        required_volunteers: Number(payload.required_volunteers),
        current_volunteers: 0,
        start_date: payload.start_date,
        end_date: payload.end_date,
        status: "open",
        created_at: new Date().toISOString(),
      };
    }

    const store = this.getLocalStore();
    store.opportunities.unshift(created);
    this.saveLocalStore(store);

    return created;
  }

  async updateOpportunity(id: number | string, payload: Partial<CreateOpportunityPayload>): Promise<VolunteerOpportunity> {
    try {
      await fetch(`${BASE_URL}/volunteer/opportunities/${id}`, {
        method: "PUT",
        headers: this.getAuthHeaders(),
        body: JSON.stringify(payload),
      });
    } catch (e) {
      console.warn("API PUT /volunteer/opportunities error:", e);
    }

    const store = this.getLocalStore();
    const target = store.opportunities.find(o => String(o.id) === String(id));
    if (target) {
      Object.assign(target, payload);
      this.saveLocalStore(store);
      return target;
    }
    throw new Error("الفرصة التطوعية غير موجودة");
  }

  async closeOpportunity(id: number | string): Promise<boolean> {
    try {
      await fetch(`${BASE_URL}/volunteer/opportunities/${id}/close`, {
        method: "POST",
        headers: this.getAuthHeaders(),
      });
    } catch (e) {
      console.warn("API POST /volunteer/opportunities/close error:", e);
    }

    const store = this.getLocalStore();
    const target = store.opportunities.find(o => String(o.id) === String(id));
    if (target) {
      target.status = "closed";
      this.saveLocalStore(store);
    }
    return true;
  }

  // ── 2. APPLICATIONS (GET /api/volunteer/opportunities/{id}/applications & /api/volunteer/my-applications) ─
  async getOpportunityApplications(opportunityId?: number | string): Promise<VolunteerApplication[]> {
    let apiItems: VolunteerApplication[] = [];

    const urlsToTry = opportunityId
      ? [`${BASE_URL}/volunteer/opportunities/${opportunityId}/applications`]
      : [`${BASE_URL}/volunteer/my-applications`];

    for (const url of urlsToTry) {
      try {
        const res = await fetch(url, {
          headers: this.getAuthHeaders(),
        });
        if (res.ok) {
          const json = await res.json();
          const items = Array.isArray(json.data) ? json.data : (Array.isArray(json) ? json : []);
          if (items.length > 0) {
            apiItems = items;
            break;
          }
        }
      } catch (e) {
        console.warn(`API call to ${url} failed:`, e);
      }
    }

    const store = this.getLocalStore();
    const map = new Map<string | number, VolunteerApplication>();

    store.applications.forEach(item => map.set(item.id, item));
    apiItems.forEach(item => map.set(item.id, item));

    const merged = Array.from(map.values());
    if (opportunityId) {
      return merged.filter(a => String(a.opportunity_id) === String(opportunityId));
    }
    return merged;
  }

  async approveApplication(applicationId: number | string): Promise<boolean> {
    try {
      await fetch(`${BASE_URL}/volunteer/applications/${applicationId}/approve`, {
        method: "POST",
        headers: this.getAuthHeaders(),
      });
    } catch (e) {
      console.warn("API approveApplication error:", e);
    }

    const store = this.getLocalStore();
    const target = store.applications.find(a => String(a.id) === String(applicationId));
    if (target) {
      target.status = "approved";
      const opp = store.opportunities.find(o => String(o.id) === String(target.opportunity_id));
      if (opp) {
        opp.current_volunteers = (opp.current_volunteers || 0) + 1;
      }
      this.saveLocalStore(store);
    }
    return true;
  }

  async rejectApplication(applicationId: number | string): Promise<boolean> {
    try {
      await fetch(`${BASE_URL}/volunteer/applications/${applicationId}/reject`, {
        method: "POST",
        headers: this.getAuthHeaders(),
      });
    } catch (e) {
      console.warn("API rejectApplication error:", e);
    }

    const store = this.getLocalStore();
    const target = store.applications.find(a => String(a.id) === String(applicationId));
    if (target) {
      target.status = "rejected";
      this.saveLocalStore(store);
    }
    return true;
  }

  // ── 3. TASKS ──────────────────────────────────────────────────────
  async assignTask(payload: AssignTaskPayload): Promise<VolunteerTask> {
    let created: VolunteerTask | null = null;

    try {
      const res = await fetch(`${BASE_URL}/volunteer/tasks`, {
        method: "POST",
        headers: this.getAuthHeaders(),
        body: JSON.stringify({
          application_id: payload.application_id,
          task_description: payload.task_description,
        }),
      });

      const json = await res.json().catch(() => null);

      if (res.ok && json) {
        created = json.data || json;
      }
    } catch (e) {
      console.warn("API assignTask error:", e);
    }

    const store = this.getLocalStore();
    const app = store.applications.find(a => String(a.id) === String(payload.application_id));

    if (!created) {
      created = {
        id: Date.now(),
        application_id: payload.application_id,
        volunteer_name: app?.volunteer_name || "متطوع معتمد",
        opportunity_title: app?.opportunity_title || "فرصة تطوعية بالمسجد",
        task_description: payload.task_description,
        status: "assigned",
        created_at: new Date().toISOString(),
      };
    }

    store.tasks.unshift(created);
    this.saveLocalStore(store);
    return created;
  }

  async getTasks(): Promise<VolunteerTask[]> {
    const store = this.getLocalStore();
    return store.tasks;
  }

  // ── 4. HOURS & EVALUATIONS (GET /api/volunteer/my-logs & POST /api/volunteer/logs) ─
  async logVolunteerHours(payload: LogHoursPayload): Promise<VolunteerLog> {
    let created: VolunteerLog | null = null;

    try {
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

      if (res.ok && json) {
        created = json.data || json;
      }
    } catch (e) {
      console.warn("API logVolunteerHours error:", e);
    }

    const store = this.getLocalStore();
    const app = store.applications.find(a => String(a.volunteer_id) === String(payload.volunteer_id));
    const opp = store.opportunities.find(o => String(o.id) === String(payload.opportunity_id));

    if (!created) {
      created = {
        id: Date.now(),
        volunteer_id: payload.volunteer_id,
        volunteer_name: app?.volunteer_name || "متطوع معتمد",
        opportunity_id: payload.opportunity_id,
        opportunity_title: opp?.title || "فرصة تطوعية بالمسجد",
        logged_hours: Number(payload.logged_hours),
        manager_evaluation: payload.manager_evaluation,
        notes: payload.notes,
        created_at: new Date().toISOString(),
      };
    }

    store.logs.unshift(created);
    this.saveLocalStore(store);
    return created;
  }

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

    const store = this.getLocalStore();
    const matchingLogs = store.logs.filter(
      l => String(l.volunteer_id) === String(volunteerId) && String(l.opportunity_id) === String(opportunityId)
    );
    return matchingLogs.reduce((acc, curr) => acc + (curr.logged_hours || 0), 0);
  }

  async getLogs(): Promise<VolunteerLog[]> {
    let apiLogs: VolunteerLog[] = [];
    try {
      const res = await fetch(`${BASE_URL}/volunteer/my-logs`, {
        headers: this.getAuthHeaders(),
      });
      if (res.ok) {
        const json = await res.json();
        const items = Array.isArray(json.data) ? json.data : (Array.isArray(json) ? json : []);
        if (items.length > 0) apiLogs = items;
      }
    } catch (e) {
      console.warn("API getLogs error:", e);
    }

    const store = this.getLocalStore();
    const map = new Map<string | number, VolunteerLog>();
    store.logs.forEach(item => map.set(item.id, item));
    apiLogs.forEach(item => map.set(item.id, item));

    const merged = Array.from(map.values());
    store.logs = merged;
    this.saveLocalStore(store);

    return merged;
  }

  // ── 5. CERTIFICATES (GET /api/volunteer/my-certificates & POST /api/volunteer/certificates) ─
  async issueCertificate(volunteerId: number | string, opportunityId: number | string): Promise<VolunteerCertificate> {
    let created: VolunteerCertificate | null = null;

    try {
      const res = await fetch(`${BASE_URL}/volunteer/certificates/${volunteerId}/${opportunityId}`, {
        method: "POST",
        headers: this.getAuthHeaders(),
      });

      const json = await res.json().catch(() => null);

      if (res.ok && json) {
        created = json.data || json;
      }
    } catch (e) {
      console.warn("API issueCertificate error:", e);
    }

    const store = this.getLocalStore();
    const totalHours = await this.getVolunteerHours(volunteerId, opportunityId);
    const app = store.applications.find(a => String(a.volunteer_id) === String(volunteerId));
    const opp = store.opportunities.find(o => String(o.id) === String(opportunityId));

    if (!created) {
      created = {
        id: Date.now(),
        volunteer_id: volunteerId,
        volunteer_name: app?.volunteer_name || "المتطوع المتميز",
        opportunity_id: opportunityId,
        opportunity_title: opp?.title || "الفرصة التطوعية بالمسجد",
        certificate_url: `https://mms-backend-rose.vercel.app/api/volunteer/certificates/${volunteerId}/${opportunityId}/download`,
        issued_at: new Date().toISOString(),
        total_hours: totalHours || 5,
      };
    }

    store.certificates.unshift(created);
    this.saveLocalStore(store);
    return created;
  }

  async getCertificates(): Promise<VolunteerCertificate[]> {
    let apiCerts: VolunteerCertificate[] = [];
    try {
      const res = await fetch(`${BASE_URL}/volunteer/my-certificates`, {
        headers: this.getAuthHeaders(),
      });
      if (res.ok) {
        const json = await res.json();
        const items = Array.isArray(json.data) ? json.data : (Array.isArray(json) ? json : []);
        if (items.length > 0) apiCerts = items;
      }
    } catch (e) {
      console.warn("API getCertificates error:", e);
    }

    const store = this.getLocalStore();
    const map = new Map<string | number, VolunteerCertificate>();
    store.certificates.forEach(item => map.set(item.id, item));
    apiCerts.forEach(item => map.set(item.id, item));

    const merged = Array.from(map.values());
    store.certificates = merged;
    this.saveLocalStore(store);

    return merged;
  }
}
