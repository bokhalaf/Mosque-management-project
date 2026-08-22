import { IVolunteerRepository } from "../../repositories/IVolunteerRepository";
import { VolunteerApplication } from "../../entities/Volunteer";

export class GetOpportunityApplicationsUseCase {
  constructor(private repository: IVolunteerRepository) {}

  async execute(
    opportunityId?: number | string,
    status?: string,
    page?: number,
    perPage?: number
  ): Promise<VolunteerApplication[]> {
    return this.repository.getOpportunityApplications(opportunityId, status, page, perPage);
  }
}
