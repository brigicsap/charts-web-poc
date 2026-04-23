"use client";

import {
	VictoryArea,
	VictoryAxis,
	VictoryChart,
	VictoryLine,
	VictoryTooltip,
	VictoryVoronoiContainer,
} from "victory";
import { useChartTheme } from "../../ChartThemeContext";

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
	return (
		<div className="w-full h-80">
			<VictoryChart
				padding={{ top: 40, bottom: 40, left: 60, right: 60 }}
				domain={{ x: [1, 10], y: [0, 15] }}
				containerComponent={
					<VictoryVoronoiContainer
						labels={({ datum }: { datum: { y: number } }) => `${datum.y} MWh`}
						labelComponent={<VictoryTooltip />}
					/>
				}
			>
				<VictoryAxis
					tickValues={[1, 2, 10]}
					tickFormat={(v: number) => `Yr${v}`}
					style={{ grid: { stroke: "none" } }}
				/>
				<VictoryAxis
					dependentAxis
					tickValues={[0, 14, 15]}
					tickFormat={(v: number) => `${v} MWh`}
					style={{
						axis: { stroke: "none" },
						grid: { stroke: theme.grid, strokeDasharray: "3 3" },
					}}
				/>
				{/* Reference lines */}
				<VictoryLine
					data={[
						{ x: 9, y: 0 },
						{ x: 9, y: 15 },
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
						{ x: 1, y: 15 },
						{ x: 10, y: 15 },
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
	);
}
