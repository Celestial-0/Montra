import { InvariantViolationError } from '../shared/errors';
import { Category } from './category.entity';
import { Tag } from './tag.entity';

export function assertValidCategory(category: Category): void {
  if (!category.name || !category.name.trim()) {
    throw new InvariantViolationError('Category name cannot be empty.');
  }

  if (category.parentId && category.parentId === category.id) {
    throw new InvariantViolationError('Category cannot be its own parent.');
  }
}

export function assertValidTag(tag: Tag): void {
  if (!tag.name || !tag.name.trim()) {
    throw new InvariantViolationError('Tag name cannot be empty.');
  }
}
