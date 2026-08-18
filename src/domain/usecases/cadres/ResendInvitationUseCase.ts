import { IQuranPeopleRepository } from "../../repositories/IQuranPeopleRepository";

export class ResendInvitationUseCase {
  constructor(private repository: IQuranPeopleRepository) {}

  async execute(id: string | number): Promise<void> {
    return this.repository.resendInvitation(id);
  }
}
