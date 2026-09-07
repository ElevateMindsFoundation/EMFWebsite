/**
 * Parses a "YYYY-MM-DD" string as a local-time date instead of UTC midnight,
 * which avoids `new Date('2026-07-14')` displaying as July 13 in timezones
 * behind UTC.
 */
export function parseLocalDate(isoDate: string): Date {
  const [year, month, day] = isoDate.split('-').map(Number);
  return new Date(year, (month ?? 1) - 1, day ?? 1);
}

export function formatDate(
  isoDate: string,
  options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' },
): string {
  return parseLocalDate(isoDate).toLocaleDateString('en-US', options);
}
