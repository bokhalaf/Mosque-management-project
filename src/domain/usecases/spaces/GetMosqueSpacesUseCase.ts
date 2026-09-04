import { MosqueSpace } from "../../entities/Space";
import { ISpaceRepository } from "../../repositories/ISpaceRepository";

export class GetMosqueSpacesUseCase {
  constructor(private spaceRepository: ISpaceRepository) {}

  async execute(mosqueId: number | string): Promise<MosqueSpace[]> {
    return await this.spaceRepository.getMosqueSpaces(mosqueId);
  }
}
