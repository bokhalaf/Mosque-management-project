// ==============================
// Domain Use Case — CreateMaintenanceRequestUseCase
// Swagger: maintenance.store (POST /api/maintenance)
// ==============================

import { IMaintenanceRepository } from "../../repositories/IMaintenanceRepository";
import { CreateMaintenancePayload, MaintenanceRequestItem } from "../../entities/Maintenance";

export class CreateMaintenanceRequestUseCase {
  constructor(private maintenanceRepository: IMaintenanceRepository) {}

  async execute(payload: CreateMaintenancePayload): Promise<MaintenanceRequestItem> {
    return this.maintenanceRepository.createMaintenanceRequest(payload);
  }
}
