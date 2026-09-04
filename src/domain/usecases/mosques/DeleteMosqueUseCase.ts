import { IMosqueRepository } from "../../repositories/IMosqueRepository";

export class DeleteMosqueUseCase {
  constructor(private mosqueRepository: IMosqueRepository) {}

  execute(id: string | number): Promise<void> {
    return this.mosqueRepository.deleteMosque(id);
  }
}
