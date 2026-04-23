"use client";

import * as echarts from "echarts";
import { useEffect, useRef } from "react";
import { useChartTheme } from "../../ChartThemeContext";
import rawData from "../../mockData/batteryHistoryMockDay.json";

const dataMap = new Map(
	rawData.datapoints.map((dp) => [dp.from.slice(11, 16), dp.batteryPercentage]),
);

const allSlots = Array.from({ length: 96 }, (_, i) => {
	const h = String(Math.floor(i / 4)).padStart(2, "0");
	const m = String((i % 4) * 15).padStart(2, "0");
	return `${h}:${m}`;
});

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
					type: "line",
					lineStyle: { color: theme.secondary, type: "dashed" },
				},
			},
			legend: {
				data: ["Battery"],
				top: 0,
				right: 0,
			},
			grid: { top: 40, bottom: 30, left: 50, right: 20 },
			xAxis: {
				type: "category",
				data: allSlots,
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

	return <div ref={ref} className="w-full h-80" />;
}
