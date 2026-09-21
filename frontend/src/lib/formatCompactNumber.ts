export function formatCompactNumber(value: number): string {
  const number = Number(value);

  if (!Number.isFinite(number)) return "0";

  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    compactDisplay: "short",
    maximumFractionDigits: 1,
  }).format(number);
}
