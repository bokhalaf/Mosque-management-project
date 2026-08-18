import { IQuranPeopleRepository } from "../../repositories/IQuranPeopleRepository";

export class DeletePersonUseCase {
  constructor(private repository: IQuranPeopleRepository) {}

  async execute(id: string | number): Promise<boolean> {
    return this.repository.deletePerson(id);
  }
}
