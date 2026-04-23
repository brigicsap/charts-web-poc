"use client";

import {
	Area,
	AreaChart,
	CartesianGrid,
	Legend,
	ResponsiveContainer,
	XAxis,
	YAxis,
} from "recharts";
import { useChartTheme } from "../../ChartThemeContext";
import rawData from "../../mockData/savingsMock.json";

function toGBP(s: { units: number; nanos: number }) {
	return s.units + s.nanos / 1_000_000_000;
}

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
	return (
		<div className="w-full h-80">
			<ResponsiveContainer width="100%" height="100%">
				<AreaChart
					data={data}
					margin={{ top: 30, right: 20, left: 10, bottom: 0 }}
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

					<Legend verticalAlign="top" align="right" />
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
