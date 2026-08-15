import { BudgetId } from '../shared/ids';
import { Budget } from './budget.entity';

export interface BudgetRepository {
  findById(id: BudgetId | string): Promise<Budget | null>;
  findAllActive(): Promise<Budget[]>;
  save(budget: Budget): Promise<void>;
  delete(id: BudgetId | string): Promise<void>;
}
