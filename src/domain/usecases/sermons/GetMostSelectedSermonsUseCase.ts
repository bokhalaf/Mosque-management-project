// ==============================
// Domain Use Case — GetMostSelectedSermonsUseCase
// Swagger: getMostSelectedSermons (GET /api/sermons/most-selected)
// ==============================

import { ISermonRepository } from "../../repositories/ISermonRepository";
import { Sermon } from "../../entities/Sermon";

export class GetMostSelectedSermonsUseCase {
  constructor(private sermonRepository: ISermonRepository) {}

  async execute(): Promise<Sermon | Sermon[] | null> {
    return this.sermonRepository.getMostSelectedSermons();
  }
}
