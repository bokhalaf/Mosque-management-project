import { ExchangeRateResponse } from "../../entities/Settings";
import { ISettingsRepository } from "../../repositories/ISettingsRepository";

export class UpdateExchangeRateUseCase {
  constructor(private settingsRepository: ISettingsRepository) {}

  async execute(rate: number): Promise<ExchangeRateResponse> {
    return await this.settingsRepository.updateExchangeRate(rate);
  }
}
