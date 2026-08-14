// ==============================
// Domain Use Case — StoreSermonSelectionUseCase
// Swagger: storeSermonSelection (POST /api/sermon-selections)
// ==============================

import { ISermonRepository } from "../../repositories/ISermonRepository";
import { SermonSelection, StoreSermonSelectionPayload } from "../../entities/Sermon";

export class StoreSermonSelectionUseCase {
  constructor(private sermonRepository: ISermonRepository) {}

  async execute(payload: StoreSermonSelectionPayload): Promise<SermonSelection> {
    return this.sermonRepository.storeSermonSelection(payload);
  }
}
