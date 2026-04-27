"use client";

import type { ChartData, ChartOptions } from "chart.js";
import { useState } from "react";
import { Line } from "react-chartjs-2";
import { useChartTheme } from "../../ChartThemeContext";
import rawData from "../../mockData/savingsMock.json";
import LegendValues from "./LegendValues";
import { round2, toGBP, toRgba } from "./utils";
import "./chartSetup";

const rows = rawData.intervalSavings.map((d) => {
	// Convert API money fields (units + nanos) into chart-ready GBP values.
	const date = new Date(d.start);
	const label = `${date.getDate()}/${date.getMonth() + 1}`;
	return {
		time: label,
		notOptimised: Math.round(toGBP(d.notOptimisedStrategySavings) * 100) / 100,
		used: Math.round(toGBP(d.usedStrategySavings) * 100) / 100,
	};
});

export default function SavingsChart() {
	const { theme } = useChartTheme();
	const [hoverIndex, setHoverIndex] = useState<number | null>(null);

	const data: ChartData<"line"> = {
		labels: rows.map((r) => r.time),
		datasets: [
			{
				label: "Not Optimised",
				data: rows.map((r) => r.notOptimised),
				borderColor: theme.primary,
				backgroundColor: toRgba(theme.primary, 0.7),
				fill: true,
				pointRadius: 0,
				tension: 0.25,
				borderWidth: 0,
			},
			{
				label: "Used Strategy",
				data: rows.map((r) => r.used),
				borderColor: theme.tertiary,
				backgroundColor: toRgba(theme.tertiary, 0.9),
				fill: true,
				pointRadius: 0,
				tension: 0.25,
				borderWidth: 0,
			},
		],
	};

	const options: ChartOptions<"line"> = {
		maintainAspectRatio: false,
		layout: {
			padding: { top: 30, right: 0, bottom: 0, left: 0 },
		},
		onHover: (_, elements) => {
			setHoverIndex(elements.length ? elements[0].index : null);
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
				grid: { display: false },
				border: {
					display: true,
					color: theme.grid,
					width: 1,
				},
				ticks: { font: { size: 12 } },
			},
			y: {
				border: {
					display: true,
					color: theme.grid,
					width: 1,
				},
				ticks: {
					font: { size: 10 },
					callback: (value) => `£${value}`,
				},
				grid: { color: toRgba(theme.grid, 1) },
			},
		},
	};

	const notOptimisedValues = rows.map((r) => r.notOptimised);
	const usedValues = rows.map((r) => r.used);
	const notOptimisedOverall = round2(
		notOptimisedValues.reduce((sum, v) => sum + v, 0),
	);
	const usedOverall = round2(usedValues.reduce((sum, v) => sum + v, 0));

	const legendItems = [
		{
			label: "Not Optimised",
			color: theme.primary,
			valueText: `£${round2(hoverIndex == null ? notOptimisedOverall : (notOptimisedValues[hoverIndex] ?? 0)).toFixed(2)}`,
		},
		{
			label: "Used Strategy",
			color: theme.tertiary,
			valueText: `£${round2(hoverIndex == null ? usedOverall : (usedValues[hoverIndex] ?? 0)).toFixed(2)}`,
		},
	];

	return (
		<div className="w-full h-80 flex flex-col gap-2">
			<LegendValues items={legendItems} isInteractive={hoverIndex != null} />
			<div className="flex-1 min-h-0">
				<Line data={data} options={options} />
			</div>
		</div>
	);
}
