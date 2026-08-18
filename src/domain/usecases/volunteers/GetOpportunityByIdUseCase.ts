import { IVolunteerRepository } from "../../repositories/IVolunteerRepository";
import { VolunteerOpportunity } from "../../entities/Volunteer";

export class GetOpportunityByIdUseCase {
  constructor(private repository: IVolunteerRepository) {}

  async execute(id: number | string): Promise<VolunteerOpportunity | null> {
    return await this.repository.getOpportunityById(id);
  }
}
