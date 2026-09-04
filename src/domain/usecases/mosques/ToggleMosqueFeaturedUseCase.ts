import { IMosqueRepository } from "../../repositories/IMosqueRepository";

export class ToggleMosqueFeaturedUseCase {
  constructor(private mosqueRepository: IMosqueRepository) {}

  execute(id: string | number): Promise<boolean> {
    return this.mosqueRepository.toggleMosqueFeatured(id);
  }
}
