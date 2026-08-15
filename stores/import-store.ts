import { create } from 'zustand';

export interface ImportState {
  selectedAccountId: string | null;
  step: 'select_file' | 'map_columns' | 'preview' | 'complete';
  rawFileContent: string | null;
  fileName: string | null;
  setSelectedAccountId: (id: string | null) => void;
  setStep: (step: 'select_file' | 'map_columns' | 'preview' | 'complete') => void;
  setRawFileContent: (content: string | null, name: string | null) => void;
  reset: () => void;
}

export const useImportStore = create<ImportState>((set) => ({
  selectedAccountId: null,
  step: 'select_file',
  rawFileContent: null,
  fileName: null,
  setSelectedAccountId: (id) => set({ selectedAccountId: id }),
  setStep: (step) => set({ step }),
  setRawFileContent: (content, name) => set({ rawFileContent: content, fileName: name }),
  reset: () => set({ selectedAccountId: null, step: 'select_file', rawFileContent: null, fileName: null }),
}));
