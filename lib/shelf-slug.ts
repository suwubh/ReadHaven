function normalizeName(name: unknown): string {
  return typeof name === 'string' ? name : String(name ?? '');
}

export function shelfNameToSlug(name: unknown): string {
  const normalizedName = normalizeName(name);
  return normalizedName.trim().toLowerCase().replace(/\s+/g, '-');
}

export function shelfNameToLegacySlug(name: unknown): string {
  const normalizedName = normalizeName(name);
  return normalizedName.toLowerCase().replace(/ /g, '-');
}
