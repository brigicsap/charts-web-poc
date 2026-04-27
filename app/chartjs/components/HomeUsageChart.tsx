"use client";

import type { ChartData, ChartOptions, Plugin } from "chart.js";
import { useMemo, useState } from "react";
import { Bar } from "react-chartjs-2";
import { useChartTheme } from "../../ChartThemeContext";
import rawDayData from "../../mockData/homeUsageMockDay.json";
import rawWeekData from "../../mockData/homeUsageMockWeek.json";
import LegendValues from "./LegendValues";
import {
	formatDailyTimeTick,
	parseConstituentSeries,
	round2,
	toRgba,
} from "./utils";
import "./chartSetup";

type View = "day" | "week";

function parseData(raw: { datapoints: typeof rawDayData.datapoints }) {
	const parsed = parseConstituentSeries(raw.datapoints);
	const labels = parsed.map((d) => String(d.time));
	const solar = parsed.map((d) => Number(d["solar-consumption"] ?? 0));
	const grid = parsed.map((d) => Number(d["grid-consumption"] ?? 0));
	const battery = parsed.map((d) => Number(d["battery-consumption"] ?? 0));
	return { labels, solar, grid, battery };
}

function formatWeekLabel(time: string): string {
	const date = new Date(time);
	return date.toLocaleDateString("en-GB", { weekday: "short" });
}

const dayData = parseData(rawDayData);
// Append end-of-day marker for full 24hr axis
dayData.labels.push("24:00");
dayData.solar.push(0);
dayData.grid.push(0);
dayData.battery.push(0);
const weekParsed = parseConstituentSeries(rawWeekData.datapoints);
const weekData = {
	labels: rawWeekData.datapoints.map((dp) => dp.from),
	solar: weekParsed.map((d) => Number(d["solar-consumption"] ?? 0)),
	grid: weekParsed.map((d) => Number(d["grid-consumption"] ?? 0)),
	battery: weekParsed.map((d) => Number(d["battery-consumption"] ?? 0)),
};

export default function HomeUsageChart() {
	const { theme } = useChartTheme();
	const [activeIndex, setActiveIndex] = useState<number | null>(null);
	const [view, setView] = useState<View>("day");
	const d = view === "day" ? dayData : weekData;
	const legendIndex = activeIndex;

	const opacity = (i: number) =>
		activeIndex === null || activeIndex === i ? 1 : 0.3;

	const focusColumnPlugin = useMemo<Plugin<"bar">>(
		() => ({
			id: "focusColumnBackground",
			beforeDatasetsDraw(chart) {
				if (activeIndex == null) return;
				const meta = chart.getDatasetMeta(0);
				const el = meta.data[activeIndex] as unknown as {
					x: number;
					width: number;
				};
				if (!el) return;
				const { top, bottom } = chart.chartArea;
				const x = el.x;
				const width = el.width + 8;
				const ctx = chart.ctx;
				ctx.save();
				ctx.fillStyle = "rgba(0,0,0,0.07)";
				ctx.fillRect(x - width / 2, top, width, bottom - top);
				ctx.restore();
			},
		}),
		[activeIndex],
	);

	const data: ChartData<"bar"> = {
		labels: d.labels,
		datasets: [
			{
				label: "Solar",
				data: d.solar,
				stack: "usage",
				barThickness: view === "day" ? 4 : 40,
				backgroundColor: d.labels.map((_, i) =>
					toRgba(theme.secondary, opacity(i)),
				),
				borderRadius: 0,
				borderWidth: { top: 2 },
				borderColor: "rgba(255,255,255,1)",
				borderSkipped: false,
			},
			{
				label: "Grid",
				data: d.grid,
				stack: "usage",
				barThickness: view === "day" ? 4 : 40,
				backgroundColor: d.labels.map((_, i) =>
					toRgba(theme.tertiary, opacity(i)),
				),
				borderRadius: d.battery.map((v) =>
					v === 0 ? { topLeft: 6, topRight: 6 } : 0,
				) as unknown as number,
				borderWidth: { top: 2 },
				borderColor: "rgba(255,255,255,1)",
				borderSkipped: false,
			},
			{
				label: "Battery",
				data: d.battery,
				stack: "usage",
				barThickness: view === "day" ? 4 : 40,
				backgroundColor: d.labels.map((_, i) =>
					toRgba(theme.primary, opacity(i)),
				),
				borderRadius: { topLeft: 6, topRight: 6 },
			},
		],
	};

	const options: ChartOptions<"bar"> = {
		maintainAspectRatio: false,
		layout: {
			padding: { top: 30, right: 0, bottom: 0, left: 0 },
		},
		onClick: (_, elements) => {
			if (!elements.length) return;
			const idx = elements[0].index;
			setActiveIndex((prev) => (prev === idx ? null : idx));
		},
		interaction: {
			mode: "index",
			intersect: false,
		},
		plugins: {
			legend: {
				display: false,
			},
			tooltip: {
				mode: "index",
				intersect: false,
				callbacks: {
					label: (ctx) =>
						`${ctx.dataset.label}: ${round2(Number(ctx.parsed.y ?? 0)).toFixed(2)} kWh`,
				},
			},
		},
		scales: {
			x: {
				stacked: true,
				grid: { drawOnChartArea: false },
				border: {
					display: true,
					color: theme.grid,
					width: 1,
				},
				ticks: {
					maxRotation: 0,
					font: { size: 12 },
					callback: (_, index) => {
						const t = d.labels[index] ?? "";
						return view === "day" ? formatDailyTimeTick(t) : formatWeekLabel(t);
					},
				},
			},
			y: {
				stacked: true,
				title: { display: true, text: "kWh", align: "end" },
				grid: { color: toRgba(theme.grid, 1) },
				border: {
					display: true,
					color: theme.grid,
					width: 1,
				},
				ticks: { font: { size: 10 } },
			},
		},
	};

	const legendItems = [
		{
			label: "Solar",
			color: theme.secondary,
			valueText: `${round2(legendIndex == null ? d.solar.reduce((sum, v) => sum + v, 0) : (d.solar[legendIndex] ?? 0)).toFixed(2)} kWh`,
		},
		{
			label: "Grid",
			color: theme.tertiary,
			valueText: `${round2(legendIndex == null ? d.grid.reduce((sum, v) => sum + v, 0) : (d.grid[legendIndex] ?? 0)).toFixed(2)} kWh`,
		},
		{
			label: "Battery",
			color: theme.primary,
			valueText: `${round2(legendIndex == null ? d.battery.reduce((sum, v) => sum + v, 0) : (d.battery[legendIndex] ?? 0)).toFixed(2)} kWh`,
		},
	];

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
			<div className="flex-1 min-h-0">
				<Bar data={data} options={options} plugins={[focusColumnPlugin]} />
			</div>
		</div>
	);
}
