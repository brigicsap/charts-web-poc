"use client";

import { useMemo, useState } from "react";
import rawData from "../../mockData/weeklyActiveUsers.json";
import Chart from "./Chart";
import { baseOption, useChartPalette } from "./chartOptions";

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
	const palette = useChartPalette();
	const [hiddenSeries, setHiddenSeries] = useState<string[]>([]);
	const legendItems = [
		{ name: "Unique app users", color: palette.solar },
		{ name: "Total cumulative consumers", color: palette.battery },
		{ name: "App users %", color: palette.grid },
	];

	const monthlyData = useMemo(
		() => buildMonthlySeries(rawData as WeeklyActiveUsersRow[]),
		[],
	);

	const labels = monthlyData.map((d) => d.label);
	const uniqueAppUsersData = monthlyData.map((d) => d.uniqueAppUsers);
	const totalConsumersData = monthlyData.map((d) => d.totalConsumers);
	const appUsersPercentageData = monthlyData.map((d) => d.appUsersPercentage);

	return (
		<div className="w-full min-w-0 space-y-3">
			<fieldset
				className="flex flex-wrap gap-x-5 gap-y-2"
				aria-label="Active user series"
			>
				{legendItems.map((item) => (
					<label key={item.name} className="flex items-center gap-2 text-sm">
						<input
							type="checkbox"
							checked={!hiddenSeries.includes(item.name)}
							style={{ accentColor: item.color }}
							onChange={() =>
								setHiddenSeries((current) =>
									current.includes(item.name)
										? current.filter((name) => name !== item.name)
										: [...current, item.name],
								)
							}
						/>
						<span
							className="h-3 w-3 shrink-0 rounded-sm"
							style={{ backgroundColor: item.color }}
						/>
						{item.name}
					</label>
				))}
			</fieldset>
			<Chart
				height={340}
				option={{
					...baseOption(palette),
					tooltip: { trigger: "axis" },
					grid: {
						show: true,
						top: 20,
						right: 72,
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
						axisLabel: { color: palette.text, hideOverlap: true },
						axisLine: { lineStyle: { color: palette.border } },
					},
					yAxis: [
						{
							type: "value",
							axisLabel: { color: palette.text },
							splitLine: {
								lineStyle: { type: "dashed", color: palette.border },
							},
						},
						{
							type: "value",
							name: "App users %",
							position: "right",
							min: 0,
							max: 100,
							nameLocation: "middle",
							nameRotate: -90,
							nameGap: 35,
							axisLabel: { formatter: "{value}%", color: palette.text },
							splitLine: { show: false },
						},
					],
					series: [
						{
							name: "Unique app users",
							type: "bar" as const,
							data: uniqueAppUsersData,
							itemStyle: { color: palette.solar },
							barMaxWidth: 26,
						},
						{
							name: "Total cumulative consumers",
							type: "line" as const,
							data: totalConsumersData,
							symbol: "none",
							lineStyle: { width: 2, color: palette.battery },
							itemStyle: { color: palette.battery },
						},
						{
							name: "App users %",
							type: "line" as const,
							data: appUsersPercentageData,
							symbol: "none",
							lineStyle: { width: 2, color: palette.grid },
							itemStyle: { color: palette.grid },
							yAxisIndex: 1,
						},
					].filter((series) => !hiddenSeries.includes(series.name)),
				}}
			/>
		</div>
	);
}
