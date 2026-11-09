import { translation } from "./text";

let cached: string[] | null = null;

export function systemLanguages(): string[] {
  if (cached) return cached;
  try {
    cached = translation?.userLanguages() ?? [];
  } catch {
    cached = [];
  }
  if (!cached.length) {
    const resolved = Intl.DateTimeFormat().resolvedOptions().locale;
    if (resolved) cached = [resolved];
  }
  return cached;
}
