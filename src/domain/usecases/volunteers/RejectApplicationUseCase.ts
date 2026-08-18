import { IVolunteerRepository } from "../../repositories/IVolunteerRepository";

export class RejectApplicationUseCase {
  constructor(private repository: IVolunteerRepository) {}

  async execute(applicationId: number | string): Promise<boolean> {
    return this.repository.rejectApplication(applicationId);
  }
}
