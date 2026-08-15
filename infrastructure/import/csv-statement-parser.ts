import { FileImportParser, RawStatementRow } from '@/domain/import';

export class CSVStatementParser implements FileImportParser {
  async parse(rawContent: string, fileType: 'csv' | 'json'): Promise<RawStatementRow[]> {
    if (fileType === 'json') {
      return JSON.parse(rawContent);
    }

    const lines = rawContent.split('\n').filter((l) => l.trim().length > 0);
    if (lines.length <= 1) return [];

    const rows: RawStatementRow[] = [];
    for (let i = 1; i < lines.length; i++) {
      const parts = lines[i].split(',').map((p) => p.trim());
      if (parts.length >= 4) {
        const [date, narration, debitOrCredit, amountStr] = parts;
        const amountNum = parseFloat(amountStr);
        if (!isNaN(amountNum)) {
          rows.push({
            date: new Date(date).toISOString(),
            narration,
            direction: debitOrCredit.toLowerCase().includes('cr') ? 'credit' : 'debit',
            amount: Math.round(Math.abs(amountNum) * 100),
          });
        }
      }
    }
    return rows;
  }
}
