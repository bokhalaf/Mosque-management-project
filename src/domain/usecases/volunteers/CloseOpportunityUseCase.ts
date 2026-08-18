import { IVolunteerRepository } from "../../repositories/IVolunteerRepository";

export class CloseOpportunityUseCase {
  constructor(private repository: IVolunteerRepository) {}

  async execute(id: number | string): Promise<boolean> {
    return this.repository.closeOpportunity(id);
  }
}
