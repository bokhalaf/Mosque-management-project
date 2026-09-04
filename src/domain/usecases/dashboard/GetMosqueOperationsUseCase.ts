import { IDashboardRepository } from "../../repositories/IDashboardRepository";

export class GetMosqueOperationsUseCase {
  constructor(private dashboardRepository: IDashboardRepository) {}

  async execute(perPage: number = 5): Promise<any> {
    return await this.dashboardRepository.getMosqueOperations(perPage);
  }
}
