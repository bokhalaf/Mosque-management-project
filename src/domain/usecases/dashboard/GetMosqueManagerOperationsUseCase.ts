import { IDashboardRepository } from "../../repositories/IDashboardRepository";

export class GetMosqueManagerOperationsUseCase {
  constructor(private dashboardRepository: IDashboardRepository) {}

  async execute(perPage: number = 6): Promise<any> {
    return await this.dashboardRepository.getMosqueManagerOperations(perPage);
  }
}
