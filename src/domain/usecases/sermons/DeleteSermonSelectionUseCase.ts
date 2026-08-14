// ==============================
// Domain Use Case — DeleteSermonSelectionUseCase
// Swagger: deleteSermonSelection (DELETE /api/sermon-selections/{id})
// ==============================

import { ISermonRepository } from "../../repositories/ISermonRepository";

export class DeleteSermonSelectionUseCase {
  constructor(private sermonRepository: ISermonRepository) {}

  async execute(id: string | number): Promise<void> {
    await this.sermonRepository.deleteSermonSelection(id);
  }
}
