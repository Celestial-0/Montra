import { CategoryId, TagId } from '../shared/ids';
import { Category } from './category.entity';
import { Tag } from './tag.entity';

export interface CategoryRepository {
  findCategoryById(id: CategoryId | string): Promise<Category | null>;
  findAllCategories(): Promise<Category[]>;
  saveCategory(category: Category): Promise<void>;
  deleteCategory(id: CategoryId | string): Promise<void>;

  findTagById(id: TagId | string): Promise<Tag | null>;
  findAllTags(): Promise<Tag[]>;
  saveTag(tag: Tag): Promise<void>;
  deleteTag(id: TagId | string): Promise<void>;
}
