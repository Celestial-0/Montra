import { TransactionDirection } from '../transactions/transaction.entity';

export interface RawStatementRow {
  readonly date: string;
  readonly amount: number; // minor units
  readonly direction: TransactionDirection;
  readonly narration: string;
  readonly reference?: string;
}

export interface FileImportParser {
  parse(rawContent: string, fileType: 'csv' | 'json'): Promise<RawStatementRow[]>;
}
