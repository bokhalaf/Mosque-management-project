// ==============================
// Domain Use Case — RejectSermonUseCase
// Swagger: rejectSermon (PUT /api/sermons/{id}/reject)
// ==============================

import { ISermonRepository } from "../../repositories/ISermonRepository";

export class RejectSermonUseCase {
  constructor(private sermonRepository: ISermonRepository) {}

  async execute(id: string | number, reason?: string): Promise<void> {
    return this.sermonRepository.rejectSermon(id, reason);
  }
}
