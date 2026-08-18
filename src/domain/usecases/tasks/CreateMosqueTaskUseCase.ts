import { IMosqueTaskRepository } from '../../repositories/IMosqueTaskRepository';
import { MosqueTask, CreateMosqueTaskPayload } from '../../entities/MosqueTask';

export class CreateMosqueTaskUseCase {
  constructor(private repo: IMosqueTaskRepository) {}

  async execute(payload: CreateMosqueTaskPayload): Promise<MosqueTask> {
    return this.repo.createMosqueTask(payload);
  }
}
