import { IVolunteerRepository } from "../../repositories/IVolunteerRepository";
import { VolunteerTask } from "../../entities/Volunteer";

export class CreateOpportunityTaskUseCase {
  constructor(private repository: IVolunteerRepository) {}

  async execute(opportunityId: number | string, taskDescription: string): Promise<VolunteerTask> {
    return await this.repository.createOpportunityTask(opportunityId, taskDescription);
  }
}
