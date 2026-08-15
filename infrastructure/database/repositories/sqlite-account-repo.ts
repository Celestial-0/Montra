import { eq } from 'drizzle-orm';
import { AccountRepository, AccountType, FinancialAccount } from '@/domain/accounts';
import { AccountId, asAccountId, CurrencyCode, Money } from '@/domain/shared';
import { MontraDatabase } from '../client';
import * as schema from '../schema';

export class SQLiteAccountRepository implements AccountRepository {
  constructor(private db: MontraDatabase) {}

  async findById(id: AccountId | string): Promise<FinancialAccount | null> {
    const rows = await this.db
      .select()
      .from(schema.accounts)
      .where(eq(schema.accounts.id, String(id)))
      .limit(1);

    if (rows.length === 0) return null;
    return this.mapToEntity(rows[0]);
  }

  async findAll(): Promise<FinancialAccount[]> {
    const rows = await this.db.select().from(schema.accounts);
    return rows.map((r) => this.mapToEntity(r));
  }

  async save(account: FinancialAccount): Promise<void> {
    const row: schema.NewAccountRow = {
      id: String(account.id),
      name: account.name,
      type: account.type,
      currency: account.currency,
      initialBalanceMinor: account.initialBalance.amount,
      currentBalanceMinor: account.currentBalance.amount,
      institutionName: account.institutionName,
      accountNumberMask: account.accountNumberMask,
      isActive: account.isActive,
      createdAt: account.createdAt,
      updatedAt: account.updatedAt,
    };

    await this.db
      .insert(schema.accounts)
      .values(row)
      .onConflictDoUpdate({
        target: schema.accounts.id,
        set: {
          name: row.name,
          type: row.type,
          currency: row.currency,
          initialBalanceMinor: row.initialBalanceMinor,
          currentBalanceMinor: row.currentBalanceMinor,
          institutionName: row.institutionName,
          accountNumberMask: row.accountNumberMask,
          isActive: row.isActive,
          updatedAt: row.updatedAt,
        },
      });
  }

  async updateBalance(id: AccountId | string, newBalanceMinor: number): Promise<void> {
    await this.db
      .update(schema.accounts)
      .set({
        currentBalanceMinor: newBalanceMinor,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(schema.accounts.id, String(id)));
  }

  async delete(id: AccountId | string): Promise<void> {
    await this.db.delete(schema.accounts).where(eq(schema.accounts.id, String(id)));
  }

  private mapToEntity(row: schema.AccountRow): FinancialAccount {
    const currency = (row.currency as CurrencyCode) ?? 'INR';
    return new FinancialAccount({
      id: asAccountId(row.id),
      name: row.name,
      type: row.type as AccountType,
      currency,
      initialBalance: new Money({ amount: row.initialBalanceMinor, currency }),
      currentBalance: new Money({ amount: row.currentBalanceMinor, currency }),
      institutionName: row.institutionName,
      accountNumberMask: row.accountNumberMask,
      isActive: row.isActive,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }
}
