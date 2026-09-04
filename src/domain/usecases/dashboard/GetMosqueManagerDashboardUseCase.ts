import { IDashboardRepository } from "../../repositories/IDashboardRepository";

export class GetMosqueManagerDashboardUseCase {
  constructor(private dashboardRepository: IDashboardRepository) {}

  async execute(): Promise<any> {
    return await this.dashboardRepository.getMosqueManagerDashboard();
  }
}
