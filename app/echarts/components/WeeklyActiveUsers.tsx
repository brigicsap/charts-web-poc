"use client";

import * as echarts from "echarts";
import { useEffect, useMemo, useRef } from "react";
import { useChartTheme } from "../../ChartThemeContext";
import rawData from "../../mockData/weeklyActiveUsers.json";

type WeeklyActiveUsersRow = {
	"Event Week": string;
	"Unique app users": string;
	"Total cumulative consumers": string;
	"App users as % of total": string;
};

type MonthlyPoint = {
	label: string;
	uniqueAppUsers: number;
	totalConsumers: number;
	appUsersFromPercent: number;
	appUsersPercentage: number;
};

function parseNumber(value: string): number {
	return Number.parseFloat(value.replace("%", ""));
}

function buildMonthlySeries(rows: WeeklyActiveUsersRow[]): MonthlyPoint[] {
	const byMonth = new Map<string, WeeklyActiveUsersRow>();

	for (const row of rows) {
		const weekDate = new Date(row["Event Week"]);
		if (Number.isNaN(weekDate.getTime())) continue;
		const monthKey = row["Event Week"].slice(0, 7);
		const existing = byMonth.get(monthKey);

		if (!existing || new Date(existing["Event Week"]) < weekDate) {
			byMonth.set(monthKey, row);
		}
	}

	return Array.from(byMonth.entries())
		.sort(([a], [b]) => (a < b ? -1 : 1))
		.map(([monthKey, row]) => {
			const date = new Date(`${monthKey}-01`);
			const label = date.toLocaleDateString("en-GB", {
				month: "short",
				year: "2-digit",
			});
			const uniqueAppUsers = parseNumber(row["Unique app users"]);
			const totalConsumers = parseNumber(row["Total cumulative consumers"]);
			const appPct = parseNumber(row["App users as % of total"]);
			const appUsersFromPercent = Math.round((totalConsumers * appPct) / 100);

			return {
				label,
				uniqueAppUsers,
				totalConsumers,
				appUsersFromPercent,
				appUsersPercentage: appPct,
			};
		});
}

export default function WeeklyActiveUsers() {
	const ref = useRef<HTMLDivElement>(null);
	const chartRef = useRef<echarts.ECharts | null>(null);
	const { theme } = useChartTheme();

	const monthlyData = useMemo(
		() => buildMonthlySeries(rawData as WeeklyActiveUsersRow[]),
		[],
	);

	const labels = monthlyData.map((d) => d.label);
	const uniqueAppUsersData = monthlyData.map((d) => d.uniqueAppUsers);
	const totalConsumersData = monthlyData.map((d) => d.totalConsumers);
	const appUsersPercentageData = monthlyData.map((d) => d.appUsersPercentage);

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
			legend: {
				top: 10,
				left: "center",
				orient: "horizontal",
			},
			grid: {
				show: true,
				top: 40,
				right: 20,
				bottom: 40,
				left: 50,
				borderColor: "transparent",
			},
			xAxis: {
				type: "category",
				data: labels,
				name: "App session date",
				nameLocation: "middle",
				nameGap: 25,
			},
			yAxis: [
				{
					type: "value",
					splitLine: { lineStyle: { type: "dashed" } },
				},
				{
					type: "value",
					name: "App users as % of total",
					position: "right",
					min: 0,
					max: 100,
					nameLocation: "middle",
					nameRotate: -90,
					nameGap: 35,
					axisLabel: { formatter: "{value}%" },
					splitLine: { show: false },
				},
			],
			series: [
				{
					name: "Unique app users",
					type: "bar",
					data: uniqueAppUsersData,
					itemStyle: { color: "#1973e8" },
					barMaxWidth: 26,
				},
				{
					name: "Total cumulative consumers",
					type: "line",
					data: totalConsumersData,
					symbol: "none",
					lineStyle: { width: 2, color: theme.primary },
					itemStyle: { color: theme.primary },
				},
				{
					name: "App users %",
					type: "line",
					data: appUsersPercentageData,
					symbol: "none",
					lineStyle: { width: 2, color: theme.tertiary },
					itemStyle: { color: theme.tertiary },
					yAxisIndex: 1,
				},
			],
		});
	}, [
		theme,
		labels,
		uniqueAppUsersData,
		totalConsumersData,
		appUsersPercentageData,
	]);

	return <div ref={ref} className="w-full" style={{ height: "300px" }} />;
}
