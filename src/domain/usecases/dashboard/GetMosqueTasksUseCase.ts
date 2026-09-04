import { IDashboardRepository } from "../../repositories/IDashboardRepository";

export class GetMosqueTasksUseCase {
  constructor(private dashboardRepository: IDashboardRepository) {}

  async execute(date: string): Promise<any> {
    return await this.dashboardRepository.getMosqueTasks(date);
  }
}
