"use client";

import {
	CartesianGrid,
	Legend,
	Line,
	LineChart,
	ReferenceArea,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";
import { useChartTheme } from "../../ChartThemeContext";
import rawData from "../../mockData/batteryHistoryMockDay.json";

// Build a lookup from the mock data
const dataMap = new Map(
	rawData.datapoints.map((dp) => [dp.from.slice(11, 16), dp.batteryPercentage]),
);

// Generate all 96 15-min slots for full 24h x axis
const data = Array.from({ length: 96 }, (_, i) => {
	const h = String(Math.floor(i / 4)).padStart(2, "0");
	const m = String((i % 4) * 15).padStart(2, "0");
	const time = `${h}:${m}`;
	return {
		time,
		battery: dataMap.get(time) ?? null,
	};
});

export default function BatteryHistoryChart() {
	const { theme } = useChartTheme();
	return (
		<div className="w-full h-80">
			<ResponsiveContainer width="100%" height="100%">
				<LineChart data={data} margin={{ top: 30 }}>
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
							const h = parseInt(v.slice(0, 2));
							if (h === 0) return "12am";
							if (h === 6) return "6am";
							if (h === 12) return "12pm";
							if (h === 18) return "6pm";
							return v;
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
					/>
					<Legend verticalAlign="top" align="right" />
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
