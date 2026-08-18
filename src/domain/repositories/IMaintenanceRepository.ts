// ==============================
// Domain Repository Interface — IMaintenanceRepository
// ==============================

import { 
  MaintenanceStats, 
  MaintenanceRequestItem, 
  PaginatedMaintenanceRequests,
  CreateMaintenancePayload 
} from "../entities/Maintenance";

export interface GetMaintenanceParams {
  status?: string;
  category?: string;
  priority?: string;
  per_page?: number;
  page?: number;
  q?: string;
}

export interface IMaintenanceRepository {
  // Swagger Endpoints
  getMaintenancePageStats(): Promise<MaintenanceStats>;
  getMaintenanceRequests(params?: GetMaintenanceParams): Promise<PaginatedMaintenanceRequests>;
  searchMaintenanceRequests?(params?: GetMaintenanceParams): Promise<PaginatedMaintenanceRequests>;
  getRecentMaintenanceRequests(params?: GetMaintenanceParams): Promise<MaintenanceRequestItem[]>;
  getMaintenanceDetails(id: string | number): Promise<MaintenanceRequestItem>;
  trackMaintenanceRequest?(id: string | number): Promise<any>;
  createMaintenanceRequest(payload: CreateMaintenancePayload): Promise<MaintenanceRequestItem>;
  updateMaintenanceRequest(id: string | number, payload: Partial<CreateMaintenancePayload> & { status?: string }): Promise<MaintenanceRequestItem>;
  deleteMaintenanceRequest(id: string | number): Promise<void>;
  processAdminMaintenanceRequest?(id: string | number, status: 'in_progress' | 'completed' | 'cancelled', notes?: string): Promise<MaintenanceRequestItem>;
}
