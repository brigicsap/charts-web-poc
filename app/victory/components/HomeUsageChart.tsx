"use client";

import { useState } from "react";
import {
	VictoryAxis,
	VictoryBar,
	VictoryChart,
	VictoryLabel,
	VictoryLegend,
	VictoryStack,
	VictoryTooltip,
} from "victory";
import { useChartTheme } from "../../ChartThemeContext";
import rawData from "../../mockData/homeUsageMockDay.json";

const parsed = rawData.datapoints.map((dp) => {
	const time = dp.from.slice(11, 16);
	const map: Record<string, number | string> = { time };
	for (const c of dp.constituentDatapoints) {
		map[c.type] = c.energy;
	}
	return map;
});

const solarData = parsed.map((d) => ({
	x: d.time,
	y: d["solar-consumption"] ?? 0,
}));
const gridData = parsed.map((d) => ({
	x: d.time,
	y: d["grid-consumption"] ?? 0,
}));
const batteryData = parsed.map((d) => ({
	x: d.time,
	y: d["battery-consumption"] ?? 0,
}));

const maxTotal = Math.max(
	...parsed.map(
		(d) =>
			Number(d["solar-consumption"] ?? 0) +
			Number(d["grid-consumption"] ?? 0) +
			Number(d["battery-consumption"] ?? 0),
	),
);
const backgroundData = parsed.map((d) => ({ x: d.time, y: maxTotal }));

const xTickValues = ["00:00", "06:00", "12:00", "18:00"];
const xTickFormat = (t: string) => {
	const h = parseInt(t.slice(0, 2));
	if (h === 0) return "12am";
	if (h === 6) return "6am";
	if (h === 12) return "12pm";
	if (h === 18) return "6pm";
	return t;
};

export default function BarChartDemo() {
	const { theme } = useChartTheme();
	const [activeX, setActiveX] = useState<string | null>(null);

	const clickEvents = [
		{
			target: "data" as const,
			eventHandlers: {
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				onClick: (_evt: unknown, props: any) => {
					const x = String(props.datum.x);
					setActiveX((prev) => (prev === x ? null : x));
					return [];
				},
			},
		},
	];

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const opacity = (props: any) =>
		activeX === null || String(props.datum.x) === activeX ? 1 : 0.3;

	return (
		<div className="w-full h-80">
			<VictoryChart
				domainPadding={{ x: 10, y: [0, 20] }}
				padding={{ top: 40, bottom: 40, left: 50, right: 20 }}
			>
				<VictoryAxis
					tickValues={xTickValues}
					tickFormat={xTickFormat}
					style={{
						axis: { stroke: theme.grid, strokeWidth: 1 },
						grid: { stroke: "none" },
					}}
				/>
				<VictoryAxis
					dependentAxis
					style={{
						axis: { stroke: theme.grid, strokeWidth: 1 },
						tickLabels: { fontSize: 10 },
						grid: { stroke: theme.grid, strokeDasharray: "3 3" },
					}}
					axisLabelComponent={
						<VictoryLabel
							angle={0}
							verticalAnchor="end"
							textAnchor="start"
							dx={8}
							dy={-4}
						/>
					}
					label="kWh"
				/>
				<VictoryBar
					data={backgroundData}
					style={{
						data: {
							// eslint-disable-next-line @typescript-eslint/no-explicit-any
							fill: (props: any) =>
								String(props.datum.x) === activeX
									? "rgba(0,0,0,0.07)"
									: "transparent",
							stroke: "none",
						},
					}}
				/>
				<VictoryStack>
					<VictoryBar
						data={solarData}
						style={{ data: { fill: theme.secondary, opacity } }}
						events={clickEvents}
						labelComponent={<VictoryTooltip />}
					/>
					<VictoryBar
						data={gridData}
						style={{ data: { fill: theme.tertiary, opacity } }}
						cornerRadius={{ topLeft: 2, topRight: 2 }}
						events={clickEvents}
						labelComponent={<VictoryTooltip />}
					/>
					<VictoryBar
						data={batteryData}
						style={{
							data: {
								fill: theme.primary,
								opacity,
							},
						}}
						cornerRadius={{ topLeft: 2, topRight: 2 }}
						events={clickEvents}
						labelComponent={<VictoryTooltip />}
					/>
				</VictoryStack>
				<VictoryLegend
					x={230}
					y={0}
					orientation="horizontal"
					gutter={20}
					data={[
						{ name: "Solar", symbol: { fill: theme.secondary } },
						{ name: "Grid", symbol: { fill: theme.tertiary } },
						{ name: "Battery", symbol: { fill: theme.primary } },
					]}
				/>
			</VictoryChart>
		</div>
	);
}
