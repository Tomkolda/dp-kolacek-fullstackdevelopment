export function asObject(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object') return null;
  return value as Record<string, unknown>;
}

export function asStringOrNull(value: unknown): string | null {
  return typeof value === 'string' ? value : null;
}

export function asNumberOrNull(value: unknown): number | null {
  return typeof value === 'number' ? value : null;
}
