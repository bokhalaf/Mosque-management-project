import { CreateTameemForMosquePayload, Tameem } from "../../entities/Tameem";
import { ITameemRepository } from "../../repositories/ITameemRepository";

export class CreateTameemForMosqueUseCase {
  constructor(private tameemRepository: ITameemRepository) {}

  async execute(payload: CreateTameemForMosquePayload): Promise<Tameem> {
    return await this.tameemRepository.createTameemForMosque(payload);
  }
}
