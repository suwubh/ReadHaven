export function shelfNameToSlug(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, '-');
}

export function shelfNameToLegacySlug(name: string): string {
  return name.toLowerCase().replace(/ /g, '-');
}
