/**
 * Small date formatting helpers.
 * Implemented without Intl so they work reliably on Hermes / React Native.
 */

function pad(n: number): string {
  return n < 10 ? `0${n}` : `${n}`;
}

/** Formats an ISO timestamp as HH:MM. Returns '' for missing/invalid values. */
export function formatTime(iso?: string | null): string {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

/** Formats a timestamp as HH:MM when it is today, otherwise as MM/DD. */
export function formatDay(iso?: string | null): string {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  const today = new Date();
  const isToday = date.toDateString() === today.toDateString();
  if (isToday) return formatTime(iso);
  return `${pad(date.getMonth() + 1)}/${pad(date.getDate())}`;
}