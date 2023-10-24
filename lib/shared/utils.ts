export function first<T>(value?: T | T[]): T | undefined {
  if (value === undefined) return undefined;
  if (!Array.isArray(value)) value = [value];
  return value[0];
}

export function throwExpression(error: any): never {
  throw error;
}
