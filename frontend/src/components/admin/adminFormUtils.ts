// Shared helpers for converting between the plain string/boolean form state
// AdminCrudPage keeps (see AdminFormValues) and the richer payload shapes the
// backend zod schemas expect (string[] tag arrays, nullable URLs, ISO
// datetime strings). Kept separate from AdminCrudPage.tsx so each admin page
// can import just what it needs for its toPayload/getInitialValues pair.

/** "a, b, c" -> ["a", "b", "c"], dropping blanks and surrounding whitespace. */
export function splitTags(value: string | boolean | undefined): string[] {
  if (typeof value !== 'string' || value.trim() === '') return [];
  return value
    .split(',')
    .map((part) => part.trim())
    .filter((part) => part.length > 0);
}

/** ["a", "b"] -> "a, b" — the inverse of splitTags, for prefilling a form. */
export function joinTags(values: string[] | undefined): string {
  return (values ?? []).join(', ');
}

/** "" -> null, otherwise the trimmed string — for optional URL/text fields the backend stores as nullable. */
export function emptyToNull(value: string | boolean | undefined): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed === '' ? null : trimmed;
}

/**
 * <input type="date"> gives "YYYY-MM-DD"; the backend's zod schemas require a
 * full ISO datetime string (z.string().datetime()). Parsing a date-only
 * string always lands on UTC midnight, which keeps the value stable
 * regardless of the admin's timezone (same approach as the volunteer hour
 * log form in pages/Volunteer.tsx).
 */
export function dateInputToIsoOrNull(value: string | boolean | undefined): string | null {
  if (typeof value !== 'string' || value.trim() === '') return null;
  return new Date(value).toISOString();
}

/** Inverse of dateInputToIsoOrNull, for prefilling an <input type="date">. */
export function isoToDateInput(value: string | null | undefined): string {
  return value ? value.slice(0, 10) : '';
}
