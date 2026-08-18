import { IMosqueTaskRepository } from '../../repositories/IMosqueTaskRepository';
import { MosqueTask } from '../../entities/MosqueTask';

export class ToggleTaskCompleteUseCase {
  constructor(private repo: IMosqueTaskRepository) {}

  async execute(id: number | string): Promise<MosqueTask> {
    return this.repo.toggleTaskComplete(id);
  }
}
