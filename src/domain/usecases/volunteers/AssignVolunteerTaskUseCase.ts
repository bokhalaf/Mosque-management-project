import { IVolunteerRepository } from "../../repositories/IVolunteerRepository";
import { AssignTaskPayload, VolunteerTask } from "../../entities/Volunteer";

export class AssignVolunteerTaskUseCase {
  constructor(private repository: IVolunteerRepository) {}

  async execute(payload: AssignTaskPayload): Promise<VolunteerTask> {
    return this.repository.assignTask(payload);
  }
}
