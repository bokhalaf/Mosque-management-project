import { IQuranPeopleRepository } from "../../repositories/IQuranPeopleRepository";
import { QuranPerson } from "../../entities/QuranPeople";

export class GetQuranPeopleUseCase {
  constructor(private repository: IQuranPeopleRepository) {}

  async execute(params?: { role?: string; status?: string; q?: string; page?: number; per_page?: number }): Promise<{ data: QuranPerson[]; pagination: { currentPage: number; lastPage: number; total: number; perPage: number } }> {
    return this.repository.getPeople(params);
  }
}
