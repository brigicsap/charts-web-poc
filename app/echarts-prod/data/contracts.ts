import { z } from "zod";
import { LocalDate, LocalDateTime } from "@js-joda/core";

export const resolutionSchema = z.enum(["day", "week"]);
export const scenarioSchema = z.enum([
  "success",
  "slow",
  "empty",
  "gaps",
  "error",
  "invalid",
]);
export const chartSchema = z.enum([
  "home-usage",
  "import-export",
  "battery-history",
]);
const localTimestampSchema = z.string().refine((value) => {
  try {
    if (value.includes("T")) LocalDateTime.parse(value);
    else LocalDate.parse(value);
    return true;
  } catch {
    return false;
  }
}, "Invalid local date or date-time");
const rangeSchema = z.object({
  from: localTimestampSchema,
  to: localTimestampSchema,
});
const moneySchema = z.object({
  currency: z.literal("GBP"),
  units: z.number().int(),
  nanos: z.number().int(),
});
const constituentSchema = z.object({
  type: z.enum([
    "solar-consumption",
    "battery-consumption",
    "grid-consumption",
    "grid-import",
    "grid-export",
  ]),
  energy: z.number(),
  cost: moneySchema.optional(),
});

export const energyResponseSchema = z.object({
  energyType: z.enum(["energy-consumption", "import-export"]),
  resolution: resolutionSchema,
  timezone: z.literal("Europe/London"),
  intervalMinutes: z.number().positive(),
  units: z.object({ energy: z.literal("kWh") }),
  pagination: z.object({
    current: rangeSchema,
    previous: z.array(rangeSchema),
    next: z.array(rangeSchema),
    resolutions: z.object({ day: rangeSchema, week: rangeSchema }),
  }),
  summary: z.object({
    energy: z.number(),
    constituentSummaries: z.array(constituentSchema),
  }),
  datapoints: z.array(
    z.object({
      from: localTimestampSchema,
      to: localTimestampSchema,
      constituentDatapoints: z.array(constituentSchema),
    }),
  ),
});

export const batteryResponseSchema = z.object({
  resolution: resolutionSchema,
  timezone: z.literal("Europe/London"),
  intervalMinutes: z.number().positive(),
  range: z.object({ from: z.iso.datetime(), to: z.iso.datetime() }),
  datapoints: z.array(
    z.object({
      timestamp: z.iso.datetime(),
      batteryPercentage: z.number().min(0).max(100).nullable(),
    }),
  ),
});

export type Resolution = z.infer<typeof resolutionSchema>;
export type Scenario = z.infer<typeof scenarioSchema>;
export type ChartKind = z.infer<typeof chartSchema>;
export type EnergyResponse = z.infer<typeof energyResponseSchema>;
export type BatteryResponse = z.infer<typeof batteryResponseSchema>;
export type Constituent = z.infer<typeof constituentSchema>;
