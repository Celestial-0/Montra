import { AccountId } from '../shared/ids';
import { Money } from '../shared/money';
import { CurrencyCode } from '../shared/currency';

export type AccountType = 'bank' | 'cash' | 'credit_card' | 'wallet' | 'investment' | 'other';

export interface FinancialAccountProps {
  readonly id: AccountId;
  readonly name: string;
  readonly type: AccountType;
  readonly currency: CurrencyCode;
  readonly initialBalance: Money;
  readonly currentBalance: Money;
  readonly institutionName?: string | null;
  readonly accountNumberMask?: string | null;
  readonly isActive?: boolean;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export class FinancialAccount {
  public readonly id: AccountId;
  public readonly name: string;
  public readonly type: AccountType;
  public readonly currency: CurrencyCode;
  public readonly initialBalance: Money;
  public readonly currentBalance: Money;
  public readonly institutionName: string | null;
  public readonly accountNumberMask: string | null;
  public readonly isActive: boolean;
  public readonly createdAt: string;
  public readonly updatedAt: string;

  constructor(props: FinancialAccountProps) {
    this.id = props.id;
    this.name = props.name;
    this.type = props.type;
    this.currency = props.currency;
    this.initialBalance = props.initialBalance;
    this.currentBalance = props.currentBalance;
    this.institutionName = props.institutionName ?? null;
    this.accountNumberMask = props.accountNumberMask ?? null;
    this.isActive = props.isActive ?? true;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }
}
