// ==============================
// Domain Entity — System Settings & Exchange Rate
// إعدادات النظام وسعر صرف العملات الرسمية
// ==============================

export interface SystemSetting {
  key: string;
  value: string;
  description?: string;
  updated_at?: string;
}

export interface ExchangeRateResponse {
  message: string;
  key: string;
  new_rate: number;
  unit: string;
}
