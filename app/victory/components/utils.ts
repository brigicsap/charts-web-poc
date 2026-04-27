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

export function formatDailyTimeTick(time: string, fallback = time): string {
	if (time === "00:00" || time === "24:00") return "12am";
	if (time === "06:00") return "6am";
	if (time === "12:00") return "12pm";
	if (time === "18:00") return "6pm";
	return fallback;
}

export function toGBP(s: { units: number; nanos: number }): number {
	return s.units + s.nanos / 1_000_000_000;
}
