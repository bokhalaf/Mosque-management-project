import { IManagerProfileRepository } from "../../repositories/IManagerProfileRepository";

export class ChangeManagerPasswordUseCase {
  constructor(private managerProfileRepository: IManagerProfileRepository) {}

  async execute(
    currentPassword: string,
    newPassword: string,
    newPasswordConfirmation: string
  ): Promise<boolean> {
    return await this.managerProfileRepository.changePassword(
      currentPassword,
      newPassword,
      newPasswordConfirmation
    );
  }
}
