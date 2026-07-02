/** Formats an ISO date as e.g. "14 June 2026". Locale-stable for SSR. */
export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(iso));
}

export function readingLabel(minutes?: number): string | null {
  if (!minutes) return null;
  return `${minutes} min read`;
}
