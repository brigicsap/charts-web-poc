"use client";

import type { ChartData, ChartOptions, Plugin } from "chart.js";
import { useMemo, useState } from "react";
import { Line } from "react-chartjs-2";
import { useChartTheme } from "../../ChartThemeContext";
import LegendValues from "./LegendValues";
import { round2, toRgba } from "./utils";
import "./chartSetup";

const rows = [
	{ year: 1, throughput: 1.1, warranty: 15 },
	{ year: 2, throughput: 2.4, warranty: 14.5 },
	{ year: 3, throughput: 3.8, warranty: 14.0 },
	{ year: 4, throughput: 5.1, warranty: 13.5 },
	{ year: 5, throughput: 6.3, warranty: 13.0 },
	{ year: 6, throughput: 7.6, warranty: 12.5 },
	{ year: 7, throughput: 8.9, warranty: 12.0 },
	{ year: 8, throughput: 10.1, warranty: 11.5 },
	{ year: 9, throughput: 11.4, warranty: 11.0 },
	{ year: 10, throughput: 12.0, warranty: 10.5 },
];

export default function ThroughputWarrantyLimit() {
	const { theme } = useChartTheme();
	const labels = rows.map((d) => String(d.year));
	const [activeIndex, setActiveIndex] = useState<number | null>(null);

	const referencePlugin = useMemo<Plugin<"line">>(
		() => ({
			id: "throughputReferences",
			afterDatasetsDraw(chart) {
				// Draw vertical and horizontal guide lines for limit/now reference points.
				const x = chart.scales.x;
				const yLeft = chart.scales.yLeft;
				if (!x || !yLeft) return;
				const { left, right } = chart.chartArea;
				const ctx = chart.ctx;
				const xLimit = x.getPixelForValue(9);
				const xNow = x.getPixelForValue(2);
				const y13 = yLeft.getPixelForValue(13);
				const y9 = yLeft.getPixelForValue(9);
				const yTop = yLeft.getPixelForValue(15);
				const yBottom = yLeft.getPixelForValue(0);

				ctx.save();
				ctx.setLineDash([4, 4]);

				ctx.strokeStyle = theme.referenceLineAlert;
				ctx.beginPath();
				ctx.moveTo(xLimit, yBottom);
				ctx.lineTo(xLimit, yTop);
				ctx.stroke();

				ctx.beginPath();
				ctx.moveTo(left, y13);
				ctx.lineTo(right, y13);
				ctx.stroke();

				ctx.strokeStyle = theme.referenceLine;
				ctx.beginPath();
				ctx.moveTo(left, y9);
				ctx.lineTo(right, y9);
				ctx.stroke();

				ctx.strokeStyle = theme.referenceLineLight;
				ctx.beginPath();
				ctx.moveTo(xNow, yBottom);
				ctx.lineTo(xNow, yTop);
				ctx.stroke();

				ctx.setLineDash([]);
				ctx.font = "12px sans-serif";
				ctx.textAlign = "center";
				ctx.fillStyle = theme.referenceLineAlert;
				ctx.fillText("Limit hit", xLimit, yTop - 8);
				ctx.fillStyle = theme.referenceLineLight;
				ctx.fillText("Now", xNow, yTop - 8);
				ctx.restore();
			},
		}),
		[theme],
	);

	const data: ChartData<"line"> = {
		labels,
		datasets: [
			{
				label: "Throughput",
				data: rows.map((d) => d.throughput),
				yAxisID: "yLeft",
				borderColor: theme.primary,
				backgroundColor: toRgba(theme.areaFill, 0.15),
				fill: true,
				tension: 0.25,
				pointRadius: 0,
				borderWidth: 3,
			},
			{
				label: "Warranty",
				data: rows.map((d) => d.warranty),
				yAxisID: "yLeft",
				borderColor: theme.warrantyStroke,
				fill: false,
				tension: 0.25,
				pointRadius: 0,
				borderWidth: 2,
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
			legend: { display: false },
			tooltip: {
				mode: "index",
				intersect: false,
				callbacks: {
					label: (ctx) =>
						`${ctx.dataset.label}: ${round2(Number(ctx.parsed.y ?? 0)).toFixed(2)} MWh`,
				},
			},
		},
		scales: {
			x: {
				ticks: {
					maxRotation: 0,
					callback: (_, index) => {
						const v = Number(labels[index] ?? "0");
						if (v === 1 || v === 2 || v === 10) return `Yr ${v}`;
						return "";
					},
				},
				border: {
					display: true,
					color: theme.grid,
					width: 1,
				},
				grid: { drawOnChartArea: false },
			},
			yLeft: {
				type: "linear",
				position: "left",
				min: 0,
				max: 15,
				ticks: {
					stepSize: 3,
					callback: (value) => {
						const n = Number(value);
						if (n === 0 || n === 12 || n === 15) return `${n} MWh`;
						return "";
					},
				},
				border: {
					display: true,
					color: theme.grid,
					width: 1,
				},
				grid: { color: toRgba(theme.grid, 1) },
			},
			yRight: {
				type: "linear",
				position: "right",
				min: 0,
				max: 100,
				ticks: {
					font: { size: 12 },
					callback: (value) => `${value}%`,
				},
				border: {
					display: true,
					color: theme.grid,
					width: 1,
				},
				grid: { drawOnChartArea: false },
			},
		},
	};

	const throughputOverall = round2(
		rows.reduce((sum, row) => sum + row.throughput, 0) / rows.length,
	);
	const warrantyOverall = round2(
		rows.reduce((sum, row) => sum + row.warranty, 0) / rows.length,
	);

	const legendItems = [
		{
			label: "Throughput",
			color: theme.primary,
			valueText: `${round2(activeIndex == null ? throughputOverall : (rows[activeIndex]?.throughput ?? throughputOverall)).toFixed(2)} MWh`,
		},
		{
			label: "Warranty",
			color: theme.warrantyStroke,
			valueText: `${round2(activeIndex == null ? warrantyOverall : (rows[activeIndex]?.warranty ?? warrantyOverall)).toFixed(2)} MWh`,
		},
	];

	return (
		<div className="w-full h-80 flex flex-col gap-2">
			<LegendValues items={legendItems} isInteractive={activeIndex != null} />
			<div className="flex-1 min-h-0">
				<Line data={data} options={options} plugins={[referencePlugin]} />
			</div>
		</div>
	);
}
