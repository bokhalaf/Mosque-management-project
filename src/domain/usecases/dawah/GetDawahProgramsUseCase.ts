import { DawahProgram } from "../../entities/DawahProgram";
import { IDawahProgramRepository } from "../../repositories/IDawahProgramRepository";

export class GetDawahProgramsUseCase {
  constructor(private repository: IDawahProgramRepository) {}

  async execute(params?: { mosque_id?: number; status?: string; type?: string; q?: string }): Promise<DawahProgram[]> {
    return await this.repository.getDawahPrograms(params);
  }
}
