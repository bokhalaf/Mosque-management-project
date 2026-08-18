import { IVolunteerRepository } from "../../repositories/IVolunteerRepository";
import { VolunteerApplication } from "../../entities/Volunteer";

export class GetOpportunityApplicationsUseCase {
  constructor(private repository: IVolunteerRepository) {}

  async execute(opportunityId?: number | string): Promise<VolunteerApplication[]> {
    return this.repository.getOpportunityApplications(opportunityId);
  }
}
