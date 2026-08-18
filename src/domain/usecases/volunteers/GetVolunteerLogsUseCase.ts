import { IVolunteerRepository } from "../../repositories/IVolunteerRepository";
import { VolunteerLog } from "../../entities/Volunteer";

export class GetVolunteerLogsUseCase {
  constructor(private repository: IVolunteerRepository) {}

  async execute(): Promise<VolunteerLog[]> {
    return this.repository.getLogs();
  }
}
