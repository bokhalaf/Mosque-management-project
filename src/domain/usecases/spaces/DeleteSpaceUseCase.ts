import { ISpaceRepository } from "../../repositories/ISpaceRepository";

export class DeleteSpaceUseCase {
  constructor(private spaceRepository: ISpaceRepository) {}

  async execute(mosqueId: number | string, spaceId: number | string): Promise<boolean> {
    return await this.spaceRepository.deleteSpace(mosqueId, spaceId);
  }
}
