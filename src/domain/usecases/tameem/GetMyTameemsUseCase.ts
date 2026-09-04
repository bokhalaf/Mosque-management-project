import { ITameemRepository, PaginatedTameems } from "../../repositories/ITameemRepository";

export class GetMyTameemsUseCase {
  constructor(private tameemRepository: ITameemRepository) {}

  async execute(page?: number, limit?: number): Promise<PaginatedTameems> {
    return await this.tameemRepository.getMyTameems(page, limit);
  }
}
