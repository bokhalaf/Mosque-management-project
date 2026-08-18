import { IMosqueTaskRepository } from '../../repositories/IMosqueTaskRepository';
import { MosqueTask } from '../../entities/MosqueTask';

export class GetNextWeekTasksUseCase {
  constructor(private repo: IMosqueTaskRepository) {}

  async execute(): Promise<MosqueTask[]> {
    return this.repo.getNextWeekTasks();
  }
}
