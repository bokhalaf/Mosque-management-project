import { IVolunteerRepository } from "../../repositories/IVolunteerRepository";
import { CreateOpportunityPayload, VolunteerOpportunity } from "../../entities/Volunteer";

export class CreateVolunteerOpportunityUseCase {
  constructor(private repository: IVolunteerRepository) {}

  async execute(payload: CreateOpportunityPayload): Promise<VolunteerOpportunity> {
    return this.repository.createOpportunity(payload);
  }
}
