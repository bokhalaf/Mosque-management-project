import { MosqueDetail } from "../../entities/Mosque";
import { IMosqueRepository } from "../../repositories/IMosqueRepository";

export class GetMosqueDetailsUseCase {
  constructor(private mosqueRepository: IMosqueRepository) {}

  execute(id: string | number): Promise<MosqueDetail> {
    return this.mosqueRepository.getMosqueDetails(id);
  }
}
