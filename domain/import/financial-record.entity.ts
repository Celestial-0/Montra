import { RecordId, TransactionId } from '../shared/ids';

export interface FinancialRecordProps {
  readonly id: RecordId;
  readonly sourceId: string;
  readonly sourceType: string;
  readonly rawPayload: string; // JSON string of raw source data
  readonly parsedAt: string;
  readonly isProcessed: boolean;
  readonly canonicalTransactionId?: TransactionId | string | null;
  readonly error?: string | null;
  readonly createdAt: string;
}

export class FinancialRecord {
  public readonly id: RecordId;
  public readonly sourceId: string;
  public readonly sourceType: string;
  public readonly rawPayload: string;
  public readonly parsedAt: string;
  public readonly isProcessed: boolean;
  public readonly canonicalTransactionId: TransactionId | string | null;
  public readonly error: string | null;
  public readonly createdAt: string;

  constructor(props: FinancialRecordProps) {
    this.id = props.id;
    this.sourceId = props.sourceId;
    this.sourceType = props.sourceType;
    this.rawPayload = props.rawPayload;
    this.parsedAt = props.parsedAt;
    this.isProcessed = props.isProcessed;
    this.canonicalTransactionId = props.canonicalTransactionId ?? null;
    this.error = props.error ?? null;
    this.createdAt = props.createdAt;
  }
}
