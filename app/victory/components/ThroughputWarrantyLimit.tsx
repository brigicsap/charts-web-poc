"use client";

import { useRef, useState } from "react";
import {
	VictoryArea,
	VictoryAxis,
	VictoryChart,
	VictoryLabel,
	VictoryLine,
	VictoryTooltip,
	VictoryVoronoiContainer,
} from "victory";
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

const throughputData = data.map((d) => ({ x: d.year, y: d.throughput }));
const warrantyData = data.map((d) => ({ x: d.year, y: d.warranty }));

export default function ThroughputWarrantyLimit() {
	const { theme } = useChartTheme();
	const [activeYear, setActiveYear] = useState<number | null>(null);
	const hoverRef = useRef<number | null>(null);
	const throughputAvg = round2(
		data.reduce((sum, row) => sum + row.throughput, 0) / data.length,
	);
	const warrantyAvg = round2(
		data.reduce((sum, row) => sum + row.warranty, 0) / data.length,
	);
	const activePoint =
		activeYear == null ? null : data.find((d) => d.year === activeYear);
	const legendItems = [
		{
			label: "Throughput",
			color: theme.primary,
			valueText: `${round2(activePoint?.throughput ?? throughputAvg).toFixed(2)} MWh`,
		},
		{
			label: "Warranty",
			color: theme.warrantyStroke,
			valueText: `${round2(activePoint?.warranty ?? warrantyAvg).toFixed(2)} MWh`,
		},
	];
	return (
		// biome-ignore lint/a11y/useSemanticElements: chart interaction wrapper
		<div
			className="w-full h-80 flex flex-col gap-2"
			role="button"
			tabIndex={0}
			onClick={() => {
				const yr = hoverRef.current;
				if (yr != null) {
					setActiveYear((prev) => (prev === yr ? null : yr));
				}
			}}
			onKeyDown={(e) => {
				if (e.key === "Enter" || e.key === " ") {
					const yr = hoverRef.current;
					if (yr != null) {
						setActiveYear((prev) => (prev === yr ? null : yr));
					}
				}
			}}
		>
			<LegendValues items={legendItems} isInteractive={activePoint != null} />
			<div className="flex-1 min-h-0">
				<VictoryChart
					padding={{ top: 60, bottom: 40, left: 60, right: 60 }}
					domain={{ x: [1, 10], y: [0, 15] }}
					containerComponent={
						<VictoryVoronoiContainer
							labels={({ datum }: { datum: { y: number } }) =>
								`${round2(datum.y).toFixed(2)} MWh`
							}
							onActivated={(points) => {
								if (!points.length) return;
								const p = points[0] as { x?: number };
								hoverRef.current = typeof p.x === "number" ? p.x : null;
							}}
							onDeactivated={() => {
								hoverRef.current = null;
							}}
							labelComponent={<VictoryTooltip />}
						/>
					}
				>
					<VictoryAxis
						tickValues={[1, 2, 10]}
						tickFormat={(v: number) => `Yr${v}`}
						style={{
							axis: { stroke: theme.grid, strokeWidth: 1 },
							grid: { stroke: "none" },
						}}
					/>
					<VictoryAxis
						orientation="top"
						style={{
							axis: { stroke: theme.grid, strokeWidth: 1 },
							ticks: { size: 0 },
							tickLabels: { fill: "none" },
							grid: { stroke: "none" },
						}}
					/>
					<VictoryAxis
						dependentAxis
						tickValues={[0, 3, 6, 9, 12, 15]}
						tickFormat={(v: number) =>
							v === 0 || v === 12 || v === 15 ? `${v} MWh` : ""
						}
						style={{
							axis: { stroke: theme.grid, strokeWidth: 1 },
							grid: { stroke: theme.grid, strokeDasharray: "3 3" },
						}}
					/>
					<VictoryAxis
						dependentAxis
						orientation="right"
						style={{
							axis: { stroke: theme.grid, strokeWidth: 1 },
							ticks: { size: 0 },
							tickLabels: { fill: "none" },
							grid: { stroke: "none" },
						}}
					/>
					{/* Reference lines */}
					<VictoryLine
						data={[
							{ x: 9, y: 0 },
							{ x: 9, y: 15 },
						]}
						labels={["Limit hit", ""]}
						labelComponent={
							<VictoryLabel
								renderInPortal={false}
								textAnchor="middle"
								dy={-6}
								style={{ fontSize: 10, fill: theme.referenceLineAlert }}
							/>
						}
						style={{
							data: {
								stroke: theme.referenceLineAlert,
								strokeDasharray: "4 4",
							},
						}}
					/>
					<VictoryLine
						data={[
							{ x: 1, y: 13 },
							{ x: 10, y: 13 },
						]}
						style={{
							data: {
								stroke: theme.referenceLineAlert,
								strokeDasharray: "4 4",
							},
						}}
					/>
					<VictoryLine
						data={[
							{ x: 1, y: 9 },
							{ x: 10, y: 9 },
						]}
						style={{
							data: {
								stroke: theme.referenceLine,
								strokeDasharray: "4 4",
							},
						}}
					/>
					<VictoryLine
						data={[
							{ x: 2, y: 0 },
							{ x: 2, y: 15 },
						]}
						labels={["Now", ""]}
						labelComponent={
							<VictoryLabel
								renderInPortal={false}
								textAnchor="middle"
								dy={-6}
								style={{ fontSize: 10, fill: theme.referenceLineLight }}
							/>
						}
						style={{
							data: {
								stroke: theme.referenceLineLight,
								strokeDasharray: "4 4",
							},
						}}
					/>
					<VictoryArea
						data={throughputData}
						interpolation="monotoneX"
						style={{
							data: {
								stroke: theme.primary,
								strokeWidth: 3,
								fill: theme.areaFill,
								fillOpacity: 0.15,
							},
						}}
					/>
					<VictoryLine
						data={warrantyData}
						interpolation="monotoneX"
						style={{
							data: {
								stroke: theme.warrantyStroke,
								strokeWidth: 2,
							},
						}}
					/>
				</VictoryChart>
			</div>
		</div>
	);
}
