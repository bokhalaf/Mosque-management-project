import { DawahProgramStats } from "../../entities/DawahProgram";
import { IDawahProgramRepository } from "../../repositories/IDawahProgramRepository";

export class GetDawahStatsUseCase {
  constructor(private repository: IDawahProgramRepository) {}

  async execute(): Promise<DawahProgramStats> {
    return await this.repository.getStats();
  }
}
