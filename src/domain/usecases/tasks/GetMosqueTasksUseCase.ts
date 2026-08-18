import { IMosqueTaskRepository } from '../../repositories/IMosqueTaskRepository';
import { MosqueTask } from '../../entities/MosqueTask';

export class GetMosqueTasksUseCase {
  constructor(private repo: IMosqueTaskRepository) {}

  async execute(params?: { mosque_id?: number; category?: string; date?: string; status?: string }): Promise<MosqueTask[]> {
    return this.repo.getMosqueTasks(params);
  }
}
