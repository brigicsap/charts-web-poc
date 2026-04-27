"use client";

import * as echarts from "echarts";
import { useEffect, useRef, useState } from "react";
import { useChartTheme } from "../../ChartThemeContext";
import LegendValues from "../../chartjs/components/LegendValues";
import { round2 } from "./utils";

const data = [
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

const years = data.map((d) => d.year);
const throughputData = data.map((d) => d.throughput);
const warrantyData = data.map((d) => d.warranty);

export default function ThroughputWarrantyLimit() {
	const ref = useRef<HTMLDivElement>(null);
	const chartRef = useRef<echarts.ECharts | null>(null);
	const { theme } = useChartTheme();
	const [hoverIndex, setHoverIndex] = useState<number | null>(null);
	const throughputAvg = round2(
		throughputData.reduce((sum, v) => sum + v, 0) / throughputData.length,
	);
	const warrantyAvg = round2(
		warrantyData.reduce((sum, v) => sum + v, 0) / warrantyData.length,
	);
	const legendItems = [
		{
			label: "Throughput",
			color: theme.primary,
			valueText: `${round2(
				hoverIndex == null
					? throughputAvg
					: (throughputData[hoverIndex] ?? throughputAvg),
			).toFixed(2)} MWh`,
		},
		{
			label: "Warranty",
			color: theme.warrantyStroke,
			valueText: `${round2(
				hoverIndex == null
					? warrantyAvg
					: (warrantyData[hoverIndex] ?? warrantyAvg),
			).toFixed(2)} MWh`,
		},
	];

	useEffect(() => {
		if (!ref.current) return;
		chartRef.current = echarts.init(ref.current);
		const handleResize = () => chartRef.current?.resize();
		window.addEventListener("resize", handleResize);
		chartRef.current.on("mouseover", (params) => {
			if (typeof params.dataIndex === "number") setHoverIndex(params.dataIndex);
		});
		chartRef.current.on("globalout", () => setHoverIndex(null));
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
							(p) =>
								`${p.seriesName}: ${round2(Number(p.value)).toFixed(2)} MWh`,
						)
						.join("<br/>");
				},
			},
			grid: { top: 40, bottom: 30, left: 60, right: 60 },
			xAxis: {
				type: "category",
				data: years,
				axisLabel: {
					formatter: (v: string) => {
						if (v === "1" || v === "2" || v === "10") return `Yr${v}`;
						return "";
					},
				},
			},
			yAxis: [
				{
					type: "value",
					name: "MWh",
					min: 0,
					max: 15,
					interval: 1,
					splitLine: { lineStyle: { type: "dashed" } },
					axisLabel: {
						formatter: (v: number) => {
							if (v === 0 || v === 14 || v === 15) return `${v}`;
							return "";
						},
					},
				},
				{
					type: "value",
					name: "%",
					min: 0,
					max: 100,
					interval: 10,
					position: "right",
					splitLine: { show: false },
					axisLabel: {
						formatter: (v: number) => {
							if (v === 0 || v === 70 || v === 100) return `${v}%`;
							return "";
						},
					},
				},
			],
			series: [
				{
					name: "Throughput",
					type: "line",
					data: throughputData,
					smooth: true,
					symbol: "none",
					lineStyle: { color: theme.primary, width: 3 },
					itemStyle: { color: theme.primary },
					areaStyle: { color: theme.areaFill, opacity: 0.15 },
					markLine: {
						silent: true,
						symbol: "none",
						lineStyle: { type: "dashed" },
						data: [
							{
								xAxis: 8,
								lineStyle: { color: theme.referenceLineAlert },
								label: {
									formatter: "Limit hit",
									position: "end",
									color: theme.referenceLineAlert,
								},
							},
							{
								xAxis: 1,
								lineStyle: { color: theme.referenceLineLight },
								label: {
									formatter: "Now",
									position: "end",
									color: theme.referenceLineLight,
								},
							},
							{
								yAxis: 14,
								lineStyle: { color: theme.referenceLineAlert },
								label: { show: false },
							},
							{
								yAxis: 9,
								lineStyle: { color: theme.referenceLine },
								label: { show: false },
							},
						],
					},
				},
				{
					name: "Warranty",
					type: "line",
					data: warrantyData,
					smooth: true,
					symbol: "none",
					lineStyle: { color: theme.warrantyStroke, width: 2 },
					itemStyle: { color: theme.warrantyStroke },
				},
			],
		});
	}, [theme]);

	return (
		<div className="w-full h-80 flex flex-col gap-2">
			<LegendValues items={legendItems} isInteractive={hoverIndex != null} />
			<div ref={ref} className="w-full flex-1 min-h-0" />
		</div>
	);
}
