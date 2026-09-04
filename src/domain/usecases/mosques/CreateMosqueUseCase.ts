import { MosqueDetail } from "../../entities/Mosque";
import { IMosqueRepository, CreateMosquePayload } from "../../repositories/IMosqueRepository";

export class CreateMosqueUseCase {
  constructor(private mosqueRepository: IMosqueRepository) {}

  execute(payload: CreateMosquePayload): Promise<MosqueDetail> {
    return this.mosqueRepository.createMosque(payload);
  }
}
