import {
  endOfMonth,
  endOfWeek,
  endOfYear,
  format,
  startOfMonth,
  startOfWeek,
  startOfYear,
} from "date-fns";
import type { SchedulePeriod } from "../types";

export interface ScheduleRangeInput {
  readonly period: SchedulePeriod;
  readonly day?: Date;
  readonly from?: Date;
  readonly to?: Date;
  readonly locale?: string;
}

export interface ScheduleRange {
  readonly from?: string;
  readonly to?: string;
}

const toISO = (date: Date) => format(date, "yyyy-MM-dd");

/**
 * Resolves the inclusive date range queried by the schedule report.
 * Week, month and year windows are always relative to today, so the JSON
 * report and its PDF export receive one identical from/to pair.
 */
export const resolveScheduleRange = ({
  period,
  day,
  from,
  to,
  locale,
}: ScheduleRangeInput): ScheduleRange => {
  const today = new Date();

  switch (period) {
    case "day":
      return day ? { from: toISO(day), to: toISO(day) } : {};
    case "week": {
      const weekStartsOn = locale === "es" ? 1 : 0;
      return {
        from: toISO(startOfWeek(today, { weekStartsOn })),
        to: toISO(endOfWeek(today, { weekStartsOn })),
      };
    }
    case "month":
      return { from: toISO(startOfMonth(today)), to: toISO(endOfMonth(today)) };
    case "year":
      return { from: toISO(startOfYear(today)), to: toISO(endOfYear(today)) };
    case "custom":
      return from && to ? { from: toISO(from), to: toISO(to) } : {};
  }
};
