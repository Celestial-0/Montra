import { CategoryId } from '../shared/ids';

export interface CategoryProps {
  readonly id: CategoryId;
  readonly name: string;
  readonly parentId?: CategoryId | string | null;
  readonly icon?: string | null;
  readonly color?: string | null;
  readonly isSystem?: boolean;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export class Category {
  public readonly id: CategoryId;
  public readonly name: string;
  public readonly parentId: CategoryId | string | null;
  public readonly icon: string | null;
  public readonly color: string | null;
  public readonly isSystem: boolean;
  public readonly createdAt: string;
  public readonly updatedAt: string;

  constructor(props: CategoryProps) {
    this.id = props.id;
    this.name = props.name;
    this.parentId = props.parentId ?? null;
    this.icon = props.icon ?? null;
    this.color = props.color ?? null;
    this.isSystem = props.isSystem ?? false;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }
}
