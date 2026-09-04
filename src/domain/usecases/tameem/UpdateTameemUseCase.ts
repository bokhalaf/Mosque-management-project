import { Tameem, UpdateTameemPayload } from "../../entities/Tameem";
import { ITameemRepository } from "../../repositories/ITameemRepository";

export class UpdateTameemUseCase {
  constructor(private tameemRepository: ITameemRepository) {}

  async execute(id: string | number, payload: UpdateTameemPayload): Promise<Tameem> {
    return await this.tameemRepository.updateTameem(id, payload);
  }
}
