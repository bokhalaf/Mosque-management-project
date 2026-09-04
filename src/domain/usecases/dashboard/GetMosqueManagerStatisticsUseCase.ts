import { IDashboardRepository } from "../../repositories/IDashboardRepository";

export class GetMosqueManagerStatisticsUseCase {
  constructor(private dashboardRepository: IDashboardRepository) {}

  async execute(): Promise<any> {
    return await this.dashboardRepository.getMosqueManagerStatistics();
  }
}
