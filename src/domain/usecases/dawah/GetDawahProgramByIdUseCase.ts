import { DawahProgram } from "../../entities/DawahProgram";
import { IDawahProgramRepository } from "../../repositories/IDawahProgramRepository";

export class GetDawahProgramByIdUseCase {
  constructor(private repository: IDawahProgramRepository) {}

  async execute(id: number | string): Promise<DawahProgram | null> {
    return await this.repository.getDawahProgramById(id);
  }
}
