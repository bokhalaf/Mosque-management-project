import { IQuranPeopleRepository } from "../../repositories/IQuranPeopleRepository";
import { SendInvitationPayload } from "../../entities/QuranPeople";

export class SendInvitationUseCase {
  constructor(private repository: IQuranPeopleRepository) {}

  async execute(payload: SendInvitationPayload): Promise<{ success: boolean; message: string; invitation?: any }> {
    return this.repository.sendInvitation(payload);
  }
}
