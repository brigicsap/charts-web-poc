import { Instant, LocalDate, LocalDateTime } from "@js-joda/core";
import { toGBP } from "../utils/toGBP";
import type { BatteryResponse, Constituent, EnergyResponse } from "./contracts";

export type Unit = "energy" | "cost";

const consumptionTypes = [
  "solar-consumption",
  "battery-consumption",
  "grid-consumption",
] as const;
const importExportTypes = ["grid-import", "grid-export"] as const;

export function constituentValue(
  parts: Constituent[],
  type: Constituent["type"],
  unit: Unit,
): number | null {
  const matching = parts.filter(
    (part) => part.type === type && (unit === "energy" || part.cost != null),
  );
  if (!matching.length) return null;
  return matching.reduce(
    (sum, part) =>
      sum +
      (unit === "energy"
        ? part.energy
        : toGBP(part.cost ?? { units: 0, nanos: 0 })),
    0,
  );
}

export function mapEnergyChart(
  response: EnergyResponse,
  unit: Unit = "energy",
) {
  const types =
    response.energyType === "energy-consumption"
      ? consumptionTypes
      : importExportTypes;
  const labels = response.datapoints.map((point, index) =>
    response.resolution === "day"
      ? LocalDateTime.parse(
          index === response.datapoints.length - 1 ? point.to : point.from,
        ).toString()
      : LocalDate.parse(point.from).toString(),
  );
  const pointsByIndex = Object.fromEntries(
    response.datapoints.map((point, index) => [index, point]),
  );
  const series = types.map((type) => ({
    type,
    data: response.datapoints.map((point) =>
      constituentValue(point.constituentDatapoints, type, unit),
    ),
    summary: constituentValue(
      response.summary.constituentSummaries,
      type,
      unit,
    ),
  }));
  return { labels, pointsByIndex, series };
}

export function mapBatteryChart(response: BatteryResponse) {
  const start = Instant.parse(response.range.from);
  const end = Instant.parse(response.range.to);
  const readings = new Map(
    response.datapoints.map((point) => [
      Instant.parse(point.timestamp).toEpochMilli(),
      point,
    ]),
  );
  const labels: string[] = [];
  const values: (number | null)[] = [];
  const pointsByIndex: Record<
    number,
    BatteryResponse["datapoints"][number] | null
  > = {};
  for (
    let time = start;
    !time.isAfter(end);
    time = time.plusSeconds(response.intervalMinutes * 60)
  ) {
    const point = readings.get(time.toEpochMilli()) ?? null;
    pointsByIndex[labels.length] = point;
    labels.push(time.toString());
    values.push(point?.batteryPercentage ?? null);
  }
  return {
    labels,
    values,
    pointsByIndex,
    latest: values.findLastIndex((value) => value != null),
  };
}
