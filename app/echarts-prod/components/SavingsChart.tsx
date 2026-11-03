"use client";

import rawData from "../../mockData/savingsMock.json";
import Chart from "./Chart";
import {
	baseOption,
	categoryAxes,
	useChartPalette,
	valueAxis,
} from "./chartOptions";
import LegendValues from "./LegendValues";
import { toGBP } from "./utils";

const data = rawData.intervalSavings.map((point) => ({
	label: new Intl.DateTimeFormat("en-GB", {
		day: "numeric",
		month: "short",
	}).format(new Date(point.start)),
	notOptimised: toGBP(point.notOptimisedStrategySavings),
	used: toGBP(point.usedStrategySavings),
}));

export default function SavingsChart() {
	const palette = useChartPalette();
	const series = [
		{
			name: "Not Optimised",
			color: palette.battery,
			data: data.map((point) => point.notOptimised),
		},
		{
			name: "Used Strategy",
			color: palette.grid,
			data: data.map((point) => point.used),
		},
	];
	return (
		<div className="w-full min-w-0 space-y-3">
			<LegendValues
				items={series.map((item) => ({
					label: item.name,
					color: item.color,
					valueText: new Intl.NumberFormat("en-GB", {
						style: "currency",
						currency: "GBP",
					}).format(item.data.reduce((sum, value) => sum + value, 0)),
				}))}
			/>
			<Chart
				option={{
					...baseOption(palette),
					tooltip: { show: false },
					xAxis: categoryAxes(
						data.map((point) => point.label),
						palette,
					),
					yAxis: valueAxis(palette, "£"),
					series: series.map((item) => ({
						name: item.name,
						type: "line",
						data: item.data,
						smooth: true,
						silent: true,
						symbol: "none",
						emphasis: { disabled: true },
						lineStyle: { color: item.color, width: 2 },
						itemStyle: { color: item.color },
						areaStyle: { color: item.color, opacity: 0.2 },
					})),
				}}
			/>
		</div>
	);
}
