// ==============================
// Presentation — Hook
// useSystemSettings: جلب إعدادات النظام وتحديث سعر الصرف عبر usecases
// مخصص للاستخدام من SystemSettingsSection بدل استدعاء الـ repository مباشرة.
// ==============================

import { useMemo } from 'react';
import { getSettingsRepository } from '../../data/factories/repositoryFactory';
import { GetSettingsUseCase } from '../../domain/usecases/settings/GetSettingsUseCase';
import { UpdateExchangeRateUseCase } from '../../domain/usecases/settings/UpdateExchangeRateUseCase';
import { SystemSetting, ExchangeRateResponse } from '../../domain/entities/Settings';

export function useSystemSettings() {
  const repository = useMemo(() => getSettingsRepository(), []);
  const getSettingsUseCase = useMemo(() => new GetSettingsUseCase(repository), [repository]);
  const updateExchangeRateUseCase = useMemo(() => new UpdateExchangeRateUseCase(repository), [repository]);

  const getSettings = (): Promise<SystemSetting[]> => getSettingsUseCase.execute();

  const updateExchangeRate = (rate: number): Promise<ExchangeRateResponse> =>
    updateExchangeRateUseCase.execute(rate);

  return { getSettings, updateExchangeRate };
}
