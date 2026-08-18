import { IVolunteerRepository } from "../../repositories/IVolunteerRepository";
import { VolunteerTask } from "../../entities/Volunteer";

export class GetOpportunityTasksUseCase {
  constructor(private repository: IVolunteerRepository) {}

  async execute(opportunityId: number | string): Promise<VolunteerTask[]> {
    return await this.repository.getOpportunityTasks(opportunityId);
  }
}
