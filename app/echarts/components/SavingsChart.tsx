"use client";

import * as echarts from "echarts";
import { useEffect, useRef, useState } from "react";
import { useChartTheme } from "../../ChartThemeContext";
import LegendValues from "../../chartjs/components/LegendValues";
import rawData from "../../mockData/savingsMock.json";
import { round2, toGBP } from "./utils";

const data = rawData.intervalSavings.map((d) => {
	const date = new Date(d.start);
	const label = `${date.getDate()} ${date.toLocaleDateString("en-GB", { month: "short" })}`;
	return {
		label,
		notOptimised: Math.round(toGBP(d.notOptimisedStrategySavings) * 100) / 100,
		used: Math.round(toGBP(d.usedStrategySavings) * 100) / 100,
	};
});

const labels = data.map((d) => d.label);
const notOptimisedData = data.map((d) => d.notOptimised);
const usedData = data.map((d) => d.used);

export default function SavingsChart() {
	const ref = useRef<HTMLDivElement>(null);
	const chartRef = useRef<echarts.ECharts | null>(null);
	const { theme } = useChartTheme();
	const [activeIndex, setActiveIndex] = useState<number | null>(null);
	const legendItems = [
		{
			label: "Not Optimised",
			color: theme.primary,
			valueText: `£${round2(
				activeIndex == null
					? notOptimisedData.reduce((sum, v) => sum + v, 0)
					: (notOptimisedData[activeIndex] ?? 0),
			).toFixed(2)}`,
		},
		{
			label: "Used Strategy",
			color: theme.tertiary,
			valueText: `£${round2(
				activeIndex == null
					? usedData.reduce((sum, v) => sum + v, 0)
					: (usedData[activeIndex] ?? 0),
			).toFixed(2)}`,
		},
	];

	useEffect(() => {
		if (!ref.current) return;
		chartRef.current = echarts.init(ref.current);
		const handleResize = () => chartRef.current?.resize();
		window.addEventListener("resize", handleResize);
		chartRef.current.on("click", (params) => {
			if (typeof params.dataIndex === "number") {
				const idx = params.dataIndex;
				setActiveIndex((prev) => (prev === idx ? null : idx));
			}
		});
		return () => {
			window.removeEventListener("resize", handleResize);
			chartRef.current?.dispose();
		};
	}, []);

	useEffect(() => {
		chartRef.current?.setOption({
			tooltip: {
				trigger: "axis",
				formatter: (params: unknown) => {
					const items = params as Array<{ seriesName: string; value: number }>;
					return items
						.map(
							(p) => `${p.seriesName}: £${round2(Number(p.value)).toFixed(2)}`,
						)
						.join("<br/>");
				},
			},
			grid: { top: 40, bottom: 30, left: 60, right: 20 },
			xAxis: {
				type: "category",
				data: labels,
				boundaryGap: false,
			},
			yAxis: {
				type: "value",
				axisLabel: { formatter: (v: number) => `£${v}` },
				splitLine: { lineStyle: { type: "dashed" } },
			},
			series: [
				{
					name: "Not Optimised",
					type: "line",
					data: notOptimisedData,
					smooth: true,
					symbol: "none",
					lineStyle: { color: theme.primary, width: 2 },
					itemStyle: { color: theme.primary },
					areaStyle: { color: theme.primary },
				},
				{
					name: "Used Strategy",
					type: "line",
					data: usedData,
					smooth: true,
					symbol: "none",
					lineStyle: { color: theme.tertiary, width: 2 },
					itemStyle: { color: theme.tertiary },
					areaStyle: { color: theme.tertiary },
				},
			],
		});
	}, [theme]);

	return (
		<div className="w-full h-80 flex flex-col gap-2">
			<LegendValues items={legendItems} isInteractive={activeIndex != null} />
			<div ref={ref} className="w-full flex-1 min-h-0" />
		</div>
	);
}
