import { SystemSetting, ExchangeRateResponse } from '../entities/Settings';

export interface ISettingsRepository {
  getSettings(): Promise<SystemSetting[]>;
  updateExchangeRate(rate: number): Promise<ExchangeRateResponse>;
}
