import { ViewId } from '../shared/ids';
import { View } from './view.entity';

export interface ViewRepository {
  findById(id: ViewId | string): Promise<View | null>;
  findAll(): Promise<View[]>;
  save(view: View): Promise<void>;
  delete(id: ViewId | string): Promise<void>;
}
