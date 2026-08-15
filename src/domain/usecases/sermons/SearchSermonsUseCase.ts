// ==============================
// Domain Use Case — SearchSermonsUseCase
// Swagger: searchSermons (GET /api/sermons/search)
// ==============================

import { ISermonRepository } from "../../repositories/ISermonRepository";
import { PaginatedSermons } from "../../entities/Sermon";

export class SearchSermonsUseCase {
  constructor(private sermonRepository: ISermonRepository) {}

  async execute(query?: string, page: number = 1, limit: number = 6, category?: string): Promise<PaginatedSermons> {
    return this.sermonRepository.searchSermons(query, page, limit, category);
  }
}
