export type CurrencyCode = 'INR' | 'USD' | 'EUR' | 'GBP';

export interface CurrencyInfo {
  code: CurrencyCode;
  symbol: string;
  minorUnitFactor: number;
  name: string;
}

export const SUPPORTED_CURRENCIES: Record<CurrencyCode, CurrencyInfo> = {
  INR: { code: 'INR', symbol: '₹', minorUnitFactor: 100, name: 'Indian Rupee' },
  USD: { code: 'USD', symbol: '$', minorUnitFactor: 100, name: 'US Dollar' },
  EUR: { code: 'EUR', symbol: '€', minorUnitFactor: 100, name: 'Euro' },
  GBP: { code: 'GBP', symbol: '£', minorUnitFactor: 100, name: 'British Pound' },
};
