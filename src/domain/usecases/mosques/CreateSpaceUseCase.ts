// ==============================
// CreateSpaceUseCase — mosque-scoped "space" stub (see MosqueRepositoryImpl.createSpace,
// currently a mock that does not hit a real endpoint). Distinct from the real
// SpaceRepositoryImpl/ISpaceRepository used elsewhere in the app.
// ==============================

import { IMosqueRepository } from "../../repositories/IMosqueRepository";

export class CreateSpaceUseCase {
  constructor(private mosqueRepository: IMosqueRepository) {}

  execute(mosqueId: string | number, payload: any): Promise<any> {
    return this.mosqueRepository.createSpace(mosqueId, payload);
  }
}
