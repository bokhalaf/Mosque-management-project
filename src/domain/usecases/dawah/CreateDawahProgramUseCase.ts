import { CreateDawahProgramPayload, DawahProgram } from "../../entities/DawahProgram";
import { IDawahProgramRepository } from "../../repositories/IDawahProgramRepository";

export class CreateDawahProgramUseCase {
  constructor(private repository: IDawahProgramRepository) {}

  async execute(payload: CreateDawahProgramPayload): Promise<DawahProgram> {
    return await this.repository.createDawahProgram(payload);
  }
}
