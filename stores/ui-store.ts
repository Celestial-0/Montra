import { create } from 'zustand';
import { TransactionType } from '@/domain/transactions/transaction.entity';

// ─── Transaction Filter State ─────────────────────────────────────────────────

export interface TransactionFilterState {
  /** Account IDs to filter by — empty means all accounts */
  accountIds: string[];
  /** Category IDs to filter by — empty means all categories */
  categoryIds: string[];
  /** Tag IDs to filter by — empty means all tags */
  tagIds: string[];
  /** Transaction types to include — empty means all types */
  types: TransactionType[];
  /** ISO date string for range start */
  startDate: string | null;
  /** ISO date string for range end */
  endDate: string | null;
  /** Minimum amount in minor units */
  minAmountMinor: number | null;
  /** Maximum amount in minor units */
  maxAmountMinor: number | null;
  /** Active search text */
  searchText: string;
}

export interface TransactionSortState {
  field: 'occurredAt' | 'amount' | 'description';
  direction: 'asc' | 'desc';
}

// ─── Modal / Sheet State ──────────────────────────────────────────────────────

export interface ModalState {
  /** Transaction add/edit form sheet */
  isAddTransactionOpen: boolean;
  /** Transfer creation sheet */
  isAddTransferOpen: boolean;
  /** Account add/edit form sheet */
  isAddAccountOpen: boolean;
  /** Budget add/edit form sheet */
  isAddBudgetOpen: boolean;
  /** Category add/edit form sheet */
  isAddCategoryOpen: boolean;
  /** Filter panel sheet (transactions screen) */
  isFilterPanelOpen: boolean;
  /** Currently editing entity IDs (null = creating new) */
  editingTransactionId: string | null;
  editingAccountId: string | null;
  editingBudgetId: string | null;
  editingCategoryId: string | null;
}

// ─── Selection State ─────────────────────────────────────────────────────────

export interface SelectionState {
  /** Multi-select for bulk operations */
  selectedTransactionIds: ReadonlySet<string>;
  /** Whether multi-select mode is active */
  isSelectMode: boolean;
}

// ─── Full UI Store State ──────────────────────────────────────────────────────

export interface UIState {
  // Filters
  filters: TransactionFilterState;
  sort: TransactionSortState;

  // Modal / sheet open states
  modals: ModalState;

  // Multi-selection
  selection: SelectionState;

  // ── Filter actions
  setFilter: <K extends keyof TransactionFilterState>(
    key: K,
    value: TransactionFilterState[K]
  ) => void;
  resetFilters: () => void;
  setSort: (field: TransactionSortState['field'], direction: TransactionSortState['direction']) => void;
  hasActiveFilters: () => boolean;

  // ── Modal actions
  openAddTransaction: (editId?: string) => void;
  closeAddTransaction: () => void;
  openAddTransfer: () => void;
  closeAddTransfer: () => void;
  openAddAccount: (editId?: string) => void;
  closeAddAccount: () => void;
  openAddBudget: (editId?: string) => void;
  closeAddBudget: () => void;
  openAddCategory: (editId?: string) => void;
  closeAddCategory: () => void;
  openFilterPanel: () => void;
  closeFilterPanel: () => void;

  // ── Selection actions
  toggleTransactionSelection: (id: string) => void;
  selectAllTransactions: (ids: string[]) => void;
  clearSelection: () => void;
  enterSelectMode: () => void;
  exitSelectMode: () => void;
}

// ─── Default values ───────────────────────────────────────────────────────────

const defaultFilters: TransactionFilterState = {
  accountIds: [],
  categoryIds: [],
  tagIds: [],
  types: [],
  startDate: null,
  endDate: null,
  minAmountMinor: null,
  maxAmountMinor: null,
  searchText: '',
};

const defaultSort: TransactionSortState = {
  field: 'occurredAt',
  direction: 'desc',
};

