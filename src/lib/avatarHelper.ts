/**
 * Helper to compute initials from first name, last name, or full name.
 * Rules:
 * - Trim whitespace.
 * - First character of first name + First character of last name.
 * - Convert to uppercase.
 * - Ignore empty/null names.
 * - Safe handling of multiple spaces.
 * - Returns "" if unavailable.
 */
export function getInitials(options?: {
  name?: string | null;
  firstName?: string | null;
  lastName?: string | null;
}): string {
  if (!options) return '';
  let fName = (options.firstName || '').trim();
  let lName = (options.lastName || '').trim();

  if (!fName && !lName && options.name && options.name.trim()) {
    const tokens = options.name.trim().split(/\s+/).filter(Boolean);
    if (tokens.length > 0) {
      fName = tokens[0];
      if (tokens.length > 1) {
        lName = tokens[tokens.length - 1];
      }
    }
  }

  const fInitial = fName ? fName[0].toUpperCase() : '';
  const lInitial = lName ? lName[0].toUpperCase() : '';

  return `${fInitial}${lInitial}`;
}

export function isValidAvatarUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  const trimmed = url.trim();
  if (!trimmed || trimmed === '/favicon.svg' || trimmed === 'null' || trimmed === 'undefined') {
    return false;
  }
  return true;
}
