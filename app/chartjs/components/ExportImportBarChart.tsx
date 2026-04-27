"use client";

import type { ChartData, ChartOptions, Plugin } from "chart.js";
import { useMemo, useState } from "react";
import { Bar } from "react-chartjs-2";
import { useChartTheme } from "../../ChartThemeContext";
import rawData from "../../mockData/exportImportDay.json";
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
const importData = parsed.map((d) => Number(d["grid-import"] ?? 0));
const exportData = parsed.map((d) => Number(d["grid-export"] ?? 0));

export default function ExportImportBarChart() {
	const { theme } = useChartTheme();
	const [activeIndex, setActiveIndex] = useState<number | null>(null);
	const [hoverIndex, setHoverIndex] = useState<number | null>(null);
	const legendIndex = activeIndex ?? hoverIndex;

	const opacity = (i: number) =>
		activeIndex === null || activeIndex === i ? 1 : 0.3;

	const focusColumnPlugin = useMemo<Plugin<"bar">>(
		() => ({
			id: "focusColumnBackgroundExportImport",
			beforeDatasetsDraw(chart) {
				// Highlight the active time slot and keep the zero baseline visible.
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

				const yScale = chart.scales.y;
				const y0 = yScale.getPixelForValue(0);
				ctx.strokeStyle = theme.referenceLine;
				ctx.lineWidth = 1;
				ctx.beginPath();
				ctx.moveTo(chart.chartArea.left, y0);
				ctx.lineTo(chart.chartArea.right, y0);
				ctx.stroke();
				ctx.restore();
			},
		}),
		[activeIndex, theme.referenceLine],
	);

	const data: ChartData<"bar"> = {
		labels,
		datasets: [
			{
				label: "Import",
				data: importData,
				stack: "ie",
				barThickness: 6,
				backgroundColor: labels.map((_, i) =>
					toRgba(theme.primary, opacity(i)),
				),
				borderRadius: 0,
			},
			{
				label: "Export",
				data: exportData,
				stack: "ie",
				barThickness: 6,
				backgroundColor: labels.map((_, i) =>
					toRgba(theme.secondary, opacity(i)),
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
						`${ctx.dataset.label}: £${round2(Number(ctx.parsed.y ?? 0)).toFixed(2)}`,
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
				title: { display: true, text: "£", align: "end" },
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

	const importOverall = round2(importData.reduce((sum, v) => sum + v, 0));
	const exportOverall = round2(exportData.reduce((sum, v) => sum + v, 0));

	const legendItems = [
		{
			label: "Import",
			color: theme.primary,
			valueText: `£${round2(legendIndex == null ? importOverall : (importData[legendIndex] ?? 0)).toFixed(2)}`,
		},
		{
			label: "Export",
			color: theme.secondary,
			valueText: `£${round2(legendIndex == null ? exportOverall : (exportData[legendIndex] ?? 0)).toFixed(2)}`,
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
