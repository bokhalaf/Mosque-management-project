// ==============================
// Domain UseCase — ProcessAdminMaintenanceUseCase
// معالجة طلب الصيانة من قبل الأدمن / السوبر أدمن
// Swagger: PUT /api/maintenance/admin/{id} (admin.maintenance.process)
// ==============================

import { MaintenanceRequestItem } from "../../entities/Maintenance";
import { IMaintenanceRepository } from "../../repositories/IMaintenanceRepository";

export class ProcessAdminMaintenanceUseCase {
  constructor(private repo: IMaintenanceRepository) {}

  async execute(
    id: string | number,
    status: 'in_progress' | 'completed' | 'cancelled',
    notes?: string
  ): Promise<MaintenanceRequestItem> {
    if (!this.repo.processAdminMaintenanceRequest) {
      return this.repo.updateMaintenanceRequest(id, { status, notes });
    }
    return this.repo.processAdminMaintenanceRequest(id, status, notes);
  }
}
