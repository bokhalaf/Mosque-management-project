// ==============================
// Domain Use Case — SearchSermonsUseCase
// Swagger: searchSermons (GET /api/sermons/search)
// ==============================

import { ISermonRepository } from "../../repositories/ISermonRepository";
import { Sermon } from "../../entities/Sermon";

export class SearchSermonsUseCase {
  constructor(private sermonRepository: ISermonRepository) {}

  async execute(query: string): Promise<Sermon[]> {
    return this.sermonRepository.searchSermons(query);
  }
}
