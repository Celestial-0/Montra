-- Montra SQLite Schema Migration
-- Version 1: Initial Local Schema

PRAGMA foreign_keys = ON;

-- Accounts
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

-- Categories
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

-- Tags
CREATE TABLE IF NOT EXISTS tags (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  color TEXT,
  created_at TEXT NOT NULL
);

-- Transactions
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

-- Transaction Tags
CREATE TABLE IF NOT EXISTS transaction_tags (
  transaction_id TEXT NOT NULL,
  tag_id TEXT NOT NULL,
  PRIMARY KEY (transaction_id, tag_id),
  FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE CASCADE,
  FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);

-- Budgets
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

-- Saved Views
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

-- Auto-classification Rules
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

-- Raw Ingested Financial Records
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

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_transactions_account ON transactions(account_id);
CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions(category_id);
CREATE INDEX IF NOT EXISTS idx_transactions_occurred_at ON transactions(occurred_at);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_budgets_active ON budgets(is_active);
CREATE INDEX IF NOT EXISTS idx_rules_active_priority ON rules(is_active, priority DESC);
