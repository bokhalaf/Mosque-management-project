import { IMosqueTaskRepository } from '../../repositories/IMosqueTaskRepository';
import { MosqueTask } from '../../entities/MosqueTask';

export class GetFridayTasksUseCase {
  constructor(private repo: IMosqueTaskRepository) {}

  async execute(): Promise<MosqueTask[]> {
    return this.repo.getFridayTasks();
  }
}
