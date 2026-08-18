import { IMosqueTaskRepository } from '../../repositories/IMosqueTaskRepository';
import { MosqueTaskDateTab } from '../../entities/MosqueTask';

export class GetMosqueTaskDateTabsUseCase {
  constructor(private repo: IMosqueTaskRepository) {}

  async execute(): Promise<MosqueTaskDateTab[]> {
    return this.repo.getDateTabs();
  }
}
