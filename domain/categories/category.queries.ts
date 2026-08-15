import { DomainError } from '../shared/errors';
import { Result } from '../shared/result';
import { Category } from './category.entity';
import { CategoryRepository } from './category.repository';
import { Tag } from './tag.entity';

export interface CategoryHierarchyItem {
  readonly category: Category;
  readonly children: readonly Category[];
}

export class GetCategoriesQuery {
  constructor(private categoryRepo: CategoryRepository) {}

  async execute(): Promise<Result<{ categories: Category[]; tags: Tag[] }, DomainError>> {
    try {
      const [categories, tags] = await Promise.all([
        this.categoryRepo.findAllCategories(),
        this.categoryRepo.findAllTags(),
      ]);

      return Result.ok({ categories, tags });
    } catch (error) {
      if (error instanceof DomainError) {
        return Result.err(error);
      }
      throw error;
    }
  }
}
