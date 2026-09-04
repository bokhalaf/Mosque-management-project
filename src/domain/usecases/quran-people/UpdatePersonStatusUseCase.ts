import { IQuranPeopleRepository } from "../../repositories/IQuranPeopleRepository";

export class UpdatePersonStatusUseCase {
  constructor(private repository: IQuranPeopleRepository) {}

  async execute(id: string | number, status: 'active' | 'pending_invitation' | 'inactive'): Promise<boolean> {
    return this.repository.updatePersonStatus(id, status);
  }
}
