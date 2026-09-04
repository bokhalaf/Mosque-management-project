// ==============================
// Domain Use Case — GetPendingSermonsUseCase
// Swagger: Sermons index (GET /api/sermons/pending)
// ==============================

import { ISermonRepository } from "../../repositories/ISermonRepository";
import { PaginatedSermons } from "../../entities/Sermon";

export class GetPendingSermonsUseCase {
  constructor(private sermonRepository: ISermonRepository) {}

  async execute(page: number = 1, limit: number = 6): Promise<PaginatedSermons> {
    return this.sermonRepository.getPendingSermons(page, limit);
  }
}
