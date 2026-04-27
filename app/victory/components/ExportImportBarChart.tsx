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
import rawData from "../../mockData/exportImportDay.json";
import { formatDailyTimeTick, parseConstituentSeries, round2 } from "./utils";

const parsed = parseConstituentSeries(rawData.datapoints);

const importData = parsed.map((d) => ({
	x: d.time,
	y: d["grid-import"] ?? 0,
}));
const exportData = parsed.map((d) => ({
	x: d.time,
	y: d["grid-export"] ?? 0,
}));

const maxTotal = Math.max(
	...parsed.map(
		(d) => Number(d["grid-import"] ?? 0) + Number(d["grid-export"] ?? 0),
	),
);
const backgroundData = parsed.map((d) => ({ x: d.time, y: maxTotal }));

const xTickValues = ["00:00", "06:00", "12:00", "18:00"];
const xTickFormat = (t: string) => formatDailyTimeTick(t, t);

type DataProps = { datum?: { x?: string | number } };

export default function ExportImportBarChart() {
	const { theme } = useChartTheme();
	const [activeX, setActiveX] = useState<string | null>(null);
	const activeIndex =
		activeX == null
			? null
			: parsed.findIndex((d) => String(d.time) === activeX);
	const importSeries = parsed.map((d) => Number(d["grid-import"] ?? 0));
	const exportSeries = parsed.map((d) => Number(d["grid-export"] ?? 0));
	const legendItems = [
		{
			label: "Import",
			color: theme.primary,
			valueText: `£${round2(
				activeIndex == null || activeIndex < 0
					? importSeries.reduce((sum, v) => sum + v, 0)
					: (importSeries[activeIndex] ?? 0),
			).toFixed(2)}`,
		},
		{
			label: "Export",
			color: theme.secondary,
			valueText: `£${round2(
				activeIndex == null || activeIndex < 0
					? exportSeries.reduce((sum, v) => sum + v, 0)
					: (exportSeries[activeIndex] ?? 0),
			).toFixed(2)}`,
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
					domainPadding={{ x: 10 }}
					padding={{ top: 40, bottom: 40, left: 50, right: 20 }}
				>
					{/* Zero reference line */}
					<VictoryAxis
						tickFormat={() => ""}
						style={{
							axis: { stroke: theme.referenceLine, strokeWidth: 1 },
							ticks: { size: 0 },
							grid: { stroke: "none" },
						}}
					/>
					{/* Labels at bottom */}
					<VictoryAxis
						tickValues={xTickValues}
						tickFormat={xTickFormat}
						offsetY={40}
						style={{
							axis: { stroke: theme.grid, strokeWidth: 1 },
							grid: { stroke: "none" },
						}}
					/>
					<VictoryAxis
						orientation="top"
						style={{
							axis: { stroke: theme.grid, strokeWidth: 1 },
							ticks: { size: 0 },
							tickLabels: { fill: "none" },
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
						label="£"
					/>
					<VictoryAxis
						dependentAxis
						orientation="right"
						style={{
							axis: { stroke: theme.grid, strokeWidth: 1 },
							ticks: { size: 0 },
							tickLabels: { fill: "none" },
							grid: { stroke: "none" },
						}}
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
							data={importData}
							style={{ data: { fill: theme.primary, opacity } }}
							cornerRadius={{ topLeft: 2, topRight: 2 }}
							events={clickEvents}
							labelComponent={<VictoryTooltip />}
						/>
						<VictoryBar
							data={exportData}
							style={{ data: { fill: theme.secondary, opacity } }}
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
