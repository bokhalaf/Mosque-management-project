// ==============================
// 3️⃣ طبقة Domain — Use Case
// قاعدة عمل: حذف طلب صيانة (maintenance.destroy)
// ==============================

import { IMaintenanceRepository } from "../../repositories/IMaintenanceRepository";

export class DeleteMaintenanceRequestUseCase {
  constructor(private maintenanceRepository: IMaintenanceRepository) {}

  async execute(id: string | number): Promise<void> {
    await this.maintenanceRepository.deleteMaintenanceRequest(id);
  }
}
