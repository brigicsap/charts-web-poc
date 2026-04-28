"use client";

import {
	Area,
	AreaChart,
	CartesianGrid,
	ResponsiveContainer,
	XAxis,
	YAxis,
} from "recharts";
import { useChartTheme } from "../../ChartThemeContext";
import LegendValues from "../../chartjs/components/LegendValues";
import rawData from "../../mockData/savingsMock.json";
import { round2, toGBP } from "./utils";

// The mock data has a different shape so we need to transform it into the format expected by the chart
const data = rawData.intervalSavings.map((d) => {
	const date = new Date(d.start);
	const label = `${date.getDate()} ${date.toLocaleDateString("en-GB", { month: "short" })}`;
	return {
		time: label,
		notOptimised: Math.round(toGBP(d.notOptimisedStrategySavings) * 100) / 100,
		used: Math.round(toGBP(d.usedStrategySavings) * 100) / 100,
	};
});

export default function SavingsChart() {
	const { theme } = useChartTheme();
	// Pre-calculate legend values for performance and cleaner code
	const notOptimisedValues = data.map((d) => d.notOptimised);
	// Calculate total values for when no specific point is active
	const usedValues = data.map((d) => d.used);
	const notOptimisedOverall = round2(
		notOptimisedValues.reduce((sum, v) => sum + v, 0),
	);
	const usedOverall = round2(usedValues.reduce((sum, v) => sum + v, 0));
	// Legend items with dynamic values based on active index
	const legendItems = [
		{
			label: "Not Optimised",
			color: theme.primary,
			valueText: `£${notOptimisedOverall.toFixed(2)}`,
		},
		{
			label: "Used Strategy",
			color: theme.tertiary,
			valueText: `£${usedOverall.toFixed(2)}`,
		},
	];
	return (
		<div className="w-full h-80 flex flex-col gap-2">
			<LegendValues items={legendItems} isInteractive={false} />
			<ResponsiveContainer width="100%" height="100%">
				<AreaChart
					data={data}
					margin={{ top: 10, right: 20, left: 10, bottom: 0 }}
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
