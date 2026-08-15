import { DomainError } from '../shared/errors';
import { Result } from '../shared/result';
import { FinancialAccount } from './account.entity';
import { AccountRepository } from './account.repository';

export interface AccountSummary {
  readonly account: FinancialAccount;
  readonly totalDebitMinor: number;
  readonly totalCreditMinor: number;
}

export class GetAccountSummariesQuery {
  constructor(private accountRepo: AccountRepository) {}

  async execute(): Promise<Result<FinancialAccount[], DomainError>> {
    try {
      const accounts = await this.accountRepo.findAll();
      return Result.ok(accounts);
    } catch (error) {
      if (error instanceof DomainError) {
        return Result.err(error);
      }
      throw error;
    }
  }
}
