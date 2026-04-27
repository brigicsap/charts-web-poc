"use client";

import * as echarts from "echarts";
import { useEffect, useRef, useState } from "react";
import { useChartTheme } from "../../ChartThemeContext";
import LegendValues from "../../chartjs/components/LegendValues";
import rawData from "../../mockData/exportImportDay.json";
import { formatDailyTimeTick, parseConstituentSeries, round2 } from "./utils";

const parsed = parseConstituentSeries(rawData.datapoints);

const times = parsed.map((d) => d.time);
const importData = parsed.map((d) => d["grid-import"] ?? 0);
const exportData = parsed.map((d) => d["grid-export"] ?? 0);

export default function ExportImportBarChart() {
	const ref = useRef<HTMLDivElement>(null);
	const chartRef = useRef<echarts.ECharts | null>(null);
	const { theme } = useChartTheme();
	const [activeIndex, setActiveIndex] = useState<number | null>(null);
	const [hoverIndex, setHoverIndex] = useState<number | null>(null);
	const legendIndex = activeIndex ?? hoverIndex;
	const importSeries = importData.map((v) => Number(v));
	const exportSeries = exportData.map((v) => Number(v));
	const legendItems = [
		{
			label: "Import",
			color: theme.primary,
			valueText: `£${round2(
				legendIndex == null
					? importSeries.reduce((sum, v) => sum + v, 0)
					: (importSeries[legendIndex] ?? 0),
			).toFixed(2)}`,
		},
		{
			label: "Export",
			color: theme.secondary,
			valueText: `£${round2(
				legendIndex == null
					? exportSeries.reduce((sum, v) => sum + v, 0)
					: (exportSeries[legendIndex] ?? 0),
			).toFixed(2)}`,
		},
	];

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
		chart.on("mouseover", (params) => {
			if (typeof params.dataIndex === "number") setHoverIndex(params.dataIndex);
		});
		chart.on("globalout", () => setHoverIndex(null));
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
				formatter: (params: unknown) => {
					const items = params as Array<{ seriesName: string; value: number }>;
					return items
						.map(
							(p) => `${p.seriesName}: £${round2(Number(p.value)).toFixed(2)}`,
						)
						.join("<br/>");
				},
			},
			grid: { show: true, top: 40, bottom: 30, left: 50, right: 20 },
			xAxis: {
				type: "category",
				data: times,
				axisLabel: {
					formatter: (v: string) => formatDailyTimeTick(v),
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
					color: theme.primary,
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
					color: theme.secondary,
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

	return (
		<div className="w-full h-80 flex flex-col gap-2">
			<LegendValues items={legendItems} isInteractive={legendIndex != null} />
			<div ref={ref} className="w-full flex-1 min-h-0" />
		</div>
	);
}
