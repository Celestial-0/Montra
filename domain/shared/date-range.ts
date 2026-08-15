export class DateRange {
  constructor(
    public readonly startDate: Date,
    public readonly endDate: Date
  ) {
    if (startDate > endDate) {
      throw new Error('startDate cannot be after endDate');
    }
  }

  contains(date: Date): boolean {
    return date >= this.startDate && date <= this.endDate;
  }

  toISOStringRange(): { start: string; end: string } {
    return {
      start: this.startDate.toISOString(),
      end: this.endDate.toISOString(),
    };
  }
}
