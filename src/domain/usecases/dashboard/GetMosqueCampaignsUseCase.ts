import { IDashboardRepository } from "../../repositories/IDashboardRepository";

export class GetMosqueCampaignsUseCase {
  constructor(private dashboardRepository: IDashboardRepository) {}

  async execute(perPage: number = 4): Promise<any> {
    return await this.dashboardRepository.getMosqueCampaigns(perPage);
  }
}
