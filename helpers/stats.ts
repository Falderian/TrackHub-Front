export type Range = "weekly" | "monthly" | "annual";
export type Metric = "distance" | "rides" | "time";

export const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
export const MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export function computeRange(r: Range): { from: string; to: string } {
  const now = new Date();
  const to = now.toISOString();
  const d = new Date(now);
  switch (r) {
    case "weekly":
      d.setDate(d.getDate() - 7);
      break;
    case "monthly":
      d.setDate(d.getDate() - 30);
      break;
    case "annual":
      d.setDate(d.getDate() - 365);
      break;
  }
  return { from: d.toISOString(), to };
}

export function computeGranularity(range: Range): "day" | "week" | "month" {
  if (range === "annual") return "month";
  if (range === "monthly") return "week";
  return "day";
}

export function fmtLabel(
  raw: string,
  granularity: "day" | "week" | "month",
): string {
  const d = new Date(`${raw}T00:00:00`);
  if (granularity === "month") return MONTH_NAMES[d.getMonth()];
  if (granularity === "week")
    return `${MONTH_NAMES[d.getMonth()]} ${d.getDate()}`;
  return DAY_NAMES[d.getDay()];
}
