import { ConfirmEmailPayload } from "../../entities/ManagerProfile";
import { IManagerProfileRepository } from "../../repositories/IManagerProfileRepository";

export class ConfirmManagerEmailUseCase {
  constructor(private managerProfileRepository: IManagerProfileRepository) {}

  async execute(payload: ConfirmEmailPayload): Promise<boolean> {
    return await this.managerProfileRepository.confirmEmail(payload);
  }
}
