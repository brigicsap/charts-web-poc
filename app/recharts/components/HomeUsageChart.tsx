"use client";

import { useState } from "react";
import {
	Bar,
	BarChart,
	CartesianGrid,
	Cell,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";
import { useChartTheme } from "../../ChartThemeContext";
import LegendValues from "../../chartjs/components/LegendValues";
import rawData from "../../mockData/homeUsageMockDay.json";
import { formatDailyTimeTick, parseConstituentSeries, round2 } from "./utils";

const data = parseConstituentSeries(rawData.datapoints);

export default function BarChartDemo() {
	const { theme } = useChartTheme();
	const [activeIndex, setActiveIndex] = useState<number | null>(null);
	const [hoverIndex, setHoverIndex] = useState<number | null>(null);
	const legendIndex = activeIndex ?? hoverIndex;

	const opacity = (i: number) =>
		activeIndex === null || activeIndex === i ? 1 : 0.3;

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

	return (
		<div className="w-full h-80 flex flex-col gap-2">
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
						ticks={["00:00", "06:00", "12:00", "18:00"]}
						tickSize={12}
						tickMargin={6}
						fontSize={14}
						tickFormatter={(v: string) => {
							return formatDailyTimeTick(v);
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
