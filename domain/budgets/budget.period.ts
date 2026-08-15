import { endOfMonth, endOfWeek, endOfYear, startOfMonth, startOfWeek, startOfYear } from 'date-fns';

export type PeriodCadence = 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'custom';

export interface BudgetPeriodProps {
  readonly cadence: PeriodCadence;
  readonly startDate: string; // ISO 8601
  readonly endDate?: string | null; // ISO 8601
  readonly timezone?: string;
}

export class BudgetPeriod {
  public readonly cadence: PeriodCadence;
  public readonly startDate: string;
  public readonly endDate: string | null;
  public readonly timezone: string;

  constructor({ cadence, startDate, endDate = null, timezone = 'Asia/Kolkata' }: BudgetPeriodProps) {
    this.cadence = cadence;
    this.startDate = startDate;
    this.endDate = endDate;
    this.timezone = timezone;
  }

  currentRange(referenceDate: Date = new Date()): { startDate: string; endDate: string } {
    if (this.cadence === 'custom') {
      return {
        startDate: this.startDate,
        endDate: this.endDate ?? new Date().toISOString(),
      };
    }

    if (this.cadence === 'weekly') {
      return {
        startDate: startOfWeek(referenceDate, { weekStartsOn: 1 }).toISOString(),
        endDate: endOfWeek(referenceDate, { weekStartsOn: 1 }).toISOString(),
      };
    }

    if (this.cadence === 'yearly') {
      return {
        startDate: startOfYear(referenceDate).toISOString(),
        endDate: endOfYear(referenceDate).toISOString(),
      };
    }

    // Default monthly
    return {
      startDate: startOfMonth(referenceDate).toISOString(),
      endDate: endOfMonth(referenceDate).toISOString(),
    };
  }

  contains(dateISO: string, referenceDate: Date = new Date()): boolean {
    const range = this.currentRange(referenceDate);
    return dateISO >= range.startDate && dateISO <= range.endDate;
  }
}
