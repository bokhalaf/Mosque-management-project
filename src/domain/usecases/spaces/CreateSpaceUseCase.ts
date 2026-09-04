import { MosqueSpace, CreateSpacePayload } from "../../entities/Space";
import { ISpaceRepository } from "../../repositories/ISpaceRepository";

export class CreateSpaceUseCase {
  constructor(private spaceRepository: ISpaceRepository) {}

  async execute(mosqueId: number | string, payload: CreateSpacePayload): Promise<MosqueSpace> {
    return await this.spaceRepository.createSpace(mosqueId, payload);
  }
}
