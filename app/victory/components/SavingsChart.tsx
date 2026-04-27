"use client";

import { useState } from "react";
import {
	VictoryArea,
	VictoryAxis,
	VictoryChart,
	VictoryVoronoiContainer,
} from "victory";
import { useChartTheme } from "../../ChartThemeContext";
import LegendValues from "../../chartjs/components/LegendValues";
import rawData from "../../mockData/savingsMock.json";
import { round2, toGBP } from "./utils";

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
	const [hoverIndex, setHoverIndex] = useState<number | null>(null);
	const notOptimisedOverall = round2(
		data.reduce((sum, row) => sum + row.notOptimised, 0),
	);
	const usedOverall = round2(data.reduce((sum, row) => sum + row.used, 0));
	const hoverRow =
		hoverIndex == null ? null : data.find((d) => d.index === hoverIndex);
	const legendItems = [
		{
			label: "Not Optimised",
			color: theme.primary,
			valueText: `£${round2(hoverRow?.notOptimised ?? notOptimisedOverall).toFixed(2)}`,
		},
		{
			label: "Used Strategy",
			color: theme.tertiary,
			valueText: `£${round2(hoverRow?.used ?? usedOverall).toFixed(2)}`,
		},
	];
	return (
		<div className="w-full h-80 flex flex-col gap-2">
			<LegendValues items={legendItems} isInteractive={hoverRow != null} />
			<div className="flex-1 min-h-0">
				<VictoryChart
					padding={{ top: 40, bottom: 40, left: 60, right: 20 }}
					containerComponent={
						<VictoryVoronoiContainer
							labels={() => ""}
							onActivated={(points) => {
								if (!points.length) return;
								const p = points[0] as { x?: number };
								setHoverIndex(typeof p.x === "number" ? p.x : null);
							}}
							onDeactivated={() => setHoverIndex(null)}
						/>
					}
				>
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
				</VictoryChart>
			</div>
		</div>
	);
}
