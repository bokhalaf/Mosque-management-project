// ==============================
// DeleteSpaceUseCase — mosque-scoped "space" stub (see MosqueRepositoryImpl.deleteSpace,
// currently a no-op). Distinct from the real SpaceRepositoryImpl/ISpaceRepository
// used elsewhere in the app.
// ==============================

import { IMosqueRepository } from "../../repositories/IMosqueRepository";

export class DeleteSpaceUseCase {
  constructor(private mosqueRepository: IMosqueRepository) {}

  execute(mosqueId: string | number, spaceId: string | number): Promise<void> {
    return this.mosqueRepository.deleteSpace(mosqueId, spaceId);
  }
}
