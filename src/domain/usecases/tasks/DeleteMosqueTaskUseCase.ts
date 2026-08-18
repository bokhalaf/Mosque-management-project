import { IMosqueTaskRepository } from '../../repositories/IMosqueTaskRepository';

export class DeleteMosqueTaskUseCase {
  constructor(private repo: IMosqueTaskRepository) {}

  async execute(id: number | string): Promise<boolean> {
    return this.repo.deleteMosqueTask(id);
  }
}
