import { Clock } from '../shared/clock.port';
import { CurrencyCode } from '../shared/currency';
import { DomainError, NotFoundError } from '../shared/errors';
import { AccountId, CategoryId, generateId, TagId, TransactionId } from '../shared/ids';
import { Money } from '../shared/money';
import { Result } from '../shared/result';
import { Transaction, TransactionDirection, TransactionType } from './transaction.entity';
import { assertValidTransaction } from './transaction.invariants';
import { TransactionRepository } from './transaction.repository';

export interface CreateTransactionInput {
  readonly accountId: AccountId | string;
  readonly amountMinor: number;
  readonly direction: TransactionDirection;
  readonly type: TransactionType;
  readonly occurredAt?: string;
  readonly description?: string;
  readonly categoryId?: CategoryId | string;
  readonly tagIds?: readonly (TagId | string)[];
  readonly notes?: string;
  readonly currency?: CurrencyCode;
}

export class CreateTransactionUseCase {
  constructor(
    private transactionRepo: TransactionRepository,
    private clock: Clock
  ) {}

  async execute(input: CreateTransactionInput): Promise<Result<Transaction, DomainError>> {
    try {
      const now = this.clock.nowISO();
      const currency: CurrencyCode = input.currency ?? 'INR';
      const transaction = new Transaction({
        id: generateId<TransactionId>(),
        accountId: input.accountId,
        amount: new Money({ amount: input.amountMinor, currency }),
        direction: input.direction,
        type: input.type,
        occurredAt: input.occurredAt ?? now,
        description: input.description,
        categoryId: input.categoryId,
        tagIds: input.tagIds,
        notes: input.notes,
        createdAt: now,
        updatedAt: now,
      });

      assertValidTransaction(transaction);
      await this.transactionRepo.save(transaction);
      return Result.ok(transaction);
    } catch (error) {
      if (error instanceof DomainError) {
        return Result.err(error);
      }
      throw error;
    }
  }
}

export interface UpdateTransactionInput {
  readonly id: TransactionId | string;
  readonly description?: string | null;
  readonly categoryId?: CategoryId | string | null;
  readonly tagIds?: readonly (TagId | string)[];
  readonly notes?: string | null;
}

export class UpdateTransactionUseCase {
  constructor(
    private transactionRepo: TransactionRepository,
    private clock: Clock
  ) {}

  async execute(input: UpdateTransactionInput): Promise<Result<Transaction, DomainError>> {
    try {
      const existing = await this.transactionRepo.findById(input.id);
      if (!existing) {
        return Result.err(new NotFoundError('Transaction', input.id));
      }

      const updated = new Transaction({
        id: existing.id,
        accountId: existing.accountId,
        amount: existing.amount,
        direction: existing.direction,
        type: existing.type,
        occurredAt: existing.occurredAt,
        description: input.description !== undefined ? input.description : existing.description,
        categoryId: input.categoryId !== undefined ? input.categoryId : existing.categoryId,
        tagIds: input.tagIds !== undefined ? input.tagIds : existing.tagIds,
        notes: input.notes !== undefined ? input.notes : existing.notes,
        sourceReference: existing.sourceReference,
        transferTargetAccountId: existing.transferTargetAccountId,
        linkedTransactionId: existing.linkedTransactionId,
        createdAt: existing.createdAt,
        updatedAt: this.clock.nowISO(),
      });

      assertValidTransaction(updated);
      await this.transactionRepo.save(updated);
      return Result.ok(updated);
    } catch (error) {
      if (error instanceof DomainError) {
        return Result.err(error);
      }
      throw error;
    }
  }
}

export class DeleteTransactionUseCase {
  constructor(private transactionRepo: TransactionRepository) {}

  async execute(id: TransactionId | string): Promise<Result<void, DomainError>> {
    try {
      const existing = await this.transactionRepo.findById(id);
      if (!existing) {
        return Result.err(new NotFoundError('Transaction', id));
      }

      await this.transactionRepo.delete(id);
      if (existing.linkedTransactionId) {
        await this.transactionRepo.delete(existing.linkedTransactionId);
      }
      return Result.ok(undefined);
    } catch (error) {
      if (error instanceof DomainError) {
        return Result.err(error);
      }
      throw error;
    }
  }
}

export interface CreateTransferInput {
  readonly sourceAccountId: AccountId | string;
  readonly targetAccountId: AccountId | string;
  readonly amountMinor: number;
  readonly occurredAt?: string;
  readonly description?: string;
  readonly notes?: string;
  readonly currency?: CurrencyCode;
}

export interface TransferResult {
  readonly sourceTransaction: Transaction;
  readonly targetTransaction: Transaction;
}

export class CreateTransferUseCase {
  constructor(
    private transactionRepo: TransactionRepository,
    private clock: Clock
  ) {}

  async execute(input: CreateTransferInput): Promise<Result<TransferResult, DomainError>> {
    try {
      const now = this.clock.nowISO();
      const currency: CurrencyCode = input.currency ?? 'INR';
      const occurredAt = input.occurredAt ?? now;
      const description = input.description ?? 'Transfer';

      const sourceId = generateId<TransactionId>();
      const targetId = generateId<TransactionId>();

      const sourceTx = new Transaction({
        id: sourceId,
        accountId: input.sourceAccountId,
        transferTargetAccountId: input.targetAccountId,
        linkedTransactionId: targetId,
        amount: new Money({ amount: input.amountMinor, currency }),
        direction: 'debit',
        type: 'transfer',
        occurredAt,
        description: `Transfer: ${description}`,
        notes: input.notes,
        createdAt: now,
        updatedAt: now,
      });

      const targetTx = new Transaction({
        id: targetId,
        accountId: input.targetAccountId,
        transferTargetAccountId: input.sourceAccountId,
        linkedTransactionId: sourceId,
        amount: new Money({ amount: input.amountMinor, currency }),
        direction: 'credit',
        type: 'transfer',
        occurredAt,
        description: `Transfer: ${description}`,
        notes: input.notes,
        createdAt: now,
        updatedAt: now,
      });

      assertValidTransaction(sourceTx);
      assertValidTransaction(targetTx);

      await this.transactionRepo.saveBatch([sourceTx, targetTx]);
      return Result.ok({ sourceTransaction: sourceTx, targetTransaction: targetTx });
    } catch (error) {
      if (error instanceof DomainError) {
        return Result.err(error);
      }
      throw error;
    }
  }
}
