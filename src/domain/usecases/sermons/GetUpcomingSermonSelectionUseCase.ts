// ==============================
// Domain Use Case — GetUpcomingSermonSelectionUseCase
// Swagger: upcomingSermonSelections (GET /api/sermon-selections/upcoming)
// ==============================

import { ISermonRepository } from "../../repositories/ISermonRepository";
import { SermonSelection } from "../../entities/Sermon";

export class GetUpcomingSermonSelectionUseCase {
  constructor(private sermonRepository: ISermonRepository) {}

  async execute(): Promise<SermonSelection | null> {
    return this.sermonRepository.getUpcomingSermonSelection();
  }
}
