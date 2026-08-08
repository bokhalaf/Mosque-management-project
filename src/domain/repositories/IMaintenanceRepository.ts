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
  getMaintenancePageStats(): Promise<MaintenanceStats>;
  getMaintenanceRequests(params?: GetMaintenanceParams): Promise<PaginatedMaintenanceRequests>;
  getRecentMaintenanceRequests(params?: GetMaintenanceParams): Promise<MaintenanceRequestItem[]>;
  getMaintenanceDetails(id: string | number): Promise<MaintenanceRequestItem>;
  createMaintenanceRequest(payload: CreateMaintenancePayload): Promise<MaintenanceRequestItem>;
  updateMaintenanceRequest(id: string | number, payload: Partial<CreateMaintenancePayload> & { status?: string }): Promise<MaintenanceRequestItem>;
  deleteMaintenanceRequest(id: string | number): Promise<void>;
}
