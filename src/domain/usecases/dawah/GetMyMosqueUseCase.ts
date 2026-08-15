import { MyMosqueDetails } from "../../entities/DawahProgram";
import { IDawahProgramRepository } from "../../repositories/IDawahProgramRepository";

export class GetMyMosqueUseCase {
  constructor(private repository: IDawahProgramRepository) {}

  async execute(): Promise<MyMosqueDetails | null> {
    return await this.repository.getMyMosque();
  }
}
