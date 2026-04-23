"use client";

import * as echarts from "echarts";
import { useEffect, useRef } from "react";
import { useChartTheme } from "../../ChartThemeContext";
import rawData from "../../mockData/savingsMock.json";

function toGBP(s: { units: number; nanos: number }) {
	return s.units + s.nanos / 1_000_000_000;
}

const data = rawData.intervalSavings.map((d) => {
	const date = new Date(d.start);
	const label = `${date.getDate()}/${date.getMonth() + 1}`;
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

	useEffect(() => {
		if (!ref.current) return;
		chartRef.current = echarts.init(ref.current);
		const handleResize = () => chartRef.current?.resize();
		window.addEventListener("resize", handleResize);
		return () => {
			window.removeEventListener("resize", handleResize);
			chartRef.current?.dispose();
		};
	}, []);

	useEffect(() => {
		chartRef.current?.setOption({
			tooltip: { trigger: "axis" },
			legend: { data: ["Not Optimised", "Used Strategy"], top: 0, right: 0 },
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

	return <div ref={ref} className="w-full h-80" />;
}
