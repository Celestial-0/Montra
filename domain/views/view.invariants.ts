import { InvariantViolationError } from '../shared/errors';
import { View } from './view.entity';

export function assertValidView(view: View): void {
  if (!view.name || !view.name.trim()) {
    throw new InvariantViolationError('View name cannot be empty.');
  }

  if (view.filters.minAmount !== undefined && view.filters.maxAmount !== undefined) {
    if (view.filters.minAmount > view.filters.maxAmount) {
      throw new InvariantViolationError('View minAmount cannot be greater than maxAmount.');
    }
  }

  if (view.filters.dateFrom && view.filters.dateTo) {
    if (view.filters.dateFrom > view.filters.dateTo) {
      throw new InvariantViolationError('View dateFrom cannot be after dateTo.');
    }
  }
}
