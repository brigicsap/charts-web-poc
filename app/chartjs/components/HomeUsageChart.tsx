"use client";

import type { ChartData, ChartOptions, Plugin } from "chart.js";
import { useMemo, useState } from "react";
import { Bar } from "react-chartjs-2";
import { useChartTheme } from "../../ChartThemeContext";
import rawData from "../../mockData/homeUsageMockDay.json";
import LegendValues from "./LegendValues";
import {
	formatDailyTimeTick,
	parseConstituentSeries,
	round2,
	toRgba,
} from "./utils";
import "./chartSetup";

const parsed = parseConstituentSeries(rawData.datapoints);

const labels = parsed.map((d) => String(d.time));
const solarData = parsed.map((d) => Number(d["solar-consumption"] ?? 0));
const gridData = parsed.map((d) => Number(d["grid-consumption"] ?? 0));
const batteryData = parsed.map((d) => Number(d["battery-consumption"] ?? 0));

export default function HomeUsageChart() {
	const { theme } = useChartTheme();
	const [activeIndex, setActiveIndex] = useState<number | null>(null);
	const [hoverIndex, setHoverIndex] = useState<number | null>(null);
	const legendIndex = activeIndex ?? hoverIndex;

	const opacity = (i: number) =>
		activeIndex === null || activeIndex === i ? 1 : 0.3;

	const focusColumnPlugin = useMemo<Plugin<"bar">>(
		() => ({
			id: "focusColumnBackground",
			beforeDatasetsDraw(chart) {
				// Draw a subtle background band behind the selected stacked column.
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
		labels,
		datasets: [
			{
				label: "Solar",
				data: solarData,
				stack: "usage",
				barThickness: 4,
				backgroundColor: labels.map((_, i) =>
					toRgba(theme.secondary, opacity(i)),
				),
				borderRadius: 0,
			},
			{
				label: "Grid",
				data: gridData,
				stack: "usage",
				barThickness: 4,
				backgroundColor: labels.map((_, i) =>
					toRgba(theme.tertiary, opacity(i)),
				),
				borderRadius: 0,
			},
			{
				label: "Battery",
				data: batteryData,
				stack: "usage",
				barThickness: 4,
				backgroundColor: labels.map((_, i) =>
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
		onHover: (_, elements) => {
			setHoverIndex(elements.length ? elements[0].index : null);
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
				grid: { display: false },
				border: {
					display: true,
					color: theme.grid,
					width: 1,
				},
				ticks: {
					font: { size: 12 },
					callback: (_, index) => {
						const t = labels[index] ?? "";
						return formatDailyTimeTick(t);
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

	const solarOverall = round2(solarData.reduce((sum, v) => sum + v, 0));
	const gridOverall = round2(gridData.reduce((sum, v) => sum + v, 0));
	const batteryOverall = round2(batteryData.reduce((sum, v) => sum + v, 0));

	const legendItems = [
		{
			label: "Solar",
			color: theme.secondary,
			valueText: `${round2(legendIndex == null ? solarOverall : (solarData[legendIndex] ?? 0)).toFixed(2)} kWh`,
		},
		{
			label: "Grid",
			color: theme.tertiary,
			valueText: `${round2(legendIndex == null ? gridOverall : (gridData[legendIndex] ?? 0)).toFixed(2)} kWh`,
		},
		{
			label: "Battery",
			color: theme.primary,
			valueText: `${round2(legendIndex == null ? batteryOverall : (batteryData[legendIndex] ?? 0)).toFixed(2)} kWh`,
		},
	];

	return (
		<div className="w-full h-80 flex flex-col gap-2">
			<LegendValues items={legendItems} isInteractive={legendIndex != null} />
			<div className="flex-1 min-h-0">
				<Bar data={data} options={options} plugins={[focusColumnPlugin]} />
			</div>
		</div>
	);
}
