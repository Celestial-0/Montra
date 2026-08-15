import { AccountId } from '../shared/ids';
import { FinancialAccount } from './account.entity';

export interface AccountRepository {
  findById(id: AccountId | string): Promise<FinancialAccount | null>;
  findAll(): Promise<FinancialAccount[]>;
  save(account: FinancialAccount): Promise<void>;
  updateBalance(id: AccountId | string, newBalanceMinor: number): Promise<void>;
  delete(id: AccountId | string): Promise<void>;
}
