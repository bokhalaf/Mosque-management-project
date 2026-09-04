// ==============================
// Domain Use Case — CreateSermonUseCase
// Swagger: createSermon (POST /api/sermons)
// ==============================

import { ISermonRepository } from "../../repositories/ISermonRepository";
import { CreateSermonPayload, Sermon } from "../../entities/Sermon";

export class CreateSermonUseCase {
  constructor(private sermonRepository: ISermonRepository) {}

  async execute(payload: CreateSermonPayload): Promise<Sermon> {
    return this.sermonRepository.createSermon(payload);
  }
}
