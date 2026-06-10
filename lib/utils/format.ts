const dateTimeFormatter = new Intl.DateTimeFormat("he-IL", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Asia/Jerusalem",
});

export function formatDateTime(value: string | Date) {
  return dateTimeFormatter.format(typeof value === "string" ? new Date(value) : value);
}

export function formatDurationMinutes(minutes: number) {
  return `${minutes} דקות`;
}
