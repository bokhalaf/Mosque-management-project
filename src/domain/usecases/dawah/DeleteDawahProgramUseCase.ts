import { IDawahProgramRepository } from "../../repositories/IDawahProgramRepository";

export class DeleteDawahProgramUseCase {
  constructor(private repository: IDawahProgramRepository) {}

  async execute(id: number | string): Promise<boolean> {
    return await this.repository.deleteDawahProgram(id);
  }
}
