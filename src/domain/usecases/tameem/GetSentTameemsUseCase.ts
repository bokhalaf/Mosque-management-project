import { ITameemRepository, PaginatedTameems } from "../../repositories/ITameemRepository";

export class GetSentTameemsUseCase {
  constructor(private tameemRepository: ITameemRepository) {}

  async execute(page?: number, limit?: number): Promise<PaginatedTameems> {
    return await this.tameemRepository.getSentTameems(page, limit);
  }
}
