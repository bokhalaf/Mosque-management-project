import { ProgramSchedule, UpdateProgramSchedulePayload } from "../../entities/DawahProgram";
import { IDawahProgramRepository } from "../../repositories/IDawahProgramRepository";

export class UpdateProgramScheduleUseCase {
  constructor(private repository: IDawahProgramRepository) {}

  async execute(
    programId: number | string,
    scheduleId: number | string,
    payload: UpdateProgramSchedulePayload
  ): Promise<ProgramSchedule> {
    return await this.repository.updateSchedule(programId, scheduleId, payload);
  }
}
