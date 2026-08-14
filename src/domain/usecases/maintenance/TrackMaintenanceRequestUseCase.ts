// ==============================
// Domain Use Case — TrackMaintenanceRequestUseCase
// Swagger: maintenance.track (GET /api/maintenance/track)
// ==============================

import { IMaintenanceRepository } from "../../repositories/IMaintenanceRepository";

export class TrackMaintenanceRequestUseCase {
  constructor(private maintenanceRepository: IMaintenanceRepository) {}

  async execute(id: string | number): Promise<any> {
    if (this.maintenanceRepository.trackMaintenanceRequest) {
      return this.maintenanceRepository.trackMaintenanceRequest(id);
    }
    return null;
  }
}
