import assert from "node:assert/strict";
import { test } from "node:test";
import { energyResponseSchema, batteryResponseSchema } from "./contracts.ts";
import { getDateRange, toInstant, formatDateRange } from "./dates.ts";
import {
	constituentValue,
	mapEnergyChart,
	mapBatteryChart,
} from "./mappers.ts";

const range = { from: "2026-04-22", to: "2026-04-23" };
const energyResponse = () => ({
	energyType: "energy-consumption",
	resolution: "day",
	timezone: "Europe/London",
	intervalMinutes: 30,
	units: { energy: "kWh" },
	pagination: {
		current: range,
		previous: [],
		next: [],
		resolutions: { day: range, week: range },
	},
	summary: {
		energy: 99,
		constituentSummaries: [{ type: "solar-consumption", energy: 99 }],
	},
	datapoints: [
		{
			from: "2026-04-22T00:00",
			to: "2026-04-22T00:30",
			constituentDatapoints: [
				{ type: "solar-consumption", energy: 1 },
				{ type: "solar-consumption", energy: 2 },
			],
		},
		{
			from: "2026-04-22T00:30",
			to: "2026-04-22T01:00",
			constituentDatapoints: [],
		},
	],
});

test("mapping sums repeated constituents but uses server summaries for totals", () => {
	const mapped = mapEnergyChart(energyResponseSchema.parse(energyResponse()));
	assert.deepEqual(mapped.series[0].data, [3, null]);
	assert.equal(mapped.series[0].summary, 99);
	assert.equal(mapped.labels.length, 2);
	assert.equal(mapped.labels[1], "2026-04-22T01:00");
	assert.equal(mapped.pointsByIndex[0].constituentDatapoints.length, 2);
});

test("energy zero, missing data, and missing cost stay distinct", () => {
	const parts = [{ type: "grid-import", energy: 0 }];
	assert.equal(constituentValue(parts, "grid-import", "energy"), 0);
	assert.equal(constituentValue(parts, "grid-import", "cost"), null);
	assert.equal(constituentValue([], "grid-import", "energy"), null);
	assert.equal(
		constituentValue(
			[{ ...parts[0], cost: { currency: "GBP", units: 0, nanos: -500000000 } }],
			"grid-import",
			"cost",
		),
		-0.5,
	);
});

test("battery readings align by timestamp, including missing slots and the terminal boundary", () => {
	const response = batteryResponseSchema.parse({
		resolution: "day",
		timezone: "Europe/London",
		intervalMinutes: 15,
		range: { from: "2026-04-22T00:00:00Z", to: "2026-04-22T00:45:00Z" },
		datapoints: [
			{ timestamp: "2026-04-22T00:30:00Z", batteryPercentage: 0 },
			{ timestamp: "2026-04-22T00:00:00Z", batteryPercentage: 80 },
		],
	});
	const mapped = mapBatteryChart(response);
	assert.deepEqual(mapped.values, [80, null, 0, null]);
	assert.equal(mapped.latest, 2);
	assert.equal(mapped.pointsByIndex[1], null);
});

test("London DST days produce the actual number of elapsed quarter-hour slots", () => {
	for (const [from, to, expected] of [
		["2026-03-29", "2026-03-30", 93],
		["2026-10-25", "2026-10-26", 101],
	]) {
		const mapped = mapBatteryChart({
			resolution: "day",
			timezone: "Europe/London",
			intervalMinutes: 15,
			range: { from: toInstant(from), to: toInstant(to) },
			datapoints: [],
		});
		assert.equal(mapped.values.length, expected);
		assert.equal(mapped.latest, -1);
	}
});

test("week requests normalize to Monday and UTC ranges display as London dates", () => {
	assert.deepEqual(getDateRange("2026-04-22", "week"), {
		from: "2026-04-20",
		to: "2026-04-27",
	});
	assert.equal(
		formatDateRange(toInstant("2026-04-22"), toInstant("2026-04-23")),
		"2026-04-22 to 2026-04-23",
	);
});

test("response validation rejects malformed payloads and invalid dates", () => {
	assert.equal(
		energyResponseSchema.safeParse({ datapoints: "broken" }).success,
		false,
	);
	const response = energyResponse();
	response.datapoints[0].from = "2026-02-30T00:00";
	assert.equal(energyResponseSchema.safeParse(response).success, false);
});
