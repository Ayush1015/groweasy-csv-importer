import { create } from 'zustand';

export type Step = 1 | 2 | 3 | 4;

interface ImportState {
  step: Step;
  setStep: (step: Step) => void;
  file: File | null;
  setFile: (file: File | null) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  rawRecords: Record<string, any>[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setRawRecords: (records: Record<string, any>[]) => void;
  isProcessing: boolean;
  setIsProcessing: (isProcessing: boolean) => void;
  error: string | null;
  setError: (error: string | null) => void;
  results: {
    totalProcessed: number;
    totalImported: number;
    totalSkipped: number;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    records: any[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    skippedRecords: any[];
  } | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setResults: (results: any) => void;
  reset: () => void;
}

export const useImportStore = create<ImportState>((set) => ({
  step: 1,
  setStep: (step) => set({ step }),
  file: null,
  setFile: (file) => set({ file }),
  rawRecords: [],
  setRawRecords: (rawRecords) => set({ rawRecords }),
  isProcessing: false,
  setIsProcessing: (isProcessing) => set({ isProcessing }),
  error: null,
  setError: (error) => set({ error }),
  results: null,
  setResults: (results) => set({ results }),
  reset: () => set({
    step: 1,
    file: null,
    rawRecords: [],
    isProcessing: false,
    error: null,
    results: null,
  }),
}));
