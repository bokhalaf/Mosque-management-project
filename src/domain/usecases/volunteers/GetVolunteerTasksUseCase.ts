import { IVolunteerRepository } from "../../repositories/IVolunteerRepository";
import { VolunteerTask } from "../../entities/Volunteer";

export class GetVolunteerTasksUseCase {
  constructor(private repository: IVolunteerRepository) {}

  async execute(): Promise<VolunteerTask[]> {
    return this.repository.getTasks();
  }
}
