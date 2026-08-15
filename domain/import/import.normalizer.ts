import { TransactionDirection } from '../transactions/transaction.entity';
import { RawStatementRow } from './import.parser';

export interface NormalizedFinancialRecord {
  readonly date: string;
  readonly amountMinor: number;
  readonly direction: TransactionDirection;
  readonly description: string;
  readonly externalReference?: string;
}

export function normalizeRawRow(row: RawStatementRow): NormalizedFinancialRecord {
  return {
    date: row.date,
    amountMinor: row.amount,
    direction: row.direction,
    description: row.narration.trim(),
    externalReference: row.reference,
  };
}
