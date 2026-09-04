import { ManagerProfile, UpdateProfilePayload } from "../../entities/ManagerProfile";
import { IManagerProfileRepository } from "../../repositories/IManagerProfileRepository";

export class UpdateManagerProfileUseCase {
  constructor(private managerProfileRepository: IManagerProfileRepository) {}

  async execute(payload: UpdateProfilePayload): Promise<ManagerProfile> {
    return await this.managerProfileRepository.updateProfile(payload);
  }
}
