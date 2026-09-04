// ==============================
// Domain Repository Interface — IDashboardRepository
// One method per distinct raw network call previously inlined in
// src/presentation/hooks/useDashboardData.ts. Each method mirrors the
// original fetch's URL + `r.ok ? r.json() : null` / `.catch(() => null)`
// behavior exactly — the raw (unmapped) JSON response is returned so the
// existing response-combining/mapping logic in the hook keeps working
// unchanged. Methods return `any` because callers (the hook) apply their
// own historically-tolerant shape normalization to whatever the backend
// actually sends back.
// ==============================

export interface IDashboardRepository {
  /** GET /admin/super-dashboard */
  getSuperAdminDashboard(): Promise<any>;

  /** GET /admin/mosque-operations?per_page={perPage} */
  getMosqueOperations(perPage: number): Promise<any>;

  /** GET /settings */
  getSettings(): Promise<any>;

  /** GET /dashboard/mosque-manager */
  getMosqueManagerDashboard(): Promise<any>;

  /** GET /dashboard/mosque-manager/statistics */
  getMosqueManagerStatistics(): Promise<any>;

  /** GET /sermon-selections/upcoming */
  getUpcomingSermonSelection(): Promise<any>;

  /** GET /mosque/tasks?date={date} */
  getMosqueTasks(date: string): Promise<any>;

  /** GET /dashboard/mosque-manager/mosque-operations?per_page={perPage} */
  getMosqueManagerOperations(perPage: number): Promise<any>;

  /** GET /mosque/campaigns?status=active&per_page={perPage} */
  getMosqueCampaigns(perPage: number): Promise<any>;

  /** GET /complaints/recent */
  getRecentComplaints(): Promise<any>;
}
