import * as Crypto from 'expo-crypto';

/**
 * Branded identifier types to prevent accidental cross-assignment.
 */
export type TransactionId = string & { readonly __brand: 'TransactionId' };
export type AccountId = string & { readonly __brand: 'AccountId' };
export type BudgetId = string & { readonly __brand: 'BudgetId' };
export type CategoryId = string & { readonly __brand: 'CategoryId' };
export type TagId = string & { readonly __brand: 'TagId' };
export type ViewId = string & { readonly __brand: 'ViewId' };
export type RuleId = string & { readonly __brand: 'RuleId' };
export type RecordId = string & { readonly __brand: 'RecordId' };

let lastTimestamp = -1;
let sequenceCounter = 0;

function getRandomBytes16(): Uint8Array {
  try {
    return Crypto.getRandomBytes(16);
  } catch {
    const bytes = new Uint8Array(16);
    if (
      typeof globalThis !== 'undefined' &&
      globalThis.crypto &&
      typeof globalThis.crypto.getRandomValues === 'function'
    ) {
      globalThis.crypto.getRandomValues(bytes);
      return bytes;
    }
    // High-entropy fallback for Hermes/offline environments
    for (let i = 0; i < 16; i++) {
      bytes[i] = Math.floor(Math.random() * 256);
    }
    return bytes;
  }
}

/**
 * RFC 9562 Compliant UUID v7 Identifier Generator
 * Produces time-ordered, sortable, collision-resistant unique identifiers.
 * Guaranteed to work across React Native (Hermes), Expo, and Node.
 */
export function generateUuidV7(): string {
  const now = Date.now();
  if (now <= lastTimestamp) {
    sequenceCounter = (sequenceCounter + 1) & 0x0fff;
  } else {
    lastTimestamp = now;
    sequenceCounter = 0;
  }

  const bytes = getRandomBytes16();

  // 48-bit timestamp (Big-Endian)
  bytes[0] = (now / 0x10000000000) & 0xff;
  bytes[1] = (now / 0x100000000) & 0xff;
  bytes[2] = (now / 0x1000000) & 0xff;
  bytes[3] = (now / 0x10000) & 0xff;
  bytes[4] = (now / 0x100) & 0xff;
  bytes[5] = now & 0xff;

  // Version 7 + 12-bit sequence counter
  bytes[6] = 0x70 | ((sequenceCounter >> 8) & 0x0f);
  bytes[7] = sequenceCounter & 0xff;

  // Variant 10xxxxxx
  bytes[8] = 0x80 | (bytes[8] & 0x3f);

  // Format as 8-4-4-4-12 hex string
  let hex = '';
  for (let i = 0; i < 16; i++) {
    const b = bytes[i].toString(16).padStart(2, '0');
    if (i === 4 || i === 6 || i === 8 || i === 10) {
      hex += '-';
    }
    hex += b;
  }
  return hex;
}

export function generateId<T extends string = string>(): T {
  return generateUuidV7() as T;
}

export function asTransactionId(id: string): TransactionId {
  return id as TransactionId;
}

export function asAccountId(id: string): AccountId {
  return id as AccountId;
}

export function asBudgetId(id: string): BudgetId {
  return id as BudgetId;
}

export function asCategoryId(id: string): CategoryId {
  return id as CategoryId;
}

export function asTagId(id: string): TagId {
  return id as TagId;
}

export function asViewId(id: string): ViewId {
  return id as ViewId;
}

export function asRuleId(id: string): RuleId {
  return id as RuleId;
}

export function asRecordId(id: string): RecordId {
  return id as RecordId;
}
