"use client";

import * as echarts from "echarts";
import { useEffect, useRef, useState } from "react";
import { useChartTheme } from "../../ChartThemeContext";
import rawData from "../../mockData/exportImportDay.json";

const parsed = rawData.datapoints.map((dp) => {
	const time = dp.from.slice(11, 16);
	const map: Record<string, number | string> = { time };
	for (const c of dp.constituentDatapoints) {
		map[c.type] = c.energy;
	}
	return map;
});

const times = parsed.map((d) => d.time);
const importData = parsed.map((d) => d["grid-import"] ?? 0);
const exportData = parsed.map((d) => d["grid-export"] ?? 0);

export default function ExportImportBarChart() {
	const ref = useRef<HTMLDivElement>(null);
	const chartRef = useRef<echarts.ECharts | null>(null);
	const { theme } = useChartTheme();
	const [activeIndex, setActiveIndex] = useState<number | null>(null);

	useEffect(() => {
		if (!ref.current) return;
		const chart = echarts.init(ref.current);
		chartRef.current = chart;
		const handleResize = () => chart.resize();
		window.addEventListener("resize", handleResize);
		chart.on("click", (params) => {
			const idx = params.dataIndex as number;
			setActiveIndex((prev) => (prev === idx ? null : idx));
		});
		return () => {
			window.removeEventListener("resize", handleResize);
			chart.dispose();
		};
	}, []);

	useEffect(() => {
		const opacity = (i: number) =>
			activeIndex === null || activeIndex === i ? 1 : 0.3;
		const shadow = (i: number) =>
			activeIndex === i
				? { shadowBlur: 16, shadowColor: "rgba(0,0,0,0.18)", shadowOffsetY: 0 }
				: {};

		chartRef.current?.setOption({
			tooltip: {
				trigger: "axis",
				axisPointer: {
					type: "shadow",
				},
			},
			legend: {
				data: ["Import", "Export"],
				top: 0,
				right: 0,
			},
			grid: { show: true, top: 40, bottom: 30, left: 50, right: 20 },
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
				name: "£",
				splitLine: { lineStyle: { type: "dashed" } },
			},
			series: [
				{
					name: "Import",
					type: "bar",
					stack: "ie",
					barMaxWidth: 6,
					data: importData.map((v, i) => ({
						value: v,
						itemStyle: {
							color: theme.primary,
							borderRadius: [0, 0, 6, 6],
							opacity: opacity(i),
							...shadow(i),
						},
					})),
				},
				{
					name: "Export",
					type: "bar",
					stack: "ie",
					barMaxWidth: 6,
					data: exportData.map((v, i) => ({
						value: v,
						itemStyle: {
							color: theme.secondary,
							borderRadius: [6, 6, 0, 0],
							opacity: opacity(i),
							...shadow(i),
						},
					})),
					barCategoryGap: "10%",
				},
			],
		});
	}, [theme, activeIndex]);

	return <div ref={ref} className="w-full h-80" />;
}
