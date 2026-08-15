// ==============================
// Domain Use Case — DeleteSermonUseCase
// Swagger: deleteSermon (DELETE /api/sermons/{id})
// ==============================

import { ISermonRepository } from "../../repositories/ISermonRepository";

export class DeleteSermonUseCase {
  constructor(private sermonRepository: ISermonRepository) {}

  async execute(id: string | number): Promise<void> {
    return this.sermonRepository.deleteSermon(id);
  }
}
