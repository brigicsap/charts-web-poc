"use client";

import { useState } from "react";
import {
	Area,
	AreaChart,
	CartesianGrid,
	Line,
	ReferenceLine,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";
import { useChartTheme } from "../../ChartThemeContext";
import LegendValues from "../../chartjs/components/LegendValues";
import { round2 } from "./utils";

const data = [
	{ year: 1, throughput: 1.1, warranty: 15 },
	{ year: 2, throughput: 2.4, warranty: 14.5 },
	{ year: 3, throughput: 3.8, warranty: 14.0 },
	{ year: 4, throughput: 5.1, warranty: 13.5 },
	{ year: 5, throughput: 6.3, warranty: 13.0 },
	{ year: 6, throughput: 7.6, warranty: 12.5 },
	{ year: 7, throughput: 8.9, warranty: 12.0 },
	{ year: 8, throughput: 10.1, warranty: 11.5 },
	{ year: 9, throughput: 11.4, warranty: 11.0 },
	{ year: 10, throughput: 12.0, warranty: 10.5 },
];

export default function ThroughputWarrantyLimit() {
	const { theme } = useChartTheme();
	const [hoverIndex, setHoverIndex] = useState<number | null>(null);
	const throughputAvg = round2(
		data.reduce((sum, row) => sum + row.throughput, 0) / data.length,
	);
	const warrantyAvg = round2(
		data.reduce((sum, row) => sum + row.warranty, 0) / data.length,
	);
	const legendItems = [
		{
			label: "Throughput",
			color: theme.primary,
			valueText: `${round2(
				hoverIndex == null
					? throughputAvg
					: (data[hoverIndex]?.throughput ?? throughputAvg),
			).toFixed(2)} MWh`,
		},
		{
			label: "Warranty",
			color: theme.warrantyStroke,
			valueText: `${round2(
				hoverIndex == null
					? warrantyAvg
					: (data[hoverIndex]?.warranty ?? warrantyAvg),
			).toFixed(2)} MWh`,
		},
	];
	return (
		<div className="w-full h-80 flex flex-col gap-2">
			<LegendValues items={legendItems} isInteractive={hoverIndex != null} />
			<ResponsiveContainer width="100%" height="100%">
				<AreaChart
					data={data}
					margin={{ top: 10 }}
					onMouseMove={(state) =>
						setHoverIndex(
							state?.isTooltipActive
								? (state.activeTooltipIndex ?? null)
								: null,
						)
					}
					onMouseLeave={() => setHoverIndex(null)}
				>
					<CartesianGrid vertical={false} strokeDasharray="3 3" />
					<XAxis
						dataKey="year"
						domain={[1, 10]}
						ticks={[1, 2, 10]}
						tickMargin={6}
						tickFormatter={(v: number) => `Yr ${v}`}
						type="number"
						fontSize={12}
					/>
					<YAxis
						domain={[0, 15]}
						ticks={[0, 13, 15]}
						tickLine={false}
						tickSize={1}
						tickMargin={6}
						fontSize={12}
						tickFormatter={(v: number) => `${v} MWh`}
					/>
					<YAxis
						yAxisId="right"
						orientation="right"
						domain={[0, 100]}
						ticks={[0, 60, 100]}
						tickLine={false}
						tickMargin={6}
						fontSize={12}
						tickFormatter={(v: number) => `${v}%`}
					/>
					<Tooltip
						formatter={(value: number, name: string) => [
							`${round2(Number(value)).toFixed(2)} MWh`,
							name,
						]}
					/>
					<ReferenceLine
						x={9}
						stroke={theme.referenceLineAlert}
						strokeDasharray="4 4"
						label={{
							value: "Limit hit",
							position: "top",
							fill: theme.referenceLineAlert,
							fontSize: 12,
						}}
					/>
					<ReferenceLine
						y={13}
						stroke={theme.referenceLineAlert}
						strokeDasharray="4 4"
					/>
					<ReferenceLine
						y={9}
						stroke={theme.referenceLine}
						strokeDasharray="4 4"
					/>
					<ReferenceLine
						x={2}
						stroke={theme.referenceLineLight}
						strokeDasharray="4 4"
						label={{
							value: "Now",
							position: "top",
							fill: theme.referenceLineLight,
							fontSize: 12,
						}}
					/>
					<Area
						type="monotone"
						dataKey="throughput"
						stroke={theme.primary}
						strokeWidth={3}
						fill={theme.areaFill}
						fillOpacity={0.15}
					/>
					<Line
						type="monotone"
						dataKey="warranty"
						stroke={theme.warrantyStroke}
						strokeWidth={2}
						dot={false}
						name="Warranty"
					/>
				</AreaChart>
			</ResponsiveContainer>
		</div>
	);
}
