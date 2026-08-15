import { Clock } from './clock.port';

export class SystemClock implements Clock {
  now(): Date {
    return new Date();
  }

  nowISO(): string {
    return new Date().toISOString();
  }
}
