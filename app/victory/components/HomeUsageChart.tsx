"use client";

import { useState } from "react";
import {
	VictoryAxis,
	VictoryBar,
	VictoryChart,
	VictoryLabel,
	VictoryStack,
	VictoryTooltip,
} from "victory";
import { useChartTheme } from "../../ChartThemeContext";
import LegendValues from "../../chartjs/components/LegendValues";
import rawData from "../../mockData/homeUsageMockDay.json";
import { formatDailyTimeTick, parseConstituentSeries, round2 } from "./utils";

const parsed = parseConstituentSeries(rawData.datapoints);

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
const xTickFormat = (t: string) => formatDailyTimeTick(t, t);

type DataProps = { datum?: { x?: string | number } };

export default function BarChartDemo() {
	const { theme } = useChartTheme();
	const [activeX, setActiveX] = useState<string | null>(null);
	const activeIndex =
		activeX == null
			? null
			: parsed.findIndex((d) => String(d.time) === activeX);
	const solarSeries = parsed.map((d) => Number(d["solar-consumption"] ?? 0));
	const gridSeries = parsed.map((d) => Number(d["grid-consumption"] ?? 0));
	const batterySeries = parsed.map((d) =>
		Number(d["battery-consumption"] ?? 0),
	);
	const legendItems = [
		{
			label: "Solar",
			color: theme.secondary,
			valueText: `${round2(
				activeIndex == null || activeIndex < 0
					? solarSeries.reduce((sum, v) => sum + v, 0)
					: (solarSeries[activeIndex] ?? 0),
			).toFixed(2)} kWh`,
		},
		{
			label: "Grid",
			color: theme.tertiary,
			valueText: `${round2(
				activeIndex == null || activeIndex < 0
					? gridSeries.reduce((sum, v) => sum + v, 0)
					: (gridSeries[activeIndex] ?? 0),
			).toFixed(2)} kWh`,
		},
		{
			label: "Battery",
			color: theme.primary,
			valueText: `${round2(
				activeIndex == null || activeIndex < 0
					? batterySeries.reduce((sum, v) => sum + v, 0)
					: (batterySeries[activeIndex] ?? 0),
			).toFixed(2)} kWh`,
		},
	];

	const clickEvents = [
		{
			target: "data" as const,
			eventHandlers: {
				onClick: (_evt: unknown, props: DataProps) => {
					const xRaw = props.datum?.x;
					if (xRaw == null) return [];
					const x = String(xRaw);
					setActiveX((prev) => (prev === x ? null : x));
					return [];
				},
			},
		},
	];

	const opacity = (props: DataProps) =>
		activeX === null || String(props.datum?.x ?? "") === activeX ? 1 : 0.3;

	return (
		<div className="w-full h-80 flex flex-col gap-2">
			<LegendValues
				items={legendItems}
				isInteractive={activeIndex != null && activeIndex >= 0}
			/>
			<div className="flex-1 min-h-0">
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
								fill: (props: DataProps) =>
									String(props.datum?.x ?? "") === activeX
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
				</VictoryChart>
			</div>
		</div>
	);
}
