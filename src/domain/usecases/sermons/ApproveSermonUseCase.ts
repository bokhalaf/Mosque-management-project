// ==============================
// Domain Use Case — ApproveSermonUseCase
// Swagger: approveSermon (PUT /api/sermons/{id}/approve)
// ==============================

import { ISermonRepository } from "../../repositories/ISermonRepository";

export class ApproveSermonUseCase {
  constructor(private sermonRepository: ISermonRepository) {}

  async execute(id: string | number): Promise<void> {
    return this.sermonRepository.approveSermon(id);
  }
}
