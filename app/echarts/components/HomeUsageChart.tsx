"use client";

import * as echarts from "echarts";
import { useEffect, useRef, useState } from "react";
import { useChartTheme } from "../../ChartThemeContext";
import LegendValues from "../../chartjs/components/LegendValues";
import rawDayData from "../../mockData/homeUsageMockDay.json";
import rawWeekData from "../../mockData/homeUsageMockWeek.json" with {
	type: "json",
};
import { formatDailyTimeTick, parseConstituentSeries, round2 } from "./utils";

type View = "day" | "week";

function parseData(raw: { datapoints: typeof rawDayData.datapoints }) {
	const parsed = parseConstituentSeries(raw.datapoints);
	const times = parsed.map((d) => d.time);
	const solar = parsed.map((d) => Number(d["solar-consumption"] ?? 0));
	const grid = parsed.map((d) => Number(d["grid-consumption"] ?? 0));
	const battery = parsed.map((d) => Number(d["battery-consumption"] ?? 0));
	const GAP = 0.005;
	const gap1 = solar.map((v) => (v > 0 ? GAP : 0));
	const gap2 = grid.map((v) => (v > 0 ? GAP : 0));
	return { times, solar, grid, battery, gap1, gap2 };
}

function formatWeekLabel(time: string): string {
	const date = new Date(time);
	return date.toLocaleDateString("en-GB", { weekday: "short" });
}

const dayData = parseData(rawDayData);
// Append end-of-day marker for full 24hr axis
dayData.times.push("24:00");
dayData.solar.push(0);
dayData.grid.push(0);
dayData.battery.push(0);
dayData.gap1.push(0);
dayData.gap2.push(0);
const weekParsed = parseConstituentSeries(rawWeekData.datapoints);
const weekData = {
	times: rawWeekData.datapoints.map((dp) => dp.from),
	solar: weekParsed.map((d) => Number(d["solar-consumption"] ?? 0)),
	grid: weekParsed.map((d) => Number(d["grid-consumption"] ?? 0)),
	battery: weekParsed.map((d) => Number(d["battery-consumption"] ?? 0)),
	gap1: weekParsed.map((d) =>
		Number(d["solar-consumption"] ?? 0) > 0 ? 0.15 : 0,
	),
	gap2: weekParsed.map((d) =>
		Number(d["grid-consumption"] ?? 0) > 0 ? 0.15 : 0,
	),
};

