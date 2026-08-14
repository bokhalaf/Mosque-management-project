// ==============================
// 3️⃣ طبقة Domain — Use Case
// قاعدة عمل: جلب إحصائيات صفحة الصيانة
// ==============================

import { MaintenanceStats } from "../../entities/Maintenance";
import { IMaintenanceRepository } from "../../repositories/IMaintenanceRepository";

export class GetMaintenanceStatsUseCase {
  constructor(private maintenanceRepository: IMaintenanceRepository) {}

  async execute(): Promise<MaintenanceStats> {
    return await this.maintenanceRepository.getMaintenancePageStats();
  }
}
