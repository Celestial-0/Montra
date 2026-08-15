import { Clock } from '../shared/clock.port';
import { DomainError, NotFoundError } from '../shared/errors';
import { generateId, RuleId } from '../shared/ids';
import { Result } from '../shared/result';
import { Transaction } from '../transactions/transaction.entity';
import { TransactionRepository } from '../transactions/transaction.repository';
import { Rule, RuleAction, RuleCondition } from './rule.entity';
import { assertValidRule } from './rule.invariants';
import { RuleRepository } from './rule.repository';

export interface SaveRuleInput {
  readonly id?: RuleId | string;
  readonly name: string;
  readonly conditions: readonly RuleCondition[];
  readonly action: RuleAction;
  readonly priority?: number;
  readonly isActive?: boolean;
}

export class SaveRuleUseCase {
  constructor(
    private ruleRepo: RuleRepository,
    private clock: Clock
  ) {}

  async execute(input: SaveRuleInput): Promise<Result<Rule, DomainError>> {
    try {
      const now = this.clock.nowISO();
      let createdAt = now;

      if (input.id) {
        const existing = await this.ruleRepo.findById(input.id);
        if (existing) {
          createdAt = existing.createdAt;
        }
      }

      const rule = new Rule({
        id: (input.id as RuleId) ?? generateId<RuleId>(),
        name: input.name,
        conditions: input.conditions,
        action: input.action,
        priority: input.priority ?? 0,
        isActive: input.isActive ?? true,
        createdAt,
        updatedAt: now,
      });

      assertValidRule(rule);
      await this.ruleRepo.save(rule);
      return Result.ok(rule);
    } catch (error) {
      if (error instanceof DomainError) {
        return Result.err(error);
      }
      throw error;
    }
  }
}

export class DeleteRuleUseCase {
  constructor(private ruleRepo: RuleRepository) {}

  async execute(id: RuleId | string): Promise<Result<void, DomainError>> {
    try {
      const existing = await this.ruleRepo.findById(id);
      if (!existing) {
        return Result.err(new NotFoundError('Rule', id));
      }
      await this.ruleRepo.delete(id);
      return Result.ok(undefined);
    } catch (error) {
      if (error instanceof DomainError) {
        return Result.err(error);
      }
      throw error;
    }
  }
}

export class ApplyRulesUseCase {
  constructor(
    private ruleRepo: RuleRepository,
    private transactionRepo: TransactionRepository,
    private clock: Clock
  ) {}

  async execute(transactions: readonly Transaction[]): Promise<Result<Transaction[], DomainError>> {
    try {
      const rules = await this.ruleRepo.findAllActive();
      if (rules.length === 0) return Result.ok([...transactions]);

      const modified: Transaction[] = [];
      const now = this.clock.nowISO();

      for (const tx of transactions) {
        let currentTx = tx;
        let wasModified = false;

        for (const rule of rules) {
          const matches = rule.conditions.every((c) => {
            let actualValue: string | number | undefined;
            if (c.field === 'description') actualValue = currentTx.description ?? '';
            else if (c.field === 'rawNarration') actualValue = currentTx.sourceReference?.rawNarration ?? '';
            else if (c.field === 'accountId') actualValue = String(currentTx.accountId);
            else if (c.field === 'amount') actualValue = currentTx.amount.amount;

            if (actualValue === undefined) return false;

            if (c.operator === 'equals') {
              return String(actualValue).toLowerCase() === String(c.value).toLowerCase();
            }
            if (c.operator === 'contains') {
              return String(actualValue).toLowerCase().includes(String(c.value).toLowerCase());
            }
            if (c.operator === 'startsWith') {
              return String(actualValue).toLowerCase().startsWith(String(c.value).toLowerCase());
            }
            if (c.operator === 'greaterThan') {
              return Number(actualValue) > Number(c.value);
            }
            if (c.operator === 'lessThan') {
              return Number(actualValue) < Number(c.value);
            }
            return false;
          });

          if (matches) {
            wasModified = true;
            currentTx = new Transaction({
              id: currentTx.id,
              accountId: currentTx.accountId,
              amount: currentTx.amount,
              direction: currentTx.direction,
              type: rule.action.setType ?? currentTx.type,
              occurredAt: currentTx.occurredAt,
              description: currentTx.description,
              categoryId: rule.action.setCategoryId ?? currentTx.categoryId,
              tagIds: rule.action.addTagIds ? [...currentTx.tagIds, ...rule.action.addTagIds] : currentTx.tagIds,
              notes: currentTx.notes,
              sourceReference: currentTx.sourceReference,
              transferTargetAccountId: currentTx.transferTargetAccountId,
              linkedTransactionId: currentTx.linkedTransactionId,
              createdAt: currentTx.createdAt,
              updatedAt: now,
            });
          }
        }
        modified.push(currentTx);
      }

      await this.transactionRepo.saveBatch(modified);
      return Result.ok(modified);
    } catch (error) {
      if (error instanceof DomainError) {
        return Result.err(error);
      }
      throw error;
    }
  }
}
