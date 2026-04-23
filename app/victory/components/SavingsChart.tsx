"use client";

import { VictoryArea, VictoryAxis, VictoryChart, VictoryLegend } from "victory";
import { useChartTheme } from "../../ChartThemeContext";
import rawData from "../../mockData/savingsMock.json";

function toGBP(s: { units: number; nanos: number }) {
	return s.units + s.nanos / 1_000_000_000;
}

const data = rawData.intervalSavings.map((d, i) => {
	const date = new Date(d.start);
	const label = `${date.getDate()}/${date.getMonth() + 1}`;
	return {
		index: i,
		label,
		notOptimised: Math.round(toGBP(d.notOptimisedStrategySavings) * 100) / 100,
		used: Math.round(toGBP(d.usedStrategySavings) * 100) / 100,
	};
});

const notOptimisedData = data.map((d) => ({ x: d.index, y: d.notOptimised }));
const usedData = data.map((d) => ({ x: d.index, y: d.used }));
const tickValues = data.map((d) => d.index);
const tickLabels = data.map((d) => d.label);

export default function SavingsChart() {
	const { theme } = useChartTheme();
	return (
		<div className="w-full h-80">
			<VictoryChart padding={{ top: 40, bottom: 40, left: 60, right: 20 }}>
				<VictoryAxis
					tickValues={tickValues}
					tickFormat={tickLabels}
					style={{ grid: { stroke: "none" } }}
				/>
				<VictoryAxis
					dependentAxis
					tickFormat={(t: number) => `£${t}`}
					style={{
						axis: { stroke: "none" },
						grid: { stroke: theme.grid, strokeDasharray: "3 3" },
					}}
				/>
				<VictoryArea
					data={notOptimisedData}
					interpolation="monotoneX"
					style={{
						data: {
							stroke: theme.primary,
							strokeWidth: 2,
							fill: theme.primary,
						},
					}}
				/>
				<VictoryArea
					data={usedData}
					interpolation="monotoneX"
					style={{
						data: {
							stroke: theme.tertiary,
							strokeWidth: 2,
							fill: theme.tertiary,
						},
					}}
				/>
				<VictoryLegend
					x={220}
					y={0}
					orientation="horizontal"
					data={[
						{ name: "Not Optimised", symbol: { fill: theme.primary } },
						{ name: "Used Strategy", symbol: { fill: theme.tertiary } },
					]}
				/>
			</VictoryChart>
		</div>
	);
}
