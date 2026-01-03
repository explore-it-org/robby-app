/**
 * Date Formatting Utilities
 *
 * Centralized date formatting functions for consistent display across the app.
 */

/**
 * Formats a date for program display (last modified, created date, etc.)
 * Uses the user's locale settings for appropriate formatting.
 *
 * @param date - The date to format
 * @returns Formatted date string in MM/DD/YYYY format (locale-dependent)
 *
 * @example
 * formatProgramDate(new Date('2025-01-15'))
 * // Returns: "01/15/2025" (en-US) or "15.01.2025" (de-DE)
 */
export function formatProgramDate(date: Date): string {
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

/**
 * Formats a date with time for detailed views
 *
 * @param date - The date to format
 * @returns Formatted date and time string
 *
 * @example
 * formatProgramDateTime(new Date('2025-01-15T14:30:00'))
 * // Returns: "01/15/2025, 2:30 PM"
 */
export function formatProgramDateTime(date: Date): string {
  return date.toLocaleString(undefined, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Formats a date as a relative time string (e.g., "2 days ago")
 * Useful for showing how recently a program was modified.
 *
 * @param date - The date to format
 * @returns Relative time string
 *
 * @example
 * formatRelativeTime(new Date(Date.now() - 1000 * 60 * 60 * 24 * 2))
 * // Returns: "2 days ago"
 */
export function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) {
    return 'just now';
  } else if (diffMin < 60) {
    return `${diffMin} minute${diffMin === 1 ? '' : 's'} ago`;
  } else if (diffHour < 24) {
    return `${diffHour} hour${diffHour === 1 ? '' : 's'} ago`;
  } else if (diffDay < 7) {
    return `${diffDay} day${diffDay === 1 ? '' : 's'} ago`;
  } else {
    return formatProgramDate(date);
  }
}
