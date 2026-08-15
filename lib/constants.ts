export const APP_CONFIG = {
  appName: 'Montra',
  defaultCurrency: 'INR',
  defaultLocale: 'en-IN',
  databaseName: 'montra.db',
  storageKeys: {
    theme: 'montra_theme_preference',
    activeWorkspace: 'montra_active_workspace',
  },
} as const;

export const DEFAULT_CATEGORIES = [
  { id: 'cat-food', name: 'Food & Dining', icon: 'Utensils', color: '#f97316' },
  { id: 'cat-groceries', name: 'Groceries', icon: 'ShoppingCart', color: '#10b981' },
  { id: 'cat-transport', name: 'Transportation', icon: 'Car', color: '#3b82f6' },
  { id: 'cat-bills', name: 'Bills & Utilities', icon: 'Receipt', color: '#8b5cf6' },
  { id: 'cat-shopping', name: 'Shopping', icon: 'ShoppingBag', color: '#ec4899' },
  { id: 'cat-entertainment', name: 'Entertainment', icon: 'Film', color: '#eab308' },
  { id: 'cat-healthcare', name: 'Healthcare', icon: 'HeartPulse', color: '#ef4444' },
  { id: 'cat-education', name: 'Education', icon: 'GraduationCap', color: '#06b6d4' },
  { id: 'cat-income', name: 'Salary & Income', icon: 'Wallet', color: '#22c55e' },
  { id: 'cat-transfer', name: 'Transfers', icon: 'ArrowLeftRight', color: '#6366f1' },
  { id: 'cat-other', name: 'Other', icon: 'MoreHorizontal', color: '#6b7280' },
] as const;

export const QUERY_KEYS = {
  transactions: 'transactions',
  accounts: 'accounts',
  budgets: 'budgets',
  categories: 'categories',
  tags: 'tags',
  views: 'views',
  rules: 'rules',
  analytics: 'analytics',
} as const;
