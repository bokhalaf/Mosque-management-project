import { IDashboardRepository } from "../../repositories/IDashboardRepository";

export class GetUpcomingSermonSelectionUseCase {
  constructor(private dashboardRepository: IDashboardRepository) {}

  async execute(): Promise<any> {
    return await this.dashboardRepository.getUpcomingSermonSelection();
  }
}
