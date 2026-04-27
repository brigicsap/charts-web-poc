"use client";

import { useState } from "react";
import {
	Area,
	AreaChart,
	CartesianGrid,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";
import { useChartTheme } from "../../ChartThemeContext";
import LegendValues from "../../chartjs/components/LegendValues";
import rawData from "../../mockData/savingsMock.json";
import { round2, toGBP } from "./utils";

const data = rawData.intervalSavings.map((d) => {
	const date = new Date(d.start);
	const label = `${date.getDate()}/${date.getMonth() + 1}`;
	return {
		time: label,
		notOptimised: Math.round(toGBP(d.notOptimisedStrategySavings) * 100) / 100,
		used: Math.round(toGBP(d.usedStrategySavings) * 100) / 100,
	};
});

export default function SavingsChart() {
	const { theme } = useChartTheme();
	const [hoverIndex, setHoverIndex] = useState<number | null>(null);
	const notOptimisedValues = data.map((d) => d.notOptimised);
	const usedValues = data.map((d) => d.used);
	const legendItems = [
		{
			label: "Not Optimised",
			color: theme.primary,
			valueText: `£${round2(
				hoverIndex == null
					? notOptimisedValues.reduce((sum, v) => sum + v, 0)
					: (notOptimisedValues[hoverIndex] ?? 0),
			).toFixed(2)}`,
		},
		{
			label: "Used Strategy",
			color: theme.tertiary,
			valueText: `£${round2(
				hoverIndex == null
					? usedValues.reduce((sum, v) => sum + v, 0)
					: (usedValues[hoverIndex] ?? 0),
			).toFixed(2)}`,
		},
	];
	return (
		<div className="w-full h-80 flex flex-col gap-2">
			<LegendValues items={legendItems} isInteractive={hoverIndex != null} />
			<ResponsiveContainer width="100%" height="100%">
				<AreaChart
					data={data}
					margin={{ top: 10, right: 20, left: 10, bottom: 0 }}
					onMouseMove={(state) =>
						setHoverIndex(
							state?.isTooltipActive
								? (state.activeTooltipIndex ?? null)
								: null,
						)
					}
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
					<XAxis dataKey="time" tickSize={12} tickMargin={6} fontSize={14} />
					<YAxis
						tickFormatter={(v: number) => `£${v}`}
						tickLine={false}
						tickSize={10}
						tickMargin={6}
						fontSize={14}
					/>
					<Tooltip
						formatter={(value: number, name: string) => [
							`£${round2(Number(value)).toFixed(2)}`,
							name,
						]}
					/>
					<Area
						type="monotone"
						dataKey="notOptimised"
						name="Not Optimised"
						stroke={theme.primary}
						fill={theme.primary}
						strokeWidth={0}
						activeDot={false}
					/>
					<Area
						type="monotone"
						dataKey="used"
						name="Used Strategy"
						stroke={theme.tertiary}
						fill={theme.tertiary}
						strokeWidth={0}
						activeDot={false}
					/>
				</AreaChart>
			</ResponsiveContainer>
		</div>
	);
}
