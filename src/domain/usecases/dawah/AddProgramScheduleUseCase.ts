import { CreateProgramSchedulePayload, ProgramSchedule } from "../../entities/DawahProgram";
import { IDawahProgramRepository } from "../../repositories/IDawahProgramRepository";

export class AddProgramScheduleUseCase {
  constructor(private repository: IDawahProgramRepository) {}

  async execute(programId: number | string, payload: CreateProgramSchedulePayload): Promise<ProgramSchedule> {
    return await this.repository.addSchedule(programId, payload);
  }
}
