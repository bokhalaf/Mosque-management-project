import { IDashboardRepository } from "../../repositories/IDashboardRepository";

export class GetRecentComplaintsUseCase {
  constructor(private dashboardRepository: IDashboardRepository) {}

  async execute(): Promise<any> {
    return await this.dashboardRepository.getRecentComplaints();
  }
}
