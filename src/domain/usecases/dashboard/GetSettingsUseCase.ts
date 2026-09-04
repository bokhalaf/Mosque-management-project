import { IDashboardRepository } from "../../repositories/IDashboardRepository";

export class GetSettingsUseCase {
  constructor(private dashboardRepository: IDashboardRepository) {}

  async execute(): Promise<any> {
    return await this.dashboardRepository.getSettings();
  }
}
