import { IVolunteerRepository } from "../../repositories/IVolunteerRepository";
import { LogHoursPayload, VolunteerLog } from "../../entities/Volunteer";

export class LogVolunteerHoursUseCase {
  constructor(private repository: IVolunteerRepository) {}

  async execute(payload: LogHoursPayload): Promise<VolunteerLog> {
    return this.repository.logVolunteerHours(payload);
  }
}
