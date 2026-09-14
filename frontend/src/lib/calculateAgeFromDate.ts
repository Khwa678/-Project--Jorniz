const AGE_UNITS = [
  { name: "year", milliseconds: 365 * 24 * 60 * 60 * 1000 },
  { name: "month", milliseconds: 30 * 24 * 60 * 60 * 1000 },
  { name: "day", milliseconds: 24 * 60 * 60 * 1000 },
  { name: "hour", milliseconds: 60 * 60 * 1000 },
  { name: "min", milliseconds: 60 * 1000 },
] as const;

export function calculateAgeFromDate(value?: string, today = new Date()) {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const elapsedMilliseconds = Math.max(0, today.getTime() - date.getTime());
  if (elapsedMilliseconds < AGE_UNITS.at(-1)!.milliseconds) return "Just now";

  const unit = AGE_UNITS.find(({ milliseconds }) => elapsedMilliseconds >= milliseconds)!;
  const age = Math.floor(elapsedMilliseconds / unit.milliseconds);
  const unitName = age === 1 ? unit.name : `${unit.name}s`;

  return `${age} ${unitName} ago`;
}
