"use client";

import * as echarts from "echarts";
import { useEffect, useRef } from "react";
import { useChartTheme } from "../../ChartThemeContext";
import rawData from "../../mockData/homeUsageMockDay.json";

const parsed = rawData.datapoints.map((dp) => {
	const time = dp.from.slice(11, 16);
	const map: Record<string, number | string> = { time };
	for (const c of dp.constituentDatapoints) {
		map[c.type] = c.energy;
	}
	return map;
});

const times = parsed.map((d) => d.time);
const solarData = parsed.map((d) => d["solar-consumption"] ?? 0);
const gridData = parsed.map((d) => d["grid-consumption"] ?? 0);
const batteryData = parsed.map((d) => d["battery-consumption"] ?? 0);

// Small fixed gap value inserted between stack segments
const GAP = 0.005;
const gap1 = solarData.map((v) => (Number(v) > 0 ? GAP : 0));
const gap2 = gridData.map((v) => (Number(v) > 0 ? GAP : 0));

export default function HomeUsageChart() {
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
			tooltip: {
				trigger: "axis",
				axisPointer: {
					type: "shadow",
				},
			},
			legend: {
				data: ["Solar", "Grid", "Battery"],
				top: 0,
				right: 0,
			},
			grid: {
				show: true,
				top: 40,
				bottom: 30,
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
			xAxis: {
				type: "category",
				data: times,
				axisLabel: {
					formatter: (v: string) => {
						const h = parseInt(v.slice(0, 2));
						if (h === 0 && v === "00:00") return "12am";
						if (h === 6 && v === "06:00") return "6am";
						if (h === 12 && v === "12:00") return "12pm";
						if (h === 18 && v === "18:00") return "6pm";
						return "";
					},
				},
			},
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
					barMaxWidth: 4,
					data: solarData,
					itemStyle: { color: theme.secondary },
				},
				{
					name: "gap1",
					type: "bar",
					stack: "usage",
					barMaxWidth: 4,
					data: gap1,
					itemStyle: { color: "transparent" },
					tooltip: { show: false },
					legendHoverLink: false,
				},
				{
					name: "Grid",
					type: "bar",
					stack: "usage",
					barMaxWidth: 4,
					data: gridData,
					itemStyle: { color: theme.tertiary, borderRadius: [6, 6, 0, 0] },
					barCategoryGap: "10%",
				},
				{
					name: "gap2",
					type: "bar",
					stack: "usage",
					barMaxWidth: 4,
					data: gap2,
					itemStyle: { color: "transparent" },
					tooltip: { show: false },
					legendHoverLink: false,
				},
				{
					name: "Battery",
					type: "bar",
					stack: "usage",
					barMaxWidth: 4,
					data: batteryData,
					itemStyle: {
						color: theme.primary,
						borderRadius: [6, 6, 0, 0],
					},
				},
			],
		});
	}, [theme]);

	return <div ref={ref} className="w-full h-80" />;
}
