import { Instant, LocalDate, LocalDateTime, ZoneId } from "@js-joda/core";
import "@js-joda/timezone";
import { formatTimestamp } from "../utils/formatTimestamp";
import type { Resolution } from "./contracts";

export const TIMEZONE = "Europe/London";
export const INITIAL_DATE = "2026-04-22";

export function getDateRange(date: string, resolution: Resolution) {
  const selected = LocalDate.parse(date);
  const start =
    resolution === "week"
      ? selected.minusDays(selected.dayOfWeek().value() - 1)
      : selected;
  return {
    from: start.toString(),
    to: start.plusDays(resolution === "week" ? 7 : 1).toString(),
  };
}

export function moveDate(
  date: string,
  resolution: Resolution,
  direction: number,
) {
  return LocalDate.parse(date)
    .plusDays((resolution === "week" ? 7 : 1) * direction)
    .toString();
}

export function toInstant(date: string) {
  return LocalDateTime.parse(date.includes("T") ? date : `${date}T00:00`)
    .atZone(ZoneId.of(TIMEZONE))
    .toInstant()
    .toString();
}

export function formatDateRange(from: string, to: string) {
  const localDate = (value: string) =>
    value.endsWith("Z")
      ? Instant.parse(value)
          .atZone(ZoneId.of(TIMEZONE))
          .toLocalDate()
          .toString()
      : value.substring(0, 10);
  return `${localDate(from)} to ${localDate(to)}`;
}

export function formatChartTimestamp(value: string, resolution: Resolution) {
  return formatTimestamp(value, resolution, TIMEZONE);
}
