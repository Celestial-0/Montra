import { TagId } from '../shared/ids';

export interface TagProps {
  readonly id: TagId;
  readonly name: string;
  readonly color?: string | null;
  readonly createdAt: string;
}

export class Tag {
  public readonly id: TagId;
  public readonly name: string;
  public readonly color: string | null;
  public readonly createdAt: string;

  constructor(props: TagProps) {
    this.id = props.id;
    this.name = props.name;
    this.color = props.color ?? null;
    this.createdAt = props.createdAt;
  }
}
