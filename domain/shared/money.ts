import {
  allocate,
  dinero,
  isNegative as dineroIsNegative,
  isPositive as dineroIsPositive,
  isZero as dineroIsZero,
  add as dineroAdd,
  subtract as dineroSubtract,
  toDecimal,
  Dinero,
} from 'dinero.js';
import { EUR, GBP, INR, USD } from '@dinero.js/currencies';
import { CurrencyCode } from './currency';

const CURRENCY_MAP = {
  INR,
  USD,
  EUR,
  GBP,
};

export interface MoneyProps {
  amount: number; // Integer minor units (e.g. 10050 = ₹100.50)
  currency?: CurrencyCode; // ISO 4217 code (default: 'INR')
}

export class Money {
  public readonly amount: number;
  public readonly currency: CurrencyCode;
  private readonly d: Dinero<number>;

  constructor({ amount, currency = 'INR' }: MoneyProps) {
    if (!Number.isInteger(amount)) {
      throw new Error(`Money amount must be an integer (minor units), got: ${amount}`);
    }
    this.amount = amount;
    this.currency = currency;
    const curr = CURRENCY_MAP[currency] ?? INR;
    this.d = dinero({ amount, currency: curr });
  }

  static fromMajor(majorAmount: number, currency: CurrencyCode = 'INR'): Money {
    const minorAmount = Math.round(majorAmount * 100);
    return new Money({ amount: minorAmount, currency });
  }

  static zero(currency: CurrencyCode = 'INR'): Money {
    return new Money({ amount: 0, currency });
  }

  toMajor(): number {
    return parseFloat(toDecimal(this.d));
  }

  toDinero(): Dinero<number> {
    return this.d;
  }

  format(locale = 'en-IN'): string {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: this.currency,
    }).format(this.toMajor());
  }

  add(other: Money): Money {
    this.assertSameCurrency(other);
    const result = dineroAdd(this.d, other.d);
    return new Money({ amount: result.toJSON().amount, currency: this.currency });
  }

  subtract(other: Money): Money {
    this.assertSameCurrency(other);
    const result = dineroSubtract(this.d, other.d);
    return new Money({ amount: result.toJSON().amount, currency: this.currency });
  }

  allocate(ratios: number[]): Money[] {
    const allocations = allocate(this.d, ratios);
    return allocations.map((item) => new Money({ amount: item.toJSON().amount, currency: this.currency }));
  }

  isPositive(): boolean {
    return dineroIsPositive(this.d);
  }

  isZero(): boolean {
    return dineroIsZero(this.d);
  }

  isNegative(): boolean {
    return dineroIsNegative(this.d);
  }

  private assertSameCurrency(other: Money): void {
    if (this.currency !== other.currency) {
      throw new Error(`Currency mismatch: cannot operate between ${this.currency} and ${other.currency}`);
    }
  }
}
