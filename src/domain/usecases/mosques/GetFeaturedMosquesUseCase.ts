import { MosqueDetail } from "../../entities/Mosque";
import { IMosqueRepository } from "../../repositories/IMosqueRepository";

export class GetFeaturedMosquesUseCase {
  constructor(private mosqueRepository: IMosqueRepository) {}

  execute(): Promise<MosqueDetail[]> {
    return this.mosqueRepository.getFeaturedMosques();
  }
}
