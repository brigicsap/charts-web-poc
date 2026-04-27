"use client";

import * as echarts from "echarts";
import { useEffect, useRef, useState } from "react";
import { useChartTheme } from "../../ChartThemeContext";
import LegendValues from "../../chartjs/components/LegendValues";
import rawData from "../../mockData/homeUsageMockDay.json";
import { formatDailyTimeTick, parseConstituentSeries, round2 } from "./utils";

const parsed = parseConstituentSeries(rawData.datapoints);

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
	const [activeIndex, setActiveIndex] = useState<number | null>(null);
	const [hoverIndex, setHoverIndex] = useState<number | null>(null);
	const legendIndex = activeIndex ?? hoverIndex;
	const solarSeries = solarData.map((v) => Number(v));
	const gridSeries = gridData.map((v) => Number(v));
	const batterySeries = batteryData.map((v) => Number(v));
	const legendItems = [
		{
			label: "Solar",
			color: theme.secondary,
			valueText: `${round2(
				legendIndex == null
					? solarSeries.reduce((sum, v) => sum + v, 0)
					: (solarSeries[legendIndex] ?? 0),
			).toFixed(2)} kWh`,
		},
		{
			label: "Grid",
			color: theme.tertiary,
			valueText: `${round2(
				legendIndex == null
					? gridSeries.reduce((sum, v) => sum + v, 0)
					: (gridSeries[legendIndex] ?? 0),
			).toFixed(2)} kWh`,
		},
		{
			label: "Battery",
			color: theme.primary,
			valueText: `${round2(
				legendIndex == null
					? batterySeries.reduce((sum, v) => sum + v, 0)
					: (batterySeries[legendIndex] ?? 0),
			).toFixed(2)} kWh`,
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
							(p) =>
								`${p.seriesName}: ${round2(Number(p.value)).toFixed(2)} kWh`,
						)
						.join("<br/>");
				},
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
					formatter: (v: string) => formatDailyTimeTick(v),
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
					color: theme.secondary,
					data: solarData.map((v, i) => ({
						value: v,
						itemStyle: {
							color: theme.secondary,
							opacity: opacity(i),
							...shadow(i),
						},
					})),
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
					color: theme.tertiary,
					data: gridData.map((v, i) => ({
						value: v,
						itemStyle: {
							color: theme.tertiary,
							borderRadius: [6, 6, 0, 0],
							opacity: opacity(i),
							...shadow(i),
						},
					})),
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
					color: theme.primary,
					data: batteryData.map((v, i) => ({
						value: v,
						itemStyle: {
							color: theme.primary,
							borderRadius: [6, 6, 0, 0],
							opacity: opacity(i),
							...shadow(i),
						},
					})),
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
