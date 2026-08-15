import { RuleId } from '../shared/ids';
import { Rule } from './rule.entity';

export interface RuleRepository {
  findById(id: RuleId | string): Promise<Rule | null>;
  findAll(): Promise<Rule[]>;
  findAllActive(): Promise<Rule[]>;
  save(rule: Rule): Promise<void>;
  delete(id: RuleId | string): Promise<void>;
}
