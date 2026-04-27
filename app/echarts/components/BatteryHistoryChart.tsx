"use client";

import * as echarts from "echarts";
import { useEffect, useRef, useState } from "react";
import { useChartTheme } from "../../ChartThemeContext";
import LegendValues from "../../chartjs/components/LegendValues";
import rawData from "../../mockData/batteryHistoryMockDay.json";
import { buildQuarterHourSlots, formatDailyTimeTick, round2 } from "./utils";

const dataMap = new Map(
	rawData.datapoints.map((dp) => [
		dp.timestamp.slice(11, 16),
		dp.batteryPercentage,
	]),
);

const allSlots = buildQuarterHourSlots();

const batteryData = allSlots.map((time) => {
	const val = dataMap.get(time);
	return val ?? null;
});

// Find the index range for the null gap reference area (05:00 to 07:00)
const refStart = allSlots.indexOf("05:00");
const refEnd = allSlots.indexOf("07:00");

export default function BatteryHistoryChart() {
	const ref = useRef<HTMLDivElement>(null);
	const chartRef = useRef<echarts.ECharts | null>(null);
	const { theme } = useChartTheme();
	const [hoverIndex, setHoverIndex] = useState<number | null>(null);
	const nonNull = batteryData
		.map((v) => (v == null ? null : Number(v)))
		.filter((v): v is number => v != null);
	const avg = nonNull.length
		? round2(nonNull.reduce((sum, v) => sum + v, 0) / nonNull.length)
		: 0;
	const activeVal = hoverIndex == null ? null : batteryData[hoverIndex];
	const legendItems = [
		{
			label: "Battery",
			color: theme.primary,
			valueText:
				activeVal == null
					? `${avg.toFixed(2)}%`
					: `${round2(Number(activeVal)).toFixed(2)}%`,
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
				axisPointer: {
					type: "line",
					lineStyle: { color: theme.secondary, type: "dashed" },
				},
				formatter: (params: unknown) => {
					const item = (
						params as Array<{ seriesName: string; value: number | null }>
					)[0];
					return `${item.seriesName}: ${round2(Number(item.value ?? 0)).toFixed(2)}%`;
				},
			},
			grid: { top: 40, bottom: 30, left: 50, right: 20 },
			xAxis: {
				type: "category",
				data: allSlots,
				axisLabel: {
					formatter: (v: string) => formatDailyTimeTick(v),
				},
			},
			yAxis: {
				type: "value",
				name: "%",
				min: 0,
				max: 100,
				interval: 25,
				splitLine: { lineStyle: { type: "dashed" } },
			},
			series: [
				{
					name: "Battery",
					type: "line",
					data: batteryData,
					smooth: true,
					connectNulls: false,
					symbol: "circle",
					showSymbol: false,
					symbolSize: 14,
					emphasis: {
						itemStyle: {
							color: theme.secondary,
							borderColor: theme.activeDotStroke,
							borderWidth: 4,
						},
					},
					lineStyle: { color: theme.primary, width: 2 },
					itemStyle: { color: theme.secondary },
					markArea: {
						silent: true,
						data: [
							[
								{
									xAxis: refStart,
									itemStyle: {
										color: theme.referenceArea,
										opacity: 0.5,
									},
								},
								{ xAxis: refEnd },
							],
						],
					},
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
