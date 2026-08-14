// ==============================
// Domain Use Case — GetSermonSelectionsUseCase
// Swagger: sermonSelectionHistory (GET /api/sermon-selections)
// ==============================

import { ISermonRepository } from "../../repositories/ISermonRepository";
import { SermonSelection } from "../../entities/Sermon";

export class GetSermonSelectionsUseCase {
  constructor(private sermonRepository: ISermonRepository) {}

  async execute(params?: { from_date?: string; to_date?: string }): Promise<SermonSelection[]> {
    return this.sermonRepository.getSermonSelections(params);
  }
}
