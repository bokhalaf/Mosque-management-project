import { IVolunteerRepository } from "../../repositories/IVolunteerRepository";

export class ApproveApplicationUseCase {
  constructor(private repository: IVolunteerRepository) {}

  async execute(applicationId: number | string): Promise<boolean> {
    return this.repository.approveApplication(applicationId);
  }
}
