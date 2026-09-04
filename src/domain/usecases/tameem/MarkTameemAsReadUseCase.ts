import { ITameemRepository } from "../../repositories/ITameemRepository";

export class MarkTameemAsReadUseCase {
  constructor(private tameemRepository: ITameemRepository) {}

  async execute(id: string | number): Promise<void> {
    return await this.tameemRepository.markTameemAsRead(id);
  }
}
