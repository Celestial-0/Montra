import { CurrencyCode } from '@/domain/shared';
import { Money } from '@/domain/shared/money';
import { format, isToday, isYesterday, parseISO } from 'date-fns';

export function formatMoney(amountMinor: number, currency: CurrencyCode = 'INR'): string {
  try {
    const money = new Money({ amount: Math.round(amountMinor), currency });
    return money.format('en-IN');
  } catch {
    const major = (amountMinor / 100).toFixed(2);
    return `₹${major}`;
  }
}

export function formatTransactionDate(isoDate: string): string {
  try {
    const date = parseISO(isoDate);
    if (isToday(date)) {
      return `Today, ${format(date, 'h:mm a')}`;
    }
    if (isYesterday(date)) {
      return `Yesterday, ${format(date, 'h:mm a')}`;
    }
    return format(date, 'd MMM yyyy, h:mm a');
  } catch {
    return isoDate;
  }
}

export function formatDateShort(isoDate: string): string {
  try {
    const date = parseISO(isoDate);
    if (isToday(date)) return 'Today';
    if (isYesterday(date)) return 'Yesterday';
    return format(date, 'd MMM');
  } catch {
    return isoDate;
  }
}

export function formatPercentage(value: number): string {
  return `${Math.round(value)}%`;
}
