// ==============================
// 3️⃣ طبقة Domain — Use Case
// قاعدة عمل: تحديث طلب صيانة (maintenance.update)
// ==============================

import { MaintenanceRequestItem, CreateMaintenancePayload } from "../../entities/Maintenance";
import { IMaintenanceRepository } from "../../repositories/IMaintenanceRepository";

export class UpdateMaintenanceRequestUseCase {
  constructor(private maintenanceRepository: IMaintenanceRepository) {}

  async execute(
    id: string | number,
    payload: Partial<CreateMaintenancePayload> & { status?: string }
  ): Promise<MaintenanceRequestItem> {
    return await this.maintenanceRepository.updateMaintenanceRequest(id, payload);
  }
}
