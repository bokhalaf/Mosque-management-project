import { MosqueDetail, UpdateMosquePayload } from "../../entities/Mosque";
import { IMosqueRepository } from "../../repositories/IMosqueRepository";

export class UpdateMosqueDetailsUseCase {
  constructor(private mosqueRepository: IMosqueRepository) {}

  execute(id: string | number, payload: UpdateMosquePayload): Promise<MosqueDetail> {
    return this.mosqueRepository.updateMosqueDetails(id, payload);
  }
}
