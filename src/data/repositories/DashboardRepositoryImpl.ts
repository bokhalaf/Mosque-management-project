import { IDashboardRepository } from "../../domain/repositories/IDashboardRepository";
import { BASE_URL, getAuthHeaders as getSharedAuthHeaders } from "../http/apiClient";

// ==============================
// Data Repository — DashboardRepositoryImpl
// Moved verbatim from the raw `fetch()` calls previously inlined in
// src/presentation/hooks/useDashboardData.ts. Each method preserves the
// exact original network behavior: `r.ok ? r.json() : null` on success,
// `null` on any thrown/rejected error (dashboard fetches fail silently and
// let the caller fall back to defaults — they never throw).
// ==============================

export class DashboardRepositoryImpl implements IDashboardRepository {

  private getAuthHeaders(): HeadersInit {
    return getSharedAuthHeaders();
  }

  async getSuperAdminDashboard(): Promise<any> {
    const headers = this.getAuthHeaders();
    return fetch(`${BASE_URL}/admin/super-dashboard`, { headers })
      .then(r => r.ok ? r.json() : null)
      .catch(() => null);
  }

  async getMosqueOperations(perPage: number): Promise<any> {
    const headers = this.getAuthHeaders();
    return fetch(`${BASE_URL}/admin/mosque-operations?per_page=${perPage}`, { headers })
      .then(r => r.ok ? r.json() : null)
      .catch(() => null);
  }

  async getSettings(): Promise<any> {
    const headers = this.getAuthHeaders();
    return fetch(`${BASE_URL}/settings`, { headers })
      .then(r => r.ok ? r.json() : null)
      .catch(() => null);
  }

  async getMosqueManagerDashboard(): Promise<any> {
    const headers = this.getAuthHeaders();
    return fetch(`${BASE_URL}/dashboard/mosque-manager`, { headers })
      .then(r => r.ok ? r.json() : null)
      .catch(() => null);
  }

  async getMosqueManagerStatistics(): Promise<any> {
    const headers = this.getAuthHeaders();
    return fetch(`${BASE_URL}/dashboard/mosque-manager/statistics`, { headers })
      .then(r => r.ok ? r.json() : null)
      .catch(() => null);
  }

  async getUpcomingSermonSelection(): Promise<any> {
    const headers = this.getAuthHeaders();
    return fetch(`${BASE_URL}/sermon-selections/upcoming`, { headers })
      .then(r => r.ok ? r.json() : null)
      .catch(() => null);
  }

  async getMosqueTasks(date: string): Promise<any> {
    const headers = this.getAuthHeaders();
    return fetch(`${BASE_URL}/mosque/tasks?date=${date}`, { headers })
      .then(r => r.ok ? r.json() : null)
      .catch(() => null);
  }

  async getMosqueManagerOperations(perPage: number): Promise<any> {
    const headers = this.getAuthHeaders();
    return fetch(`${BASE_URL}/dashboard/mosque-manager/mosque-operations?per_page=${perPage}`, { headers })
      .then(r => r.ok ? r.json() : null)
      .catch(() => null);
  }

  async getMosqueCampaigns(perPage: number): Promise<any> {
    const headers = this.getAuthHeaders();
    return fetch(`${BASE_URL}/mosque/campaigns?status=active&per_page=${perPage}`, { headers })
      .then(r => r.ok ? r.json() : null)
      .catch(() => null);
  }

  async getRecentComplaints(): Promise<any> {
    const headers = this.getAuthHeaders();
    return fetch(`${BASE_URL}/complaints/recent`, { headers })
      .then(r => r.ok ? r.json() : null)
      .catch(() => null);
  }
}
