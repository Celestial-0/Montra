import { AccountRepository } from '@/domain/accounts';
import { BudgetRepository } from '@/domain/budgets';
import { CategoryRepository } from '@/domain/categories';
import { FileImportParser } from '@/domain/import';
import { RuleRepository } from '@/domain/rules';
import { Clock, SecureStorage, SpendingQueryPort, SystemClock } from '@/domain/shared';
import { TransactionRepository, TransactionSpendingQueryAdapter } from '@/domain/transactions';
import { ViewRepository } from '@/domain/views';
import { MontraDatabase } from '@/infrastructure/database/client';
import { SQLiteAccountRepository } from '@/infrastructure/database/repositories/sqlite-account-repo';
import { SQLiteBudgetRepository } from '@/infrastructure/database/repositories/sqlite-budget-repo';
import { SQLiteCategoryRepository } from '@/infrastructure/database/repositories/sqlite-category-repo';
import { SQLiteRuleRepository } from '@/infrastructure/database/repositories/sqlite-rule-repo';
import { SQLiteTransactionRepository } from '@/infrastructure/database/repositories/sqlite-transaction-repo';
import { SQLiteViewRepository } from '@/infrastructure/database/repositories/sqlite-view-repo';
import { CSVStatementParser } from '@/infrastructure/import/csv-statement-parser';
import { SecureStoreAdapter } from '@/infrastructure/storage/secure-store-adapter';

export interface Repositories {
  readonly accountRepo: AccountRepository;
  readonly categoryRepo: CategoryRepository;
  readonly budgetRepo: BudgetRepository;
  readonly transactionRepo: TransactionRepository;
  readonly viewRepo: ViewRepository;
  readonly ruleRepo: RuleRepository;
  readonly spendingQuery: SpendingQueryPort;
  readonly importParser: FileImportParser;
  readonly secureStorage: SecureStorage;
  readonly clock: Clock;
}

export function createRepositories(db: MontraDatabase): Repositories {
  const clock = new SystemClock();
  const accountRepo = new SQLiteAccountRepository(db);
  const categoryRepo = new SQLiteCategoryRepository(db);
  const budgetRepo = new SQLiteBudgetRepository(db);
  const transactionRepo = new SQLiteTransactionRepository(db);
  const viewRepo = new SQLiteViewRepository(db);
  const ruleRepo = new SQLiteRuleRepository(db);
  const spendingQuery = new TransactionSpendingQueryAdapter(transactionRepo);
  const importParser = new CSVStatementParser();
  const secureStorage = new SecureStoreAdapter();

  return {
    accountRepo,
    categoryRepo,
    budgetRepo,
    transactionRepo,
    viewRepo,
    ruleRepo,
    spendingQuery,
    importParser,
    secureStorage,
    clock,
  };
}
