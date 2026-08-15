import { BudgetId } from '../shared/ids';
import { Money } from '../shared/money';
import { BudgetPeriod } from './budget.period';
import { BudgetScope } from './budget.scope';

export interface BudgetProps {
  readonly id: BudgetId;
  readonly name: string;
  readonly targetAmount: Money;
  readonly scope: BudgetScope;
  readonly period: BudgetPeriod;
  readonly rolloverEnabled?: boolean;
  readonly rolloverAmount?: Money | null;
  readonly alertThresholdPercent?: number | null;
  readonly isActive?: boolean;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export class Budget {
  public readonly id: BudgetId;
  public readonly name: string;
  public readonly targetAmount: Money;
  public readonly scope: BudgetScope;
  public readonly period: BudgetPeriod;
  public readonly rolloverEnabled: boolean;
  public readonly rolloverAmount: Money | null;
  public readonly alertThresholdPercent: number | null;
  public readonly isActive: boolean;
  public readonly createdAt: string;
  public readonly updatedAt: string;

  constructor(props: BudgetProps) {
    this.id = props.id;
    this.name = props.name;
    this.targetAmount = props.targetAmount;
    this.scope = props.scope;
    this.period = props.period;
    this.rolloverEnabled = props.rolloverEnabled ?? false;
    this.rolloverAmount = props.rolloverAmount ?? null;
    this.alertThresholdPercent = props.alertThresholdPercent ?? 80;
    this.isActive = props.isActive ?? true;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }
}
