import { ITameemRepository } from "../../repositories/ITameemRepository";

export class DeleteTameemUseCase {
  constructor(private tameemRepository: ITameemRepository) {}

  async execute(id: string | number): Promise<void> {
    return await this.tameemRepository.deleteTameem(id);
  }
}
