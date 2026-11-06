export type EnergyConstituent = {
	type: string;
	energy: number;
};

export type EnergyDatapoint = {
	from: string;
	constituentDatapoints: EnergyConstituent[];
};

// Flatten datapoint constituents into chart rows keyed by time and series type.
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
