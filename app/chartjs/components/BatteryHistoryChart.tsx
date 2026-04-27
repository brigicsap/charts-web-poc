"use client";

import type { ChartData, ChartOptions, Plugin } from "chart.js";
import { useMemo, useState } from "react";
import { Line } from "react-chartjs-2";
import { useChartTheme } from "../../ChartThemeContext";
import rawData from "../../mockData/batteryHistoryMockDay.json";
import LegendValues from "./LegendValues";
import {
	buildQuarterHourSlots,
	formatDailyTimeTick,
	round2,
	toRgba,
} from "./utils";
import "./chartSetup";

// Preprocess raw data into a format suitable for charting.
const dataMap = new Map(
	rawData.datapoints.map((dp) => [
		dp.timestamp.slice(11, 16),
		dp.batteryPercentage,
	]),
);
// Generate all 96 15-min slots for full 24h x axis, filling in battery values where available.
const labels = buildQuarterHourSlots();
// Map labels to battery values, using null for missing data.
const batteryData = labels.map((time) => {
	const val = dataMap.get(time);
	return val == null ? null : Number(val);
});

export default function BatteryHistoryChart() {
	const { theme } = useChartTheme();
	const [activeIndex, setActiveIndex] = useState<number | null>(null);

	const refAreaPlugin = useMemo<Plugin<"line">>(
		() => ({
			id: "batteryNoDataArea",
			// Shade the known no-data window between 05:00 and 07:00.
			beforeDatasetsDraw(chart) {
				const xScale = chart.scales.x;
				const { top, bottom } = chart.chartArea;
				const x1 = xScale.getPixelForValue(labels.indexOf("05:00"));
				const x2 = xScale.getPixelForValue(labels.indexOf("07:00"));
				const ctx = chart.ctx;
				ctx.save();
				ctx.fillStyle = toRgba(theme.referenceArea, 0.5);
				ctx.fillRect(x1, top, x2 - x1, bottom - top);
				ctx.restore();
			},
			// Add a vertical dashed line cursor on hover.
			afterDatasetsDraw(chart) {
				const tooltip = chart.tooltip;
				if (!tooltip?.getActiveElements().length) return;
				const x = tooltip.getActiveElements()[0].element.x;
				const { top, bottom } = chart.chartArea;
				const ctx = chart.ctx;
				ctx.save();
				ctx.setLineDash([4, 4]);
				ctx.strokeStyle = theme.cursorStroke;
				ctx.lineWidth = 1;
				ctx.beginPath();
				ctx.moveTo(x, top);
				ctx.lineTo(x, bottom);
				ctx.stroke();
				ctx.restore();
			},
		}),
		[theme.referenceArea, theme.cursorStroke],
	);

	const data: ChartData<"line"> = {
		labels,
		datasets: [
			{
				label: "Battery",
				data: batteryData,
				borderColor: theme.primary,
				pointRadius: 0,
				pointHoverRadius: 6,
				pointHoverBackgroundColor: theme.activeDotFill,
				pointHoverBorderColor: theme.activeDotStroke,
				pointHoverBorderWidth: 3,
				tension: 0.25,
				spanGaps: false,
			},
		],
	};

	const options: ChartOptions<"line"> = {
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
						`${ctx.dataset.label}: ${round2(Number(ctx.parsed.y ?? 0)).toFixed(2)}%`,
				},
			},
		},
		scales: {
			x: {
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
						const t = labels[index] ?? "";
						return formatDailyTimeTick(t);
					},
				},
			},
			y: {
				min: 0,
				max: 100,
				ticks: { stepSize: 25 },
				title: { display: true, text: "%", align: "end" },
				grid: { color: toRgba(theme.grid, 1) },
				border: {
					display: true,
					color: theme.grid,
					width: 1,
				},
			},
		},
	};

	const nonNullBattery = batteryData.filter((v): v is number => v != null);
	const overallBattery =
		nonNullBattery.length > 0
			? round2(
					nonNullBattery.reduce((sum, v) => sum + v, 0) / nonNullBattery.length,
				)
			: 0;

	const interactiveBattery =
		activeIndex == null ? null : (batteryData[activeIndex] as number | null);

	const legendItems = [
		{
			label: "Battery",
			color: theme.primary,
			valueText:
				interactiveBattery == null
					? `${overallBattery.toFixed(2)}%`
					: `${round2(interactiveBattery).toFixed(2)}%`,
		},
	];

	return (
		<div className="w-full h-80 flex flex-col gap-2">
			<LegendValues items={legendItems} isInteractive={activeIndex != null} />
			<div className="flex-1 min-h-0">
				<Line data={data} options={options} plugins={[refAreaPlugin]} />
			</div>
		</div>
	);
}
