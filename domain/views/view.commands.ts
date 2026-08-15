import { Clock } from '../shared/clock.port';
import { DomainError, NotFoundError } from '../shared/errors';
import { generateId, ViewId } from '../shared/ids';
import { Result } from '../shared/result';
import { View, ViewFilter, ViewGroupByField, ViewSort } from './view.entity';
import { assertValidView } from './view.invariants';
import { ViewRepository } from './view.repository';

export interface CreateViewInput {
  readonly name: string;
  readonly icon?: string;
  readonly filters: ViewFilter;
  readonly sort: ViewSort;
  readonly groupBy?: ViewGroupByField;
  readonly visualizationType?: 'table' | 'cards' | 'chart';
  readonly isPinned?: boolean;
}

export class CreateViewUseCase {
  constructor(
    private viewRepo: ViewRepository,
    private clock: Clock
  ) {}

  async execute(input: CreateViewInput): Promise<Result<View, DomainError>> {
    try {
      const now = this.clock.nowISO();
      const view = new View({
        id: generateId<ViewId>(),
        name: input.name,
        icon: input.icon,
        filters: input.filters,
        sort: input.sort,
        groupBy: input.groupBy,
        visualizationType: input.visualizationType,
        isPinned: input.isPinned,
        createdAt: now,
        updatedAt: now,
      });

      assertValidView(view);
      await this.viewRepo.save(view);
      return Result.ok(view);
    } catch (error) {
      if (error instanceof DomainError) {
        return Result.err(error);
      }
      throw error;
    }
  }
}

export interface UpdateViewInput {
  readonly id: ViewId | string;
  readonly name?: string;
  readonly icon?: string | null;
  readonly filters?: ViewFilter;
  readonly sort?: ViewSort;
  readonly groupBy?: ViewGroupByField;
  readonly visualizationType?: 'table' | 'cards' | 'chart';
  readonly isPinned?: boolean;
}

export class UpdateViewUseCase {
  constructor(
    private viewRepo: ViewRepository,
    private clock: Clock
  ) {}

  async execute(input: UpdateViewInput): Promise<Result<View, DomainError>> {
    try {
      const existing = await this.viewRepo.findById(input.id);
      if (!existing) {
        return Result.err(new NotFoundError('View', input.id));
      }

      const updated = new View({
        id: existing.id,
        name: input.name ?? existing.name,
        icon: input.icon !== undefined ? input.icon : existing.icon,
        filters: input.filters !== undefined ? input.filters : existing.filters,
        sort: input.sort !== undefined ? input.sort : existing.sort,
        groupBy: input.groupBy !== undefined ? input.groupBy : existing.groupBy,
        visualizationType: input.visualizationType !== undefined ? input.visualizationType : existing.visualizationType,
        isPinned: input.isPinned !== undefined ? input.isPinned : existing.isPinned,
        createdAt: existing.createdAt,
        updatedAt: this.clock.nowISO(),
      });

      assertValidView(updated);
      await this.viewRepo.save(updated);
      return Result.ok(updated);
    } catch (error) {
      if (error instanceof DomainError) {
        return Result.err(error);
      }
      throw error;
    }
  }
}

export class DeleteViewUseCase {
  constructor(private viewRepo: ViewRepository) {}

  async execute(id: ViewId | string): Promise<Result<void, DomainError>> {
    try {
      const existing = await this.viewRepo.findById(id);
      if (!existing) {
        return Result.err(new NotFoundError('View', id));
      }

      await this.viewRepo.delete(id);
      return Result.ok(undefined);
    } catch (error) {
      if (error instanceof DomainError) {
        return Result.err(error);
      }
      throw error;
    }
  }
}
