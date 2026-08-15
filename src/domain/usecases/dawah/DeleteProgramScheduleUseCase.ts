import { IDawahProgramRepository } from "../../repositories/IDawahProgramRepository";

export class DeleteProgramScheduleUseCase {
  constructor(private repository: IDawahProgramRepository) {}

  async execute(programId: number | string, scheduleId: number | string): Promise<boolean> {
    return await this.repository.deleteSchedule(programId, scheduleId);
  }
}
