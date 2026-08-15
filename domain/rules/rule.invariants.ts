import { InvariantViolationError } from '../shared/errors';
import { Rule } from './rule.entity';

export function assertValidRule(rule: Rule): void {
  if (!rule.name || !rule.name.trim()) {
    throw new InvariantViolationError('Rule name cannot be empty.');
  }

  if (rule.conditions.length === 0) {
    throw new InvariantViolationError('Rule must have at least one condition.');
  }

  if (!rule.action.setCategoryId && !rule.action.addTagIds && !rule.action.setType) {
    throw new InvariantViolationError('Rule must specify at least one action.');
  }
}
