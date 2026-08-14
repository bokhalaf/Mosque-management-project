// ==============================
// Domain Use Case — GetMaintenanceDetailsUseCase
// Swagger: maintenance.show (GET /api/maintenance/{id})
// ==============================

import { IMaintenanceRepository } from "../../repositories/IMaintenanceRepository";
import { MaintenanceRequestItem } from "../../entities/Maintenance";

export class GetMaintenanceDetailsUseCase {
  constructor(private maintenanceRepository: IMaintenanceRepository) {}

  async execute(id: string | number): Promise<MaintenanceRequestItem> {
    return this.maintenanceRepository.getMaintenanceDetails(id);
  }
}
