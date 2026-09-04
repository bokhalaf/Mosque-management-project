import { GeoGovernorate } from "../../entities/Mosque";
import { IMosqueRepository } from "../../repositories/IMosqueRepository";

export class GetGeoCatalogUseCase {
  constructor(private mosqueRepository: IMosqueRepository) {}

  execute(): Promise<GeoGovernorate[]> {
    return this.mosqueRepository.getGeoCatalog();
  }
}
