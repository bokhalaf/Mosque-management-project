import { CreateTameemPayload, Tameem } from "../../entities/Tameem";
import { ITameemRepository } from "../../repositories/ITameemRepository";

export class CreateTameemUseCase {
  constructor(private tameemRepository: ITameemRepository) {}

  async execute(payload: CreateTameemPayload): Promise<Tameem> {
    return await this.tameemRepository.createTameem(payload);
  }
}
