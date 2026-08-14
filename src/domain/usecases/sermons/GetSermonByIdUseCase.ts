// ==============================
// Domain Use Case — GetSermonByIdUseCase
// Swagger: getSermonById (GET /api/sermons/{id})
// ==============================

import { ISermonRepository } from "../../repositories/ISermonRepository";
import { Sermon } from "../../entities/Sermon";

export class GetSermonByIdUseCase {
  constructor(private sermonRepository: ISermonRepository) {}

  async execute(id: string | number): Promise<Sermon> {
    return this.sermonRepository.getSermonById(id);
  }
}
