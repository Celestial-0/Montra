import {
  CreateAccountUseCase,
  DeleteAccountUseCase,
  GetAccountSummariesQuery,
  UpdateAccountUseCase,
} from '@/domain/accounts';
import {
  CreateBudgetUseCase,
  DeleteBudgetUseCase,
  GetBudgetProgressQuery,
  UpdateBudgetUseCase,
} from '@/domain/budgets';
import {
  CreateCategoryUseCase,
  CreateTagUseCase,
  DeleteCategoryUseCase,
  DeleteTagUseCase,
  GetCategoriesQuery,
  UpdateCategoryUseCase,
  UpdateTagUseCase,
} from '@/domain/categories';
import { ImportRecordsUseCase } from '@/domain/import';
import {
  ApplyRulesUseCase,
  DeleteRuleUseCase,
  GetRulesQuery,
  SaveRuleUseCase,
} from '@/domain/rules';
import {
  CreateTransactionUseCase,
  CreateTransferUseCase,
  DeleteTransactionUseCase,
  GetSpendingBreakdownQuery,
  GetTransactionByIdQuery,
  GetTransactionsQuery,
  UpdateTransactionUseCase,
} from '@/domain/transactions';
import {
  CreateViewUseCase,
  DeleteViewUseCase,
  GetViewResultsQuery,
  GetViewsQuery,
  UpdateViewUseCase,
} from '@/domain/views';
import { Repositories } from './repositories';

export interface UseCases {
  // Accounts
  readonly createAccount: CreateAccountUseCase;
  readonly updateAccount: UpdateAccountUseCase;
  readonly deleteAccount: DeleteAccountUseCase;
  readonly getAccountSummaries: GetAccountSummariesQuery;

  // Categories & Tags
  readonly createCategory: CreateCategoryUseCase;
  readonly updateCategory: UpdateCategoryUseCase;
  readonly deleteCategory: DeleteCategoryUseCase;
  readonly createTag: CreateTagUseCase;
  readonly updateTag: UpdateTagUseCase;
  readonly deleteTag: DeleteTagUseCase;
  readonly getCategories: GetCategoriesQuery;

  // Budgets
  readonly createBudget: CreateBudgetUseCase;
  readonly updateBudget: UpdateBudgetUseCase;
  readonly deleteBudget: DeleteBudgetUseCase;
  readonly getBudgetProgress: GetBudgetProgressQuery;

  // Transactions
  readonly createTransaction: CreateTransactionUseCase;
  readonly updateTransaction: UpdateTransactionUseCase;
  readonly deleteTransaction: DeleteTransactionUseCase;
  readonly createTransfer: CreateTransferUseCase;
  readonly getTransactions: GetTransactionsQuery;
  readonly getTransactionById: GetTransactionByIdQuery;
  readonly getSpendingBreakdown: GetSpendingBreakdownQuery;

  // Views
  readonly createView: CreateViewUseCase;
  readonly updateView: UpdateViewUseCase;
  readonly deleteView: DeleteViewUseCase;
  readonly getViewResults: GetViewResultsQuery;
  readonly getViews: GetViewsQuery;

  // Rules
  readonly saveRule: SaveRuleUseCase;
  readonly deleteRule: DeleteRuleUseCase;
  readonly applyRules: ApplyRulesUseCase;
  readonly getRules: GetRulesQuery;

  // Import
  readonly importRecords: ImportRecordsUseCase;
}

export function createUseCases(repos: Repositories): UseCases {
  return {
    // Accounts
    createAccount: new CreateAccountUseCase(repos.accountRepo, repos.clock),
    updateAccount: new UpdateAccountUseCase(repos.accountRepo, repos.clock),
    deleteAccount: new DeleteAccountUseCase(repos.accountRepo, repos.clock),
    getAccountSummaries: new GetAccountSummariesQuery(repos.accountRepo),

    // Categories & Tags
    createCategory: new CreateCategoryUseCase(repos.categoryRepo, repos.clock),
    updateCategory: new UpdateCategoryUseCase(repos.categoryRepo, repos.clock),
    deleteCategory: new DeleteCategoryUseCase(repos.categoryRepo),
    createTag: new CreateTagUseCase(repos.categoryRepo, repos.clock),
    updateTag: new UpdateTagUseCase(repos.categoryRepo),
    deleteTag: new DeleteTagUseCase(repos.categoryRepo),
    getCategories: new GetCategoriesQuery(repos.categoryRepo),

    // Budgets
    createBudget: new CreateBudgetUseCase(repos.budgetRepo, repos.clock),
    updateBudget: new UpdateBudgetUseCase(repos.budgetRepo, repos.clock),
    deleteBudget: new DeleteBudgetUseCase(repos.budgetRepo),
    getBudgetProgress: new GetBudgetProgressQuery(repos.budgetRepo, repos.spendingQuery, repos.clock),

    // Transactions
    createTransaction: new CreateTransactionUseCase(repos.transactionRepo, repos.clock),
    updateTransaction: new UpdateTransactionUseCase(repos.transactionRepo, repos.clock),
    deleteTransaction: new DeleteTransactionUseCase(repos.transactionRepo),
    createTransfer: new CreateTransferUseCase(repos.transactionRepo, repos.clock),
    getTransactions: new GetTransactionsQuery(repos.transactionRepo),
    getTransactionById: new GetTransactionByIdQuery(repos.transactionRepo),
    getSpendingBreakdown: new GetSpendingBreakdownQuery(repos.transactionRepo),

    // Views
    createView: new CreateViewUseCase(repos.viewRepo, repos.clock),
    updateView: new UpdateViewUseCase(repos.viewRepo, repos.clock),
    deleteView: new DeleteViewUseCase(repos.viewRepo),
    getViewResults: new GetViewResultsQuery(repos.viewRepo, repos.transactionRepo),
    getViews: new GetViewsQuery(repos.viewRepo),

    // Rules
    saveRule: new SaveRuleUseCase(repos.ruleRepo, repos.clock),
    deleteRule: new DeleteRuleUseCase(repos.ruleRepo),
    applyRules: new ApplyRulesUseCase(repos.ruleRepo, repos.transactionRepo, repos.clock),
    getRules: new GetRulesQuery(repos.ruleRepo),

    // Import
    importRecords: new ImportRecordsUseCase(repos.importParser, repos.transactionRepo, repos.clock),
  };
}
