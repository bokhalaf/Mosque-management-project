import { IVolunteerRepository } from "../../repositories/IVolunteerRepository";
import { CreateOpportunityPayload, VolunteerOpportunity } from "../../entities/Volunteer";

export class UpdateVolunteerOpportunityUseCase {
  constructor(private repository: IVolunteerRepository) {}

  async execute(id: number | string, payload: Partial<CreateOpportunityPayload>): Promise<VolunteerOpportunity> {
    return this.repository.updateOpportunity(id, payload);
  }
}
