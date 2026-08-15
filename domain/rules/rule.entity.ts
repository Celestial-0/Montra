import { AccountId, CategoryId, RuleId, TagId } from '../shared/ids';
import { TransactionType } from '../transactions/transaction.entity';

export type RuleConditionField = 'description' | 'amount' | 'rawNarration' | 'accountId';
export type RuleConditionOperator = 'contains' | 'equals' | 'startsWith' | 'greaterThan' | 'lessThan';

export interface RuleCondition {
  readonly field: RuleConditionField;
  readonly operator: RuleConditionOperator;
  readonly value: string | number;
}

export interface RuleAction {
  readonly setCategoryId?: CategoryId | string;
  readonly addTagIds?: readonly (TagId | string)[];
  readonly setType?: TransactionType;
}

export interface RuleProps {
  readonly id: RuleId;
  readonly name: string;
  readonly conditions: readonly RuleCondition[];
  readonly action: RuleAction;
  readonly priority: number;
  readonly isActive?: boolean;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export class Rule {
  public readonly id: RuleId;
  public readonly name: string;
  public readonly conditions: readonly RuleCondition[];
  public readonly action: RuleAction;
  public readonly priority: number;
  public readonly isActive: boolean;
  public readonly createdAt: string;
  public readonly updatedAt: string;

  constructor(props: RuleProps) {
    this.id = props.id;
    this.name = props.name;
    this.conditions = props.conditions;
    this.action = props.action;
    this.priority = props.priority;
    this.isActive = props.isActive ?? true;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }
}
