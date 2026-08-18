import { IVolunteerRepository } from "../../repositories/IVolunteerRepository";
import { VolunteerOpportunity } from "../../entities/Volunteer";

export class GetVolunteerOpportunitiesUseCase {
  constructor(private repository: IVolunteerRepository) {}

  async execute(): Promise<VolunteerOpportunity[]> {
    return this.repository.getManagerOpportunities();
  }
}
