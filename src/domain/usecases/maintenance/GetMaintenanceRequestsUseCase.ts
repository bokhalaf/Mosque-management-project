// ==============================
// 3️⃣ طبقة Domain — Use Case
// قاعدة عمل: جلب طلبات الصيانة مع الفلاتر
// ==============================

import { PaginatedMaintenanceRequests } from "../../entities/Maintenance";
import { IMaintenanceRepository, GetMaintenanceParams } from "../../repositories/IMaintenanceRepository";

export class GetMaintenanceRequestsUseCase {
  constructor(private maintenanceRepository: IMaintenanceRepository) {}

  async execute(params?: GetMaintenanceParams): Promise<PaginatedMaintenanceRequests> {
    return await this.maintenanceRepository.getMaintenanceRequests(params);
  }
}