const defaultModals: ModalState = {
  isAddTransactionOpen: false,
  isAddTransferOpen: false,
  isAddAccountOpen: false,
  isAddBudgetOpen: false,
  isAddCategoryOpen: false,
  isFilterPanelOpen: false,
  editingTransactionId: null,
  editingAccountId: null,
  editingBudgetId: null,
  editingCategoryId: null,
};

const defaultSelection: SelectionState = {
  selectedTransactionIds: new Set<string>(),
  isSelectMode: false,
};

// ─── Store ────────────────────────────────────────────────────────────────────

export const useUIStore = create<UIState>((set, get) => ({
  filters: defaultFilters,
  sort: defaultSort,
  modals: defaultModals,
  selection: defaultSelection,

  // ── Filter actions
  setFilter: (key, value) =>
    set((state) => ({
      filters: { ...state.filters, [key]: value },
    })),

  resetFilters: () => set({ filters: defaultFilters }),

  setSort: (field, direction) => set({ sort: { field, direction } }),

  hasActiveFilters: () => {
    const { filters } = get();
    return (
      filters.accountIds.length > 0 ||
      filters.categoryIds.length > 0 ||
      filters.tagIds.length > 0 ||
      filters.types.length > 0 ||
      filters.startDate !== null ||
      filters.endDate !== null ||
      filters.minAmountMinor !== null ||
      filters.maxAmountMinor !== null ||
      filters.searchText.trim().length > 0
    );
  },

  // ── Modal actions
  openAddTransaction: (editId) =>
    set({
      modals: {
        ...get().modals,
        isAddTransactionOpen: true,
        editingTransactionId: editId ?? null,
      },
    }),

  closeAddTransaction: () =>
    set({
      modals: {
        ...get().modals,
        isAddTransactionOpen: false,
        editingTransactionId: null,
      },
    }),

  openAddTransfer: () =>
    set({ modals: { ...get().modals, isAddTransferOpen: true } }),

  closeAddTransfer: () =>
    set({ modals: { ...get().modals, isAddTransferOpen: false } }),

  openAddAccount: (editId) =>
    set({
      modals: {
        ...get().modals,
        isAddAccountOpen: true,
        editingAccountId: editId ?? null,
      },
    }),

  closeAddAccount: () =>
    set({
      modals: {
        ...get().modals,
        isAddAccountOpen: false,
        editingAccountId: null,
      },
    }),

  openAddBudget: (editId) =>
    set({
      modals: {
        ...get().modals,
        isAddBudgetOpen: true,
        editingBudgetId: editId ?? null,
      },
    }),

  closeAddBudget: () =>
    set({
      modals: {
        ...get().modals,
        isAddBudgetOpen: false,
        editingBudgetId: null,
      },
    }),

  openAddCategory: (editId) =>
    set({
      modals: {
        ...get().modals,
        isAddCategoryOpen: true,
        editingCategoryId: editId ?? null,
      },
    }),

  closeAddCategory: () =>
    set({
      modals: {
        ...get().modals,
        isAddCategoryOpen: false,
        editingCategoryId: null,
      },
    }),

  openFilterPanel: () =>
    set({ modals: { ...get().modals, isFilterPanelOpen: true } }),

  closeFilterPanel: () =>
    set({ modals: { ...get().modals, isFilterPanelOpen: false } }),

  // ── Selection actions
  toggleTransactionSelection: (id) =>
    set((state) => {
      const next = new Set(state.selection.selectedTransactionIds);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return {
        selection: {
          ...state.selection,
          selectedTransactionIds: next,
          isSelectMode: next.size > 0,
        },
      };
    }),

  selectAllTransactions: (ids) =>
    set({
      selection: {
        selectedTransactionIds: new Set(ids),
        isSelectMode: ids.length > 0,
      },
    }),

  clearSelection: () =>
    set({ selection: defaultSelection }),

  enterSelectMode: () =>
    set((state) => ({
      selection: { ...state.selection, isSelectMode: true },
    })),

  exitSelectMode: () =>
    set({ selection: defaultSelection }),
}));
