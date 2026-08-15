import { UpdateDawahProgramPayload, DawahProgram } from "../../entities/DawahProgram";
import { IDawahProgramRepository } from "../../repositories/IDawahProgramRepository";

export class UpdateDawahProgramUseCase {
  constructor(private repository: IDawahProgramRepository) {}

  async execute(id: number | string, payload: UpdateDawahProgramPayload): Promise<DawahProgram> {
    return await this.repository.updateDawahProgram(id, payload);
  }
}
