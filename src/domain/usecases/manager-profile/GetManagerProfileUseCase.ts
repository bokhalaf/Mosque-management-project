import { ManagerProfile } from "../../entities/ManagerProfile";
import { IManagerProfileRepository } from "../../repositories/IManagerProfileRepository";

export class GetManagerProfileUseCase {
  constructor(private managerProfileRepository: IManagerProfileRepository) {}

  async execute(): Promise<ManagerProfile> {
    return await this.managerProfileRepository.getProfile();
  }
}
