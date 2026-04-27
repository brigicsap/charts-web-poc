"use client";

import { useState } from "react";
import type { BarShapeProps } from "recharts";
import {
	Bar,
	BarChart,
	CartesianGrid,
	Rectangle,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";
import { useChartTheme } from "../../ChartThemeContext";
import LegendValues from "../../chartjs/components/LegendValues";
import rawDayData from "../../mockData/homeUsageMockDay.json";
import rawWeekData from "../../mockData/homeUsageMockWeek.json";
import { formatDailyTimeTick, parseConstituentSeries, round2 } from "./utils";

type View = "day" | "week";

const dayData = [
	...parseConstituentSeries(rawDayData.datapoints),
	{
		time: "24:00",
		"solar-consumption": 0,
		"grid-consumption": 0,
		"battery-consumption": 0,
	},
];
const weekData = rawWeekData.datapoints.map((dp) => {
	const map: Record<string, number | string> = { time: dp.from };
	for (const c of dp.constituentDatapoints) {
		map[c.type] = c.energy;
	}
	return map;
});

function formatWeekLabel(time: string): string {
	const date = new Date(time);
	return date.toLocaleDateString("en-GB", { weekday: "short" });
}

export default function BarChartDemo() {
	const { theme } = useChartTheme();
	const [hoverIndex, setHoverIndex] = useState<number | null>(null);
	const [view, setView] = useState<View>("day");
	const data = view === "day" ? dayData : weekData;
	const legendIndex = hoverIndex;

	const opacity = (i: number) =>
		hoverIndex === null || hoverIndex === i ? 1 : 0.3;

	const solarSeries = data.map((d) => Number(d["solar-consumption"] ?? 0));
	const gridSeries = data.map((d) => Number(d["grid-consumption"] ?? 0));
	const batterySeries = data.map((d) => Number(d["battery-consumption"] ?? 0));

	const legendItems = [
		{
			label: "Solar",
			color: theme.secondary,
			valueText: `${round2(
				legendIndex == null
					? solarSeries.reduce((sum, v) => sum + v, 0)
					: (solarSeries[legendIndex] ?? 0),
			).toFixed(2)} kWh`,
		},
		{
			label: "Grid",
			color: theme.tertiary,
			valueText: `${round2(
				legendIndex == null
					? gridSeries.reduce((sum, v) => sum + v, 0)
					: (gridSeries[legendIndex] ?? 0),
			).toFixed(2)} kWh`,
		},
		{
			label: "Battery",
			color: theme.primary,
			valueText: `${round2(
				legendIndex == null
					? batterySeries.reduce((sum, v) => sum + v, 0)
					: (batterySeries[legendIndex] ?? 0),
			).toFixed(2)} kWh`,
		},
	];

	const dayTicks = ["00:00", "06:00", "12:00", "18:00", "24:00"];
	const weekTicks = weekData.map((d) => String(d.time));

	return (
		<div className="w-full h-80 flex flex-col gap-2">
			<div className="flex justify-end gap-1">
				<button
					type="button"
					onClick={() => {
						setView("day");
						setHoverIndex(null);
					}}
					className={`px-3 py-1 text-sm rounded ${view === "day" ? "bg-gray-800 text-white" : "bg-gray-200 text-gray-700"}`}
				>
					Day
				</button>
				<button
					type="button"
					onClick={() => {
						setView("week");
						setHoverIndex(null);
					}}
					className={`px-3 py-1 text-sm rounded ${view === "week" ? "bg-gray-800 text-white" : "bg-gray-200 text-gray-700"}`}
				>
					Week
				</button>
			</div>
			<LegendValues items={legendItems} isInteractive={legendIndex != null} />
			<ResponsiveContainer width="100%" height="100%">
				<BarChart
					data={data}
					barCategoryGap={3}
					margin={{ top: 10 }}
					onMouseMove={(state) => {
						const idx = state?.activeTooltipIndex;
						setHoverIndex(
							state?.isTooltipActive && typeof idx === "number" ? idx : null,
						);
					}}
					onMouseLeave={() => setHoverIndex(null)}
				>
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
						ticks={view === "day" ? dayTicks : weekTicks}
						tickSize={12}
						tickMargin={6}
						fontSize={14}
						tickFormatter={(v: string) =>
							view === "day" ? formatDailyTimeTick(v) : formatWeekLabel(v)
						}
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
					<Tooltip
						formatter={(value, name) => [
							round2(Number(value ?? 0)).toFixed(2),
							`${String(name)} (kWh)`,
						]}
					/>
					<Bar
						xAxisId="bottom"
						dataKey="solar-consumption"
						stackId="a"
						fill={theme.secondary}
						name="Solar"
						style={{ transform: "translate(0,2px)" }}
						background={(props: BarShapeProps) => {
							if (props.index !== hoverIndex) return <g />;
							const pad = 4;
							return (
								<rect
									x={props.x - pad / 2}
									y={props.y}
									width={props.width + pad}
									height={props.height}
									fill="rgba(0,0,0,0.07)"
									rx={4}
								/>
							);
						}}
						shape={(props: BarShapeProps) => (
							<Rectangle {...props} fillOpacity={opacity(props.index)} />
						)}
					/>
					<Bar
						xAxisId="bottom"
						dataKey="grid-consumption"
						stackId="a"
						fill={theme.tertiary}
						name="Grid"
						style={{ transform: "translate(0,2px)" }}
						shape={(props: BarShapeProps) => {
							const isTop = batterySeries[props.index] === 0;
							return (
								<Rectangle
									{...props}
									fillOpacity={opacity(props.index)}
									radius={isTop ? [10, 10, 0, 0] : undefined}
								/>
							);
						}}
					/>
					<Bar
						xAxisId="bottom"
						dataKey="battery-consumption"
						stackId="a"
						fill={theme.primary}
						name="Battery"
						radius={[10, 10, 0, 0]}
						shape={(props: BarShapeProps) => (
							<Rectangle {...props} fillOpacity={opacity(props.index)} />
						)}
					/>
				</BarChart>
			</ResponsiveContainer>
		</div>
	);
}
