"use client";

import * as echarts from "echarts";
import { useEffect, useRef } from "react";
import { useChartTheme } from "../../ChartThemeContext";

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

	return <div ref={ref} className="w-full h-80" />;
}
