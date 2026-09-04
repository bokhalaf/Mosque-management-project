import { SystemSetting } from "../../entities/Settings";
import { ISettingsRepository } from "../../repositories/ISettingsRepository";

export class GetSettingsUseCase {
  constructor(private settingsRepository: ISettingsRepository) {}

  async execute(): Promise<SystemSetting[]> {
    return await this.settingsRepository.getSettings();
  }
}
