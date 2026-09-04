import { Tameem } from "../../entities/Tameem";
import { ITameemRepository } from "../../repositories/ITameemRepository";

export class GetTameemByIdUseCase {
  constructor(private tameemRepository: ITameemRepository) {}

  async execute(id: string | number): Promise<Tameem> {
    return await this.tameemRepository.getTameemById(id);
  }
}
