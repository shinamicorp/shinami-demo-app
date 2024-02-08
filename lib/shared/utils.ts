/**
 * Copyright 2024 Shinami Corp.
 * SPDX-License-Identifier: Apache-2.0
 */

export function first<T>(value?: T | T[]): T | undefined {
  if (value === undefined) return undefined;
  if (!Array.isArray(value)) value = [value];
  return value[0];
}

export function throwExpression(error: any): never {
  throw error;
}
