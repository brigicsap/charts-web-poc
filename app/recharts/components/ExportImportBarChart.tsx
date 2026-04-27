"use client";

import { useState } from "react";
import type { BarShapeProps } from "recharts";
import {
	Bar,
	BarChart,
	CartesianGrid,
	Rectangle,
	ReferenceLine,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";
import { useChartTheme } from "../../ChartThemeContext";
import LegendValues from "../../chartjs/components/LegendValues";
import rawData from "../../mockData/exportImportDay.json";
import { formatDailyTimeTick, parseConstituentSeries, round2 } from "./utils";

const data = parseConstituentSeries(rawData.datapoints);

export default function ExportImportBarChart() {
	const { theme } = useChartTheme();
	const [hoverIndex, setHoverIndex] = useState<number | null>(null);
	const legendIndex = hoverIndex;
	const opacity = (i: number) =>
		hoverIndex === null || hoverIndex === i ? 1 : 0.3;
	// Prepare series data for legend calculations
	const importSeries = data.map((d) => Number(d["grid-import"] ?? 0));
	const exportSeries = data.map((d) => Number(d["grid-export"] ?? 0));
	// Legend items with dynamic value text based on active index or totals
	const legendItems = [
		{
			label: "Import",
			color: theme.primary,
			valueText: `£${round2(
				legendIndex == null
					? importSeries.reduce((sum, v) => sum + v, 0)
					: (importSeries[legendIndex] ?? 0),
			).toFixed(2)}`,
		},
		{
			label: "Export",
			color: theme.secondary,
			valueText: `£${round2(
				legendIndex == null
					? exportSeries.reduce((sum, v) => sum + v, 0)
					: (exportSeries[legendIndex] ?? 0),
			).toFixed(2)}`,
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
						ticks={["00:00", "06:00", "12:00", "18:00"]}
						tickSize={12}
						padding={{ left: 10 }}
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
						tickMargin={6}
						fontSize={14}
						label={{
							value: "£",
							position: "top",
							offset: 15,
						}}
					/>
					<Tooltip
						formatter={(value, name) => [
							`£${round2(Number(value ?? 0)).toFixed(2)}`,
							String(name),
						]}
					/>
					<ReferenceLine y={0} stroke={theme.referenceLine} strokeWidth={1} />
					<Bar
						xAxisId="bottom"
						dataKey="grid-import"
						stackId="a"
						fill={theme.primary}
						name="Import"
						radius={[10, 10, 0, 0]}
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
						dataKey="grid-export"
						stackId="a"
						fill={theme.secondary}
						name="Export"
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
