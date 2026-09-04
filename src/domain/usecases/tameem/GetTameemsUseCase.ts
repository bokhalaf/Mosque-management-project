import { ITameemRepository, PaginatedTameems } from "../../repositories/ITameemRepository";

export class GetTameemsUseCase {
  constructor(private tameemRepository: ITameemRepository) {}

  async execute(page?: number, limit?: number): Promise<PaginatedTameems> {
    return await this.tameemRepository.getTameems(page, limit);
  }
}
