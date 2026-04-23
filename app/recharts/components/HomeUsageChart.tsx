"use client";

import { useState } from "react";
import {
	Bar,
	BarChart,
	CartesianGrid,
	Cell,
	Legend,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";
import { useChartTheme } from "../../ChartThemeContext";
import rawData from "../../mockData/homeUsageMockDay.json";

const data = rawData.datapoints.map((dp) => {
	const time = dp.from.slice(11, 16);
	const entry: Record<string, string | number> = { time };
	for (const c of dp.constituentDatapoints) {
		entry[c.type] = c.energy;
	}
	return entry;
});

export default function BarChartDemo() {
	const { theme } = useChartTheme();
	const [activeIndex, setActiveIndex] = useState<number | null>(null);

	const opacity = (i: number) =>
		activeIndex === null || activeIndex === i ? 1 : 0.3;

	return (
		<div className="w-full h-80">
			<ResponsiveContainer width="100%" height="100%">
				<BarChart data={data} barCategoryGap={3} margin={{ top: 30 }}>
					<CartesianGrid vertical={false} strokeDasharray="3 3" />
					<XAxis
						xAxisId="top"
						orientation="top"
						tick={false}
						tickLine={false}
						mirror
					/>
					<XAxis
						xAxisId="bottom"
						dataKey="time"
						padding={{ left: 10 }}
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
						interval={"preserveStartEnd"}
						domain={[0, "auto"]}
						tickLine={false}
						tickSize={10}
						fontSize={14}
						label={{
							value: "kWh",
							position: "top",
							offset: 15,
						}}
					/>
					<Tooltip />
					<Legend verticalAlign="top" align="right" />
					<Bar
						xAxisId="bottom"
						dataKey="solar-consumption"
						stackId="a"
						fill={theme.secondary}
						name="Solar"
						style={{ transform: "translate(0,2px)" }}
						background={(props) => {
							if (props.index !== activeIndex) return <g />;
							return (
								<rect
									x={props.x as number}
									y={props.y as number}
									width={props.width as number}
									height={props.height as number}
									fill="rgba(0,0,0,0.07)"
									rx={4}
								/>
							);
						}}
						onClick={(_data, index) =>
							setActiveIndex((prev) => (prev === index ? null : index))
						}
					>
						{data.map((entry, i) => (
							<Cell key={String(entry.time)} fillOpacity={opacity(i)} />
						))}
					</Bar>
					<Bar
						xAxisId="bottom"
						dataKey="grid-consumption"
						stackId="a"
						fill={theme.tertiary}
						name="Grid"
						radius={[10, 10, 0, 0]}
						onClick={(_data, index) =>
							setActiveIndex((prev) => (prev === index ? null : index))
						}
					>
						{data.map((entry, i) => (
							<Cell key={String(entry.time)} fillOpacity={opacity(i)} />
						))}
					</Bar>
					<Bar
						xAxisId="bottom"
						dataKey="battery-consumption"
						stackId="a"
						fill={theme.primary}
						name="Battery"
						radius={[10, 10, 0, 0]}
						onClick={(_data, index) =>
							setActiveIndex((prev) => (prev === index ? null : index))
						}
					>
						{data.map((entry, i) => (
							<Cell key={String(entry.time)} fillOpacity={opacity(i)} />
						))}
					</Bar>
				</BarChart>
			</ResponsiveContainer>
		</div>
	);
}
