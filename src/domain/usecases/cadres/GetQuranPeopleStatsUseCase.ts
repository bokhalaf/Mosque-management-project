import { IQuranPeopleRepository } from "../../repositories/IQuranPeopleRepository";
import { QuranPeopleStats } from "../../entities/QuranPeople";

export class GetQuranPeopleStatsUseCase {
  constructor(private repository: IQuranPeopleRepository) {}

  async execute(): Promise<QuranPeopleStats> {
    return this.repository.getStats();
  }
}
