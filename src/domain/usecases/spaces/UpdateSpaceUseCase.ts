import { MosqueSpace, UpdateSpacePayload } from "../../entities/Space";
import { ISpaceRepository } from "../../repositories/ISpaceRepository";

export class UpdateSpaceUseCase {
  constructor(private spaceRepository: ISpaceRepository) {}

  async execute(
    mosqueId: number | string,
    spaceId: number | string,
    payload: UpdateSpacePayload
  ): Promise<MosqueSpace> {
    return await this.spaceRepository.updateSpace(mosqueId, spaceId, payload);
  }
}
