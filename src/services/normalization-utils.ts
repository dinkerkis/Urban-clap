export function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

export function cleanString(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  return value.trim() || undefined;
}

export function finiteNumber(value: unknown): number | undefined;
export function finiteNumber(value: unknown, fallback: number): number;
export function finiteNumber(value: unknown, fallback?: number): number | undefined {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

export function cleanStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.flatMap((item) => cleanString(item) ?? []) : [];
}
