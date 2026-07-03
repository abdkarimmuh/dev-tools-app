export interface CronField {
  key: "minute" | "hour" | "day" | "month" | "weekday";
  label: string;
  min: number;
  max: number;
  names?: string[];
}

export const FIELDS: CronField[] = [
  { key: "minute", label: "Minute", min: 0, max: 59 },
  { key: "hour", label: "Hour", min: 0, max: 23 },
  { key: "day", label: "Day of Month", min: 1, max: 31 },
  {
    key: "month",
    label: "Month",
    min: 1,
    max: 12,
    names: [
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
      "Dec"
    ]
  },
  {
    key: "weekday",
    label: "Day of Week",
    min: 0,
    max: 6,
    names: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
  }
];

export const PRESETS = [
  { label: "Every minute", value: "* * * * *" },
  { label: "Every hour", value: "0 * * * *" },
  { label: "Every day at midnight", value: "0 0 * * *" },
  { label: "Every day at noon", value: "0 12 * * *" },
  { label: "Every Sunday at midnight", value: "0 0 * * 0" },
  { label: "Every Monday at 9am", value: "0 9 * * 1" },
  { label: "First day of month", value: "0 0 1 * *" },
  { label: "Every 15 minutes", value: "*/15 * * * *" },
  { label: "Every 6 hours", value: "0 */6 * * *" },
  { label: "Weekdays at 9am", value: "0 9 * * 1-5" }
];
