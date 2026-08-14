// ==============================
// Domain Use Case — SearchMaintenanceRequestsUseCase
// Swagger: searchMaintenanceRequests (GET /api/maintenance/search)
// ==============================

import { IMaintenanceRepository, GetMaintenanceParams } from "../../repositories/IMaintenanceRepository";
import { PaginatedMaintenanceRequests } from "../../entities/Maintenance";

export class SearchMaintenanceRequestsUseCase {
  constructor(private maintenanceRepository: IMaintenanceRepository) {}

  async execute(params?: GetMaintenanceParams): Promise<PaginatedMaintenanceRequests> {
    if (this.maintenanceRepository.searchMaintenanceRequests) {
      return this.maintenanceRepository.searchMaintenanceRequests(params);
    }
    return this.maintenanceRepository.getMaintenanceRequests(params);
  }
}
