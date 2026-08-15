import { drizzle, ExpoSQLiteDatabase } from 'drizzle-orm/expo-sqlite';
import * as SQLite from 'expo-sqlite';
import { DEFAULT_CATEGORIES } from '@/lib/constants';
import * as schema from './schema';

export type MontraDatabase = ExpoSQLiteDatabase<typeof schema>;

let dbInstance: MontraDatabase | null = null;
let sqliteInstance: SQLite.SQLiteDatabase | null = null;

const SCHEMA_SQL = `
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS accounts (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  currency TEXT NOT NULL DEFAULT 'INR',
  initial_balance_minor INTEGER NOT NULL DEFAULT 0,
  current_balance_minor INTEGER NOT NULL DEFAULT 0,
  institution_name TEXT,
  account_number_mask TEXT,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  parent_id TEXT,
  icon TEXT,
  color TEXT,
  is_system INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS tags (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  color TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS transactions (
  id TEXT PRIMARY KEY NOT NULL,
  account_id TEXT NOT NULL,
  amount_minor INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'INR',
  direction TEXT NOT NULL,
  type TEXT NOT NULL,
  occurred_at TEXT NOT NULL,
  description TEXT,
  category_id TEXT,
  notes TEXT,
  transfer_target_account_id TEXT,
  linked_transaction_id TEXT,
  source_type TEXT,
  source_external_id TEXT,
  source_raw_narration TEXT,
  source_imported_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS transaction_tags (
  transaction_id TEXT NOT NULL,
  tag_id TEXT NOT NULL,
  PRIMARY KEY (transaction_id, tag_id),
  FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE CASCADE,
  FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS budgets (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  target_amount_minor INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'INR',
  scope_type TEXT NOT NULL,
  scope_target_ids_json TEXT NOT NULL DEFAULT '[]',
  period_cadence TEXT NOT NULL,
  period_start_date TEXT NOT NULL,
  period_end_date TEXT,
  period_timezone TEXT DEFAULT 'Asia/Kolkata',
  rollover_enabled INTEGER NOT NULL DEFAULT 0,
  rollover_amount_minor INTEGER,
  alert_threshold_percent INTEGER DEFAULT 80,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS views (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  icon TEXT,
  filters_json TEXT NOT NULL DEFAULT '{}',
  sort_field TEXT NOT NULL DEFAULT 'occurredAt',
  sort_direction TEXT NOT NULL DEFAULT 'desc',
  group_by TEXT,
  visualization_type TEXT DEFAULT 'cards',
  is_pinned INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS rules (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  conditions_json TEXT NOT NULL DEFAULT '[]',
  action_json TEXT NOT NULL DEFAULT '{}',
  priority INTEGER NOT NULL DEFAULT 0,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS financial_records (
  id TEXT PRIMARY KEY NOT NULL,
  source_id TEXT NOT NULL,
  source_type TEXT NOT NULL,
  raw_payload TEXT NOT NULL,
  parsed_at TEXT NOT NULL,
  is_processed INTEGER NOT NULL DEFAULT 0,
  canonical_transaction_id TEXT,
  error TEXT,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_transactions_account ON transactions(account_id);
CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions(category_id);
CREATE INDEX IF NOT EXISTS idx_transactions_occurred_at ON transactions(occurred_at);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_budgets_active ON budgets(is_active);
CREATE INDEX IF NOT EXISTS idx_rules_active_priority ON rules(is_active, priority DESC);
`;

export async function initDatabase(dbName = 'montra.db'): Promise<MontraDatabase> {
  if (dbInstance) {
    return dbInstance;
  }

  sqliteInstance = SQLite.openDatabaseSync(dbName);
  sqliteInstance.execSync(SCHEMA_SQL);

  dbInstance = drizzle(sqliteInstance, { schema });

  // Check if categories need seeding
  await seedDefaultCategories(dbInstance);

  return dbInstance;
}

export function getDatabase(): MontraDatabase {
  if (!dbInstance) {
    throw new Error('Database not initialized. Call initDatabase() before using repositories.');
  }
  return dbInstance;
}

export async function seedDefaultCategories(db: MontraDatabase): Promise<void> {
  const existing = await db.select().from(schema.categories).limit(1);
  if (existing.length === 0) {
    const now = new Date().toISOString();
    const rows = DEFAULT_CATEGORIES.map((cat) => ({
      id: cat.id,
      name: cat.name,
      icon: cat.icon,
      color: cat.color,
      isSystem: true,
      createdAt: now,
      updatedAt: now,
    }));

    for (const row of rows) {
      await db.insert(schema.categories).values(row).onConflictDoNothing();
    }
  }
}
