"use client";

import * as echarts from "echarts";
import { useEffect, useRef } from "react";
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
					data: importData,
					barMaxWidth: 6,
					itemStyle: { color: theme.primary, borderRadius: [0, 0, 6, 6] },
				},
				{
					name: "Export",
					type: "bar",
					stack: "ie",
					data: exportData,
					barMaxWidth: 6,
					itemStyle: {
						color: theme.secondary,
						borderRadius: [6, 6, 0, 0],
					},
					barCategoryGap: "10%",
				},
			],
		});
	}, [theme]);

	return <div ref={ref} className="w-full h-80" />;
}
