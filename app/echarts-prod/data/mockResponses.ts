import { Instant, LocalDate, LocalDateTime, ZoneId } from "@js-joda/core";
import "@js-joda/timezone";
import rawBattery from "../../mockData/batteryHistoryMockDay.json" with {
	type: "json",
};
import rawImportExport from "../../mockData/exportImportDay.json" with {
	type: "json",
};
import rawUsage from "../../mockData/homeUsageMockDay.json" with {
	type: "json",
};
import type {
	BatteryResponse,
	Constituent,
	EnergyResponse,
	Resolution,
	Scenario,
} from "./contracts";
import { getDateRange, moveDate, TIMEZONE, toInstant } from "./dates";

function sumConstituents(points: { constituentDatapoints: Constituent[] }[]) {
	const totals = new Map<Constituent["type"], Constituent>();
	for (const point of points) {
		for (const part of point.constituentDatapoints) {
			const previous = totals.get(part.type);
			const total: Constituent = {
				type: part.type,
				energy: (previous?.energy ?? 0) + part.energy,
			};
			if (part.cost) {
				const nanos = Math.round(
					((previous?.cost?.units ?? 0) +
						(previous?.cost?.nanos ?? 0) / 1e9 +
						part.cost.units +
						part.cost.nanos / 1e9) *
						1e9,
				);
				const units = Math.trunc(nanos / 1e9);
				total.cost = { currency: "GBP", units, nanos: nanos - units * 1e9 };
			}
			totals.set(part.type, total);
		}
	}
	return [...totals.values()];
}

export function makeEnergyResponse(
	kind: "home-usage" | "import-export",
	date: string,
	resolution: Resolution,
	scenario: Scenario,
): EnergyResponse {
	const range = getDateRange(date, resolution);
	const source =
		kind === "home-usage" ? rawUsage.datapoints : rawImportExport.datapoints;
	const dayStart = LocalDate.parse(range.from);
	const dayCount = resolution === "day" ? 1 : 7;
	const datapoints: EnergyResponse["datapoints"] = [];
	if (scenario !== "empty") {
		for (let day = 0; day < dayCount; day += 1) {
			const current = dayStart.plusDays(day);
			const slots = source.map((point, index) => ({
				from: LocalDateTime.parse(point.from)
					.withYear(current.year())
					.withMonth(current.monthValue())
					.withDayOfMonth(current.dayOfMonth())
					.toString(),
				to: current
					.atStartOfDay()
					.plusMinutes((index + 1) * 30)
					.toString(),
				constituentDatapoints:
					scenario === "gaps" && index >= 10 && index < 14
						? []
						: (point.constituentDatapoints as Constituent[]),
			}));
			if (resolution === "day") datapoints.push(...slots);
			else
				datapoints.push({
					from: current.toString(),
					to: current.plusDays(1).toString(),
					constituentDatapoints: sumConstituents(slots),
				});
		}
	}
	const constituentSummaries = sumConstituents(datapoints);
	return {
		energyType: kind === "home-usage" ? "energy-consumption" : "import-export",
		resolution,
		timezone: TIMEZONE,
		intervalMinutes: resolution === "day" ? 30 : 1440,
		units: { energy: "kWh" },
		pagination: {
			current: range,
			previous: [
				getDateRange(moveDate(range.from, resolution, -1), resolution),
			],
			next: [getDateRange(moveDate(range.from, resolution, 1), resolution)],
			resolutions: {
				day: getDateRange(date, "day"),
				week: getDateRange(date, "week"),
			},
		},
		summary: {
			energy: constituentSummaries.reduce(
				(total, point) => total + point.energy,
				0,
			),
			constituentSummaries,
		},
		datapoints,
	};
}

export function makeBatteryResponse(
	date: string,
	resolution: Resolution,
	scenario: Scenario,
): BatteryResponse {
	const range = getDateRange(date, resolution);
	const from = toInstant(range.from);
	const to = toInstant(range.to);
	const start = Instant.parse(from);
	const end = Instant.parse(to);
	const readings = new Map(
		rawBattery.datapoints.map((point) => [
			LocalDateTime.parse(point.timestamp).toLocalTime().toString(),
			point.batteryPercentage,
		]),
	);
	const datapoints: BatteryResponse["datapoints"] = [];
	if (scenario !== "empty") {
		let index = 0;
		for (let time = start; time.isBefore(end); time = time.plusSeconds(900)) {
			const local = time.atZone(ZoneId.of(TIMEZONE)).toLocalTime().toString();
			const value = readings.get(local);
			if (
				value !== undefined &&
				!(scenario === "gaps" && index % 96 >= 40 && index % 96 < 52)
			) {
				datapoints.push({
					timestamp: time.toString(),
					batteryPercentage: value,
				});
			}
			index += 1;
		}
	}
	return {
		resolution,
		timezone: TIMEZONE,
		intervalMinutes: 15,
		range: { from, to },
		datapoints,
	};
}
