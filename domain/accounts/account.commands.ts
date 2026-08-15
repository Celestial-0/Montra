import { Clock } from '../shared/clock.port';
import { CurrencyCode } from '../shared/currency';
import { DomainError, NotFoundError } from '../shared/errors';
import { AccountId, generateId } from '../shared/ids';
import { Money } from '../shared/money';
import { Result } from '../shared/result';
import { AccountType, FinancialAccount } from './account.entity';
import { assertValidAccount } from './account.invariants';
import { AccountRepository } from './account.repository';

export interface CreateAccountInput {
  readonly name: string;
  readonly type: AccountType;
  readonly currency?: CurrencyCode;
  readonly initialBalanceMinor?: number;
  readonly institutionName?: string;
  readonly accountNumberMask?: string;
}

export class CreateAccountUseCase {
  constructor(
    private accountRepo: AccountRepository,
    private clock: Clock
  ) {}

  async execute(input: CreateAccountInput): Promise<Result<FinancialAccount, DomainError>> {
    try {
      const now = this.clock.nowISO();
      const currency: CurrencyCode = input.currency ?? 'INR';
      const balance = new Money({ amount: input.initialBalanceMinor ?? 0, currency });

      const account = new FinancialAccount({
        id: generateId<AccountId>(),
        name: input.name,
        type: input.type,
        currency,
        initialBalance: balance,
        currentBalance: balance,
        institutionName: input.institutionName,
        accountNumberMask: input.accountNumberMask,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      });

      assertValidAccount(account);
      await this.accountRepo.save(account);
      return Result.ok(account);
    } catch (error) {
      if (error instanceof DomainError) {
        return Result.err(error);
      }
      throw error;
    }
  }
}

export interface UpdateAccountInput {
  readonly id: AccountId | string;
  readonly name?: string;
  readonly institutionName?: string | null;
  readonly accountNumberMask?: string | null;
  readonly isActive?: boolean;
}

export class UpdateAccountUseCase {
  constructor(
    private accountRepo: AccountRepository,
    private clock: Clock
  ) {}

  async execute(input: UpdateAccountInput): Promise<Result<FinancialAccount, DomainError>> {
    try {
      const existing = await this.accountRepo.findById(input.id);
      if (!existing) {
        return Result.err(new NotFoundError('FinancialAccount', input.id));
      }

      const updated = new FinancialAccount({
        id: existing.id,
        name: input.name ?? existing.name,
        type: existing.type,
        currency: existing.currency,
        initialBalance: existing.initialBalance,
        currentBalance: existing.currentBalance,
        institutionName: input.institutionName !== undefined ? input.institutionName : existing.institutionName,
        accountNumberMask: input.accountNumberMask !== undefined ? input.accountNumberMask : existing.accountNumberMask,
        isActive: input.isActive !== undefined ? input.isActive : existing.isActive,
        createdAt: existing.createdAt,
        updatedAt: this.clock.nowISO(),
      });

      assertValidAccount(updated);
      await this.accountRepo.save(updated);
      return Result.ok(updated);
    } catch (error) {
      if (error instanceof DomainError) {
        return Result.err(error);
      }
      throw error;
    }
  }
}

export class DeleteAccountUseCase {
  constructor(
    private accountRepo: AccountRepository,
    private clock: Clock
  ) {}

  async execute(id: AccountId | string): Promise<Result<void, DomainError>> {
    try {
      const existing = await this.accountRepo.findById(id);
      if (!existing) {
        return Result.err(new NotFoundError('FinancialAccount', id));
      }

      await this.accountRepo.delete(id);
      return Result.ok(undefined);
    } catch (error) {
      if (error instanceof DomainError) {
        return Result.err(error);
      }
      throw error;
    }
  }
}
