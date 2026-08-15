import { Clock } from '../shared/clock.port';
import { DomainError, NotFoundError } from '../shared/errors';
import { CategoryId, generateId, TagId } from '../shared/ids';
import { Result } from '../shared/result';
import { Category } from './category.entity';
import { assertValidCategory, assertValidTag } from './category.invariants';
import { CategoryRepository } from './category.repository';
import { Tag } from './tag.entity';

export interface CreateCategoryInput {
  readonly name: string;
  readonly parentId?: CategoryId | string | null;
  readonly icon?: string | null;
  readonly color?: string | null;
}

export class CreateCategoryUseCase {
  constructor(
    private categoryRepo: CategoryRepository,
    private clock: Clock
  ) {}

  async execute(input: CreateCategoryInput): Promise<Result<Category, DomainError>> {
    try {
      const now = this.clock.nowISO();
      const category = new Category({
        id: generateId<CategoryId>(),
        name: input.name,
        parentId: input.parentId,
        icon: input.icon,
        color: input.color,
        isSystem: false,
        createdAt: now,
        updatedAt: now,
      });

      assertValidCategory(category);
      await this.categoryRepo.saveCategory(category);
      return Result.ok(category);
    } catch (error) {
      if (error instanceof DomainError) {
        return Result.err(error);
      }
      throw error;
    }
  }
}

export interface UpdateCategoryInput {
  readonly id: CategoryId | string;
  readonly name?: string;
  readonly parentId?: CategoryId | string | null;
  readonly icon?: string | null;
  readonly color?: string | null;
}

export class UpdateCategoryUseCase {
  constructor(
    private categoryRepo: CategoryRepository,
    private clock: Clock
  ) {}

  async execute(input: UpdateCategoryInput): Promise<Result<Category, DomainError>> {
    try {
      const existing = await this.categoryRepo.findCategoryById(input.id);
      if (!existing) {
        return Result.err(new NotFoundError('Category', input.id));
      }

      const updated = new Category({
        id: existing.id,
        name: input.name ?? existing.name,
        parentId: input.parentId !== undefined ? input.parentId : existing.parentId,
        icon: input.icon !== undefined ? input.icon : existing.icon,
        color: input.color !== undefined ? input.color : existing.color,
        isSystem: existing.isSystem,
        createdAt: existing.createdAt,
        updatedAt: this.clock.nowISO(),
      });

      assertValidCategory(updated);
      await this.categoryRepo.saveCategory(updated);
      return Result.ok(updated);
    } catch (error) {
      if (error instanceof DomainError) {
        return Result.err(error);
      }
      throw error;
    }
  }
}

export class DeleteCategoryUseCase {
  constructor(private categoryRepo: CategoryRepository) {}

  async execute(id: CategoryId | string): Promise<Result<void, DomainError>> {
    try {
      const existing = await this.categoryRepo.findCategoryById(id);
      if (!existing) {
        return Result.err(new NotFoundError('Category', id));
      }

      await this.categoryRepo.deleteCategory(id);
      return Result.ok(undefined);
    } catch (error) {
      if (error instanceof DomainError) {
        return Result.err(error);
      }
      throw error;
    }
  }
}

export interface CreateTagInput {
  readonly name: string;
  readonly color?: string | null;
}

export class CreateTagUseCase {
  constructor(
    private categoryRepo: CategoryRepository,
    private clock: Clock
  ) {}

  async execute(input: CreateTagInput): Promise<Result<Tag, DomainError>> {
    try {
      const now = this.clock.nowISO();
      const tag = new Tag({
        id: generateId<TagId>(),
        name: input.name,
        color: input.color,
        createdAt: now,
      });

      assertValidTag(tag);
      await this.categoryRepo.saveTag(tag);
      return Result.ok(tag);
    } catch (error) {
      if (error instanceof DomainError) {
        return Result.err(error);
      }
      throw error;
    }
  }
}

export interface UpdateTagInput {
  readonly id: TagId | string;
  readonly name?: string;
  readonly color?: string | null;
}

export class UpdateTagUseCase {
  constructor(private categoryRepo: CategoryRepository) {}

  async execute(input: UpdateTagInput): Promise<Result<Tag, DomainError>> {
    try {
      const existing = await this.categoryRepo.findTagById(input.id);
      if (!existing) {
        return Result.err(new NotFoundError('Tag', input.id));
      }

      const updated = new Tag({
        id: existing.id,
        name: input.name ?? existing.name,
        color: input.color !== undefined ? input.color : existing.color,
        createdAt: existing.createdAt,
      });

      assertValidTag(updated);
      await this.categoryRepo.saveTag(updated);
      return Result.ok(updated);
    } catch (error) {
      if (error instanceof DomainError) {
        return Result.err(error);
      }
      throw error;
    }
  }
}

export class DeleteTagUseCase {
  constructor(private categoryRepo: CategoryRepository) {}

  async execute(id: TagId | string): Promise<Result<void, DomainError>> {
    try {
      const existing = await this.categoryRepo.findTagById(id);
      if (!existing) {
        return Result.err(new NotFoundError('Tag', id));
      }

      await this.categoryRepo.deleteTag(id);
      return Result.ok(undefined);
    } catch (error) {
      if (error instanceof DomainError) {
        return Result.err(error);
      }
      throw error;
    }
  }
}
