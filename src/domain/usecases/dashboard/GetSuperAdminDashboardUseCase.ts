import { IDashboardRepository } from "../../repositories/IDashboardRepository";

export class GetSuperAdminDashboardUseCase {
  constructor(private dashboardRepository: IDashboardRepository) {}

  async execute(): Promise<any> {
    return await this.dashboardRepository.getSuperAdminDashboard();
  }
}