export default function HomeUsageChart() {
	const ref = useRef<HTMLDivElement>(null);
	const chartRef = useRef<echarts.ECharts | null>(null);
	const { theme } = useChartTheme();
	const [activeIndex, setActiveIndex] = useState<number | null>(null);
	const [view, setView] = useState<View>("day");

	const data = view === "day" ? dayData : weekData;
	const legendIndex = activeIndex;

	const legendItems = [
		{
			label: "Solar",
			color: theme.secondary,
			valueText: `${round2(
				legendIndex == null
					? data.solar.reduce((sum, v) => sum + v, 0)
					: (data.solar[legendIndex] ?? 0),
			).toFixed(2)} kWh`,
		},
		{
			label: "Grid",
			color: theme.tertiary,
			valueText: `${round2(
				legendIndex == null
					? data.grid.reduce((sum, v) => sum + v, 0)
					: (data.grid[legendIndex] ?? 0),
			).toFixed(2)} kWh`,
		},
		{
			label: "Battery",
			color: theme.primary,
			valueText: `${round2(
				legendIndex == null
					? data.battery.reduce((sum, v) => sum + v, 0)
					: (data.battery[legendIndex] ?? 0),
			).toFixed(2)} kWh`,
		},
	];

	useEffect(() => {
		if (!ref.current) return;
		const chart = echarts.init(ref.current);
		chartRef.current = chart;
		const handleResize = () => chart.resize();
		window.addEventListener("resize", handleResize);
		chart.on("click", (params) => {
			const idx = params.dataIndex as number;
			setActiveIndex((prev) => (prev === idx ? null : idx));
		});
		return () => {
			window.removeEventListener("resize", handleResize);
			chart.dispose();
		};
	}, []);

	useEffect(() => {
		const opacity = (i: number) =>
			activeIndex === null || activeIndex === i ? 1 : 0.3;
		const shadow = (i: number) =>
			activeIndex === i
				? { shadowBlur: 16, shadowColor: "rgba(0,0,0,0.18)", shadowOffsetY: 0 }
				: {};

		const xAxisConfig =
			view === "day"
				? {
						type: "category" as const,
						data: data.times,
						axisTick: {
							show: true,
							alignWithLabel: true,
							length: 6,
							interval: (index: number) => index % 6 === 0,
						},
						axisLabel: {
							interval: (index: number) => index % 12 === 0,
							formatter: (v: string) => formatDailyTimeTick(v),
						},
					}
				: {
						type: "category" as const,
						data: data.times,
						axisTick: {
							show: true,
							alignWithLabel: true,
						},
						axisLabel: {
							formatter: (v: string) => formatWeekLabel(v),
						},
					};

		chartRef.current?.setOption(
			{
				tooltip: {
					trigger: "axis",
					axisPointer: {
						type: "shadow",
					},
					formatter: (params: unknown) => {
						const items = params as Array<{
							seriesName: string;
							value: number;
						}>;
						return items
							.map(
								(p) =>
									`${p.seriesName}: ${round2(Number(p.value)).toFixed(2)} kWh`,
							)
							.join("<br/>");
					},
				},
				grid: {
					show: true,
					top: 40,
					bottom: 40,
					left: 50,
					right: 20,
					borderColor: "transparent",
				},
				graphic: [
					{
						type: "line",
						shape: { x1: 50, y1: 40, x2: 50, y2: "100%" },
						style: { stroke: theme.referenceLine, lineWidth: 2 },
						z: 100,
					},
					{
						type: "line",
						shape: { x1: 50, y1: 40, x2: "100%", y2: 40 },
						style: { stroke: theme.referenceLine, lineWidth: 2 },
						z: 100,
					},
				],
				xAxis: xAxisConfig,
				yAxis: {
					type: "value",
					name: "kWh",
					splitLine: { lineStyle: { type: "dashed" } },
				},
				series: [
					{
						name: "Solar",
						type: "bar",
						stack: "usage",
						barMaxWidth: view === "day" ? 4 : 40,
						color: theme.secondary,
						data: data.solar.map((v, i) => ({
							value: v,
							itemStyle: {
								color: theme.secondary,
								opacity: opacity(i),
								...shadow(i),
							},
						})),
					},
					{
						name: "gap1",
						type: "bar",
						stack: "usage",
						barMaxWidth: view === "day" ? 4 : 40,
						data: data.gap1,
						itemStyle: { color: "transparent" },
						tooltip: { show: false },
						legendHoverLink: false,
					},
					{
						name: "Grid",
						type: "bar",
						stack: "usage",
						barMaxWidth: view === "day" ? 4 : 40,
						color: theme.tertiary,
						data: data.grid.map((v, i) => ({
							value: v,
							itemStyle: {
								color: theme.tertiary,
								borderRadius: data.battery[i] === 0 ? [6, 6, 0, 0] : 0,
								opacity: opacity(i),
								...shadow(i),
							},
						})),
						barCategoryGap: "10%",
					},
					{
						name: "gap2",
						type: "bar",
						stack: "usage",
						barMaxWidth: view === "day" ? 4 : 40,
						data: data.gap2,
						itemStyle: { color: "transparent" },
						tooltip: { show: false },
						legendHoverLink: false,
					},
					{
						name: "Battery",
						type: "bar",
						stack: "usage",
						barMaxWidth: view === "day" ? 4 : 40,
						color: theme.primary,
						data: data.battery.map((v, i) => ({
							value: v,
							itemStyle: {
								color: theme.primary,
								borderRadius: [6, 6, 0, 0],
								opacity: opacity(i),
								...shadow(i),
							},
						})),
					},
				],
			},
			true,
		);
	}, [theme, activeIndex, view, data]);

	return (
		<div className="w-full h-80 flex flex-col gap-2">
			<div className="flex justify-end gap-1">
				<button
					type="button"
					onClick={() => {
						setView("day");
						setActiveIndex(null);
					}}
					className={`px-3 py-1 text-sm rounded ${view === "day" ? "bg-gray-800 text-white" : "bg-gray-200 text-gray-700"}`}
				>
					Day
				</button>
				<button
					type="button"
					onClick={() => {
						setView("week");
						setActiveIndex(null);
					}}
					className={`px-3 py-1 text-sm rounded ${view === "week" ? "bg-gray-800 text-white" : "bg-gray-200 text-gray-700"}`}
				>
					Week
				</button>
			</div>
			<LegendValues items={legendItems} isInteractive={legendIndex != null} />
			<div ref={ref} className="w-full flex-1 min-h-0" />
		</div>
	);
}
