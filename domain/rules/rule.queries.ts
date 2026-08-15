import { DomainError } from '../shared/errors';
import { Result } from '../shared/result';
import { Rule } from './rule.entity';
import { RuleRepository } from './rule.repository';

export class GetRulesQuery {
  constructor(private ruleRepo: RuleRepository) {}

  async execute(activeOnly = false): Promise<Result<Rule[], DomainError>> {
    try {
      const rules = activeOnly ? await this.ruleRepo.findAllActive() : await this.ruleRepo.findAll();
      return Result.ok(rules);
    } catch (error) {
      if (error instanceof DomainError) {
        return Result.err(error);
      }
      throw error;
    }
  }
}
