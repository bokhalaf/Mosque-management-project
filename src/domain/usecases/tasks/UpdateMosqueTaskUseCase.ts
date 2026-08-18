import { IMosqueTaskRepository } from '../../repositories/IMosqueTaskRepository';
import { MosqueTask, UpdateMosqueTaskPayload } from '../../entities/MosqueTask';

export class UpdateMosqueTaskUseCase {
  constructor(private repo: IMosqueTaskRepository) {}

  async execute(id: number | string, payload: UpdateMosqueTaskPayload): Promise<MosqueTask> {
    return this.repo.updateMosqueTask(id, payload);
  }
}
