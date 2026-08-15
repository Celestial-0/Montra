export class DomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DomainError';
  }
}

export class ValidationError extends DomainError {
  constructor(public readonly field: string, message: string) {
    super(`Validation failed for ${field}: ${message}`);
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends DomainError {
  constructor(public readonly entityName: string, public readonly id: string) {
    super(`${entityName} with id "${id}" was not found.`);
    this.name = 'NotFoundError';
  }
}

export class InvariantViolationError extends DomainError {
  constructor(message: string) {
    super(`Domain invariant violated: ${message}`);
    this.name = 'InvariantViolationError';
  }
}
