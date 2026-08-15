import { ProgramSchedule } from "../../entities/DawahProgram";
import { IDawahProgramRepository } from "../../repositories/IDawahProgramRepository";

export class GetProgramSchedulesUseCase {
  constructor(private repository: IDawahProgramRepository) {}

  async execute(programId: number | string): Promise<ProgramSchedule[]> {
    return await this.repository.getSchedules(programId);
  }
}
