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
import rawDayData from "../../mockData/homeUsageMockDay.json";
import rawWeekData from "../../mockData/homeUsageMockWeek.json";
import { formatDailyTimeTick, parseConstituentSeries, round2 } from "./utils";

type View = "day" | "week";

function formatWeekLabel(time: string): string {
	const date = new Date(time);
	return date.toLocaleDateString("en-GB", { weekday: "short" });
}

function buildVictoryData(parsed: Record<string, number | string>[]) {
	const solar = parsed.map((d) => ({
		x: d.time,
		y: d["solar-consumption"] ?? 0,
	}));
	const grid = parsed.map((d) => ({
		x: d.time,
		y: d["grid-consumption"] ?? 0,
	}));
	const battery = parsed.map((d) => ({
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
	const background = parsed.map((d) => ({ x: d.time, y: maxTotal }));
	const GAP = 0.02;
	const gap1 = parsed.map((d) => ({
		x: d.time,
		y: Number(d["solar-consumption"] ?? 0) > 0 ? GAP : 0,
	}));
	const gap2 = parsed.map((d) => ({
		x: d.time,
		y: Number(d["grid-consumption"] ?? 0) > 0 ? GAP : 0,
	}));
	return { solar, grid, battery, background, parsed, gap1, gap2 };
}

const dayParsed = parseConstituentSeries(rawDayData.datapoints);
const dayVictory = buildVictoryData(dayParsed);
// Append end-of-day marker for full 24hr axis
const endMarker = { x: "24:00", y: 0 };
dayVictory.solar.push(endMarker);
dayVictory.grid.push(endMarker);
dayVictory.battery.push(endMarker);
dayVictory.background.push(endMarker);
dayVictory.gap1.push(endMarker);
dayVictory.gap2.push(endMarker);

const weekParsed = rawWeekData.datapoints.map((dp) => {
	const map: Record<string, number | string> = { time: dp.from };
	for (const c of dp.constituentDatapoints) {
		map[c.type] = c.energy;
	}
	return map;
});
const weekVictory = buildVictoryData(weekParsed);

const dayXTickValues = ["00:00", "06:00", "12:00", "18:00", "24:00"];
const dayXTickFormat = (t: string) => formatDailyTimeTick(t, t);
const weekXTickValues = weekParsed.map((d) => String(d.time));
const weekXTickFormat = (t: string) => formatWeekLabel(t);

type DataProps = { datum?: { x?: string | number } };

export default function BarChartDemo() {
	const { theme } = useChartTheme();
	const [activeX, setActiveX] = useState<string | null>(null);
	const [view, setView] = useState<View>("day");

	const d = view === "day" ? dayVictory : weekVictory;
	const xTickValues = view === "day" ? dayXTickValues : weekXTickValues;
	const xTickFormat = view === "day" ? dayXTickFormat : weekXTickFormat;

	const activeIndex =
		activeX == null
			? null
			: d.parsed.findIndex((p) => String(p.time) === activeX);

	const solarSeries = d.parsed.map((p) => Number(p["solar-consumption"] ?? 0));
	const gridSeries = d.parsed.map((p) => Number(p["grid-consumption"] ?? 0));
	const batterySeries = d.parsed.map((p) =>
		Number(p["battery-consumption"] ?? 0),
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
			<div className="flex justify-end gap-1">
				<button
					type="button"
					onClick={() => {
						setView("day");
						setActiveX(null);
					}}
					className={`px-3 py-1 text-sm rounded ${view === "day" ? "bg-gray-800 text-white" : "bg-gray-200 text-gray-700"}`}
				>
					Day
				</button>
				<button
					type="button"
					onClick={() => {
						setView("week");
						setActiveX(null);
					}}
					className={`px-3 py-1 text-sm rounded ${view === "week" ? "bg-gray-800 text-white" : "bg-gray-200 text-gray-700"}`}
				>
					Week
				</button>
			</div>
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
						label="kWh"
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
						data={d.background}
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
							data={d.solar}
							style={{ data: { fill: theme.secondary, opacity } }}
							events={clickEvents}
							labelComponent={<VictoryTooltip />}
						/>
						<VictoryBar
							data={d.gap1}
							style={{ data: { fill: "transparent", stroke: "none" } }}
						/>
						<VictoryBar
							data={d.grid}
							style={{ data: { fill: theme.tertiary, opacity } }}
							cornerRadius={{
								topLeft: (props: DataProps) => {
									const idx = d.parsed.findIndex(
										(p) => String(p.time) === String(props.datum?.x ?? ""),
									);
									return idx >= 0 &&
										Number(d.parsed[idx]["battery-consumption"] ?? 0) === 0
										? 2
										: 0;
								},
								topRight: (props: DataProps) => {
									const idx = d.parsed.findIndex(
										(p) => String(p.time) === String(props.datum?.x ?? ""),
									);
									return idx >= 0 &&
										Number(d.parsed[idx]["battery-consumption"] ?? 0) === 0
										? 2
										: 0;
								},
							}}
							events={clickEvents}
							labelComponent={<VictoryTooltip />}
						/>
						<VictoryBar
							data={d.gap2}
							style={{ data: { fill: "transparent", stroke: "none" } }}
						/>
						<VictoryBar
							data={d.battery}
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
