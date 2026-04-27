"use client";

import { useState } from "react";
import {
	CartesianGrid,
	Line,
	LineChart,
	ReferenceArea,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";
import { useChartTheme } from "../../ChartThemeContext";
import LegendValues from "../../chartjs/components/LegendValues";
import rawData from "../../mockData/batteryHistoryMockDay.json";
import { buildQuarterHourSlots, formatDailyTimeTick, round2 } from "./utils";

// Build a lookup from the mock data
const dataMap = new Map(
	rawData.datapoints.map((dp) => [
		dp.timestamp.slice(11, 16),
		dp.batteryPercentage,
	]),
);

// Generate all 96 15-min slots for full 24h x axis
const data = buildQuarterHourSlots().map((time) => {
	return {
		time,
		battery: dataMap.get(time) ?? null,
	};
});

export default function BatteryHistoryChart() {
	const { theme } = useChartTheme();
	const [hoverIndex, setHoverIndex] = useState<number | null>(null);
	// Extract non-null battery values for average calculation
	const nonNull = data
		.map((d) => d.battery)
		.filter((v): v is number => v != null);
	// Calculate average battery percentage for legend when no point is active
	const avg = nonNull.length
		? round2(nonNull.reduce((sum, v) => sum + v, 0) / nonNull.length)
		: 0;
	// Get the active battery value based on activeIndex for legend display
	const activeVal =
		hoverIndex == null ? null : (data[hoverIndex]?.battery as number | null);
	// Legend items with dynamic value text based on active index or average
	const legendItems = [
		{
			label: "Battery",
			color: theme.primary,
			valueText:
				activeVal == null
					? `${avg.toFixed(2)}%`
					: `${round2(activeVal).toFixed(2)}%`,
		},
	];

	return (
		<div className="w-full h-80 flex flex-col gap-2">
			<LegendValues items={legendItems} isInteractive={hoverIndex != null} />
			<ResponsiveContainer width="100%" height="100%">
				<LineChart
					data={data}
					margin={{ top: 10 }}
					onMouseMove={(state) => {
						const idx = state?.activeTooltipIndex;
						setHoverIndex(
							state?.isTooltipActive && typeof idx === "number" ? idx : null,
						);
					}}
					onMouseLeave={() => setHoverIndex(null)}
				>
					<CartesianGrid
						vertical={false}
						strokeDasharray="3 3"
						stroke={theme.grid}
					/>
					<XAxis
						xAxisId="top"
						orientation="top"
						tick={false}
						tickLine={false}
						mirror
					/>
					<XAxis
						dataKey="time"
						ticks={["00:00", "06:00", "12:00", "18:00"]}
						tickSize={12}
						tickMargin={6}
						fontSize={14}
						tickFormatter={(v: string) => {
							return formatDailyTimeTick(v);
						}}
					/>
					<YAxis
						domain={[0, 100]}
						ticks={[0, 25, 50, 75, 100]}
						tickSize={10}
						tickMargin={6}
						fontSize={14}
						tickLine={false}
						label={{
							value: "%",
							position: "top",
							offset: 15,
						}}
					/>
					<ReferenceArea
						x1="05:00"
						x2="07:00"
						fill={theme.referenceArea}
						fillOpacity={0.5}
					/>
					<Tooltip
						cursor={{ stroke: theme.cursorStroke, strokeDasharray: "4 4" }}
						formatter={(value, name) => [
							`${round2(Number(value ?? 0)).toFixed(2)}%`,
							String(name),
						]}
					/>
					<Line
						type="monotone"
						dataKey="battery"
						stroke={theme.primary}
						strokeWidth={2}
						name="Battery"
						dot={false}
						activeDot={{
							r: 8,
							fill: theme.activeDotFill,
							stroke: theme.activeDotStroke,
							strokeWidth: 4,
						}}
						connectNulls={false}
					/>
				</LineChart>
			</ResponsiveContainer>
		</div>
	);
}
