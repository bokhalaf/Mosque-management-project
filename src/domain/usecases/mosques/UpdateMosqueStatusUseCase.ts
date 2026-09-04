import { IMosqueRepository } from "../../repositories/IMosqueRepository";

export class UpdateMosqueStatusUseCase {
  constructor(private mosqueRepository: IMosqueRepository) {}

  execute(id: string | number, status: 'active' | 'inactive' | 'maintenance' | 'closed'): Promise<void> {
    return this.mosqueRepository.updateMosqueStatus(id, status);
  }
}
