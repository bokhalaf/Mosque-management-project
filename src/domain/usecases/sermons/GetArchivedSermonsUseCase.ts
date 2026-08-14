// ==============================
// Domain Use Case — GetArchivedSermonsUseCase
// Swagger: Sermons index (GET /api/sermons?status=archived)
// ==============================

import { ISermonRepository } from "../../repositories/ISermonRepository";
import { Sermon } from "../../entities/Sermon";

export class GetArchivedSermonsUseCase {
  constructor(private sermonRepository: ISermonRepository) {}

  async execute(): Promise<Sermon[]> {
    return this.sermonRepository.getArchivedSermons();
  }
}
