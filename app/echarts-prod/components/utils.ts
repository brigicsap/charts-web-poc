import type { BarSeriesOption } from "echarts";

export type EnergyConstituent = {
	type: string;
	energy: number;
};

export type EnergyDatapoint = {
	from: string;
	constituentDatapoints: EnergyConstituent[];
};

export function round2(v: number): number {
	return Math.round(v * 100) / 100;
}

export function parseConstituentSeries(datapoints: EnergyDatapoint[]) {
	return datapoints.map((dp) => {
		const time = dp.from.slice(11, 16);
		const map: Record<string, number | string> = { time };
		for (const c of dp.constituentDatapoints) {
			map[c.type] = c.energy;
		}
		return map;
	});
}

export function buildQuarterHourSlots(): string[] {
	return Array.from({ length: 96 }, (_, i) => {
		const h = String(Math.floor(i / 4)).padStart(2, "0");
		const m = String((i % 4) * 15).padStart(2, "0");
		return `${h}:${m}`;
	});
}

export function formatDailyTimeTick(time: string, fallback = ""): string {
	if (time === "00:00" || time === "24:00") return "12am";
	if (time === "06:00") return "6am";
	if (time === "12:00") return "12pm";
	if (time === "18:00") return "6pm";
	return fallback;
}

export function toGBP(s: { units: number; nanos: number }): number {
	return s.units + s.nanos / 1_000_000_000;
}

export function formatTimestamp(
	value: string,
	resolution: "day" | "week",
): string {
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return value;
	return new Intl.DateTimeFormat(
		"en-GB",
		resolution === "week"
			? { weekday: "short" }
			: { hour: "numeric", minute: "2-digit", hour12: true },
	).format(date);
}

export function getMissingRanges(
	values: (number | null)[],
): [number, number][] {
	const ranges: [number, number][] = [];
	let start: number | null = null;
	values.forEach((value, index) => {
		if (value == null && start == null) start = index;
		if (start != null && (value != null || index === values.length - 1)) {
			ranges.push([start, value == null ? index : index - 1]);
			start = null;
		}
	});
	return ranges;
}

export type ChartSeries = {
	name: string;
	color: string;
	data: (number | null)[];
};

export function buildStackedSeries(
	series: ChartSeries[],
	selectedIndex: number | null,
	barMaxWidth = 32,
): BarSeriesOption[] {
	const slotCount = series[0]?.data.length ?? 0;
	const totals = Array.from({ length: slotCount }, (_, index) => {
		let positive = 0;
		let negative = 0;
		for (const item of series) {
			const value = item.data[index] ?? 0;
			if (value > 0) positive += value;
			else negative += value;
		}
		return { positive, negative };
	});
	const span =
		Math.max(0, ...totals.map((item) => item.positive)) -
		Math.min(0, ...totals.map((item) => item.negative));
	const gap = span * 0.008;
	return series.flatMap((item, seriesIndex): BarSeriesOption[] => {
		const hasAbove = (index: number, value: number) =>
			series
				.slice(seriesIndex + 1)
				.some((other) => (other.data[index] ?? 0) * value > 0);
		const real: BarSeriesOption = {
			id: item.name,
			name: item.name,
			type: "bar",
			stack: "usage",
			barMaxWidth,
			emphasis: { disabled: true },
			data: item.data.map((value, index) => ({
				value,
				itemStyle: {
					color: item.color,
					opacity: selectedIndex == null || selectedIndex === index ? 1 : 0.3,
					borderRadius:
						value != null && value !== 0 && !hasAbove(index, value)
							? value > 0
								? [4, 4, 0, 0]
								: [0, 0, 4, 4]
							: 0,
				},
			})),
		};
		if (seriesIndex === series.length - 1) return [real];
		return [
			real,
			{
				id: `${item.name}__gap`,
				name: `${item.name}__gap`,
				type: "bar",
				stack: "usage",
				barMaxWidth,
				silent: true,
				legendHoverLink: false,
				tooltip: { show: false },
				itemStyle: { color: "transparent" },
				data: item.data.map((value, index) =>
					value != null && value !== 0 && hasAbove(index, value)
						? Math.sign(value) * gap
						: 0,
				),
			},
		];
	});
}
