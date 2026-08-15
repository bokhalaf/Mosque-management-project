import { MosqueSpace } from "../../entities/DawahProgram";
import { IDawahProgramRepository } from "../../repositories/IDawahProgramRepository";

export class GetMosqueSpacesUseCase {
  constructor(private repository: IDawahProgramRepository) {}

  async execute(mosqueId?: number): Promise<MosqueSpace[]> {
    return await this.repository.getMosqueSpaces(mosqueId);
  }
}
