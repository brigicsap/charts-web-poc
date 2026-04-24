"use client";

import { useRef, useState } from "react";
import {
	VictoryAxis,
	VictoryBar,
	VictoryChart,
	VictoryLegend,
	VictoryLine,
} from "victory";
import { useChartTheme } from "../../ChartThemeContext";
import rawData from "../../mockData/batteryHistoryMockDay.json";

// Build ordered data using numeric indices so Victory uses a continuous scale
const orderedData = rawData.datapoints.map((dp, i) => ({
	index: i,
	time: dp.timestamp.slice(11, 16),
	value: dp.batteryPercentage as number | null,
}));

// Split into segments (non-null runs) for gap behavior
function buildSegments() {
	const segments: { x: number; y: number }[][] = [];
	let current: { x: number; y: number }[] = [];
	for (const d of orderedData) {
		if (d.value != null) {
			current.push({ x: d.index, y: d.value });
		} else {
			if (current.length > 0) {
				segments.push(current);
				current = [];
			}
		}
	}
	if (current.length > 0) segments.push(current);
	return segments;
}

const segments = buildSegments();
const allPoints = segments.flat();

// Find null gaps for "no data" indicator
function buildNullGaps() {
	const gaps: { startIndex: number; endIndex: number }[] = [];
	let gapStart: number | null = null;
	for (const d of orderedData) {
		if (d.value == null) {
			if (gapStart == null) gapStart = d.index;
		} else {
			if (gapStart != null) {
				gaps.push({ startIndex: gapStart, endIndex: d.index - 1 });
				gapStart = null;
			}
		}
	}
	if (gapStart != null) {
		gaps.push({ startIndex: gapStart, endIndex: orderedData.length - 1 });
	}
	return gaps;
}

const nullGaps = buildNullGaps();

// Build bar data for each null gap — one bar per gap spanning its range
const noDataBars = nullGaps.map((gap) => ({
	x: (gap.startIndex + gap.endIndex) / 2,
	y: 100,
	width: gap.endIndex - gap.startIndex + 1,
}));

// Tick positions: 00:00=0, 06:00=24, 12:00=48, 18:00=72
const xTickValues = [0, 24, 48, 72];
const xTickLabels = ["12am", "6am", "12pm", "6pm"];

// Chart layout constants (must match VictoryChart padding)
const PADDING = { top: 40, bottom: 40, left: 50, right: 20 };
const CHART_WIDTH = 450; // Victory default
const CHART_HEIGHT = 300; // Victory default
const PLOT_WIDTH = CHART_WIDTH - PADDING.left - PADDING.right;
const PLOT_HEIGHT = CHART_HEIGHT - PADDING.top - PADDING.bottom;

function xToPixel(x: number) {
	return PADDING.left + (x / 95) * PLOT_WIDTH;
}
function yToPixel(y: number) {
	return PADDING.top + ((100 - y) / 100) * PLOT_HEIGHT;
}

export default function BatteryHistoryChart() {
	const { theme } = useChartTheme();
	const containerRef = useRef<HTMLDivElement>(null);
	const [cursor, setCursor] = useState<{
		px: number;
		point: { x: number; y: number };
	} | null>(null);

	const handleMouseMove = (e: React.MouseEvent) => {
		const container = containerRef.current;
		if (!container) return;
		const rect = container.getBoundingClientRect();
		const svgX = ((e.clientX - rect.left) / rect.width) * CHART_WIDTH;
		// Convert pixel to data x
		const dataX = ((svgX - PADDING.left) / PLOT_WIDTH) * 95;
		if (dataX < 0 || dataX > 95) {
			setCursor(null);
			return;
		}
		// Find nearest point
		let nearest = allPoints[0];
		let minDist = Infinity;
		for (const p of allPoints) {
			const dist = Math.abs(p.x - dataX);
			if (dist < minDist) {
				minDist = dist;
				nearest = p;
			}
		}
		setCursor({ px: svgX, point: nearest });
	};

	return (
		<div
			ref={containerRef}
			className="w-full h-80 relative"
			role="img"
			onMouseMove={handleMouseMove}
			onMouseLeave={() => setCursor(null)}
		>
			<VictoryChart padding={PADDING} domain={{ x: [0, 95], y: [0, 100] }}>
				<VictoryAxis
					tickValues={xTickValues}
					tickFormat={xTickLabels}
					style={{ grid: { stroke: "none" } }}
				/>
				<VictoryAxis
					dependentAxis
					tickValues={[0, 25, 50, 75, 100]}
					tickFormat={(t: number) => `${t}%`}
					style={{
						grid: { stroke: theme.grid, strokeDasharray: "3 3" },
						axis: { stroke: "none" },
					}}
				/>
				<VictoryBar
					data={noDataBars}
					barWidth={({ datum }) => datum.width * (PLOT_WIDTH / 95)}
					style={{
						data: { fill: "#e0e0e0", opacity: 0.4 },
					}}
				/>
				{segments.map((seg, i) => (
					<VictoryLine
						key={`seg-${
							// biome-ignore lint/suspicious/noArrayIndexKey: just a POC, don't do this at home kids
							i
						}`}
						data={seg}
						interpolation="monotoneX"
						style={{
							data: { stroke: theme.primary, strokeWidth: 2 },
						}}
					/>
				))}
				<VictoryLegend
					x={280}
					y={0}
					orientation="horizontal"
					data={[{ name: "Battery", symbol: { fill: theme.primary } }]}
				/>
			</VictoryChart>
			{cursor && (
				<svg
					className="absolute inset-0 w-full h-full pointer-events-none"
					viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
					preserveAspectRatio="none"
				>
					<title>Battery History Cursor</title>
					<line
						x1={xToPixel(cursor.point.x)}
						y1={PADDING.top}
						x2={xToPixel(cursor.point.x)}
						y2={CHART_HEIGHT - PADDING.bottom}
						stroke={theme.secondary}
						strokeWidth={1}
						strokeDasharray="4 4"
					/>
					<circle
						cx={xToPixel(cursor.point.x)}
						cy={yToPixel(cursor.point.y)}
						r={5}
						fill={theme.secondary}
						stroke="white"
						strokeWidth={2}
					/>
				</svg>
			)}
		</div>
	);
}
