// ==============================
// Domain Use Case — GetArchivedSermonsUseCase
// Swagger: Sermons index (GET /api/sermons/archived)
// ==============================

import { ISermonRepository } from "../../repositories/ISermonRepository";
import { PaginatedSermons } from "../../entities/Sermon";

export class GetArchivedSermonsUseCase {
  constructor(private sermonRepository: ISermonRepository) {}

  async execute(page: number = 1, limit: number = 5): Promise<PaginatedSermons> {
    return this.sermonRepository.getArchivedSermons(page, limit);
  }
}
