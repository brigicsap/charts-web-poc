"use client";

import {
	VictoryAxis,
	VictoryBar,
	VictoryChart,
	VictoryLegend,
	VictoryStack,
	VictoryTooltip,
} from "victory";
import { useChartTheme } from "../../ChartThemeContext";
import rawData from "../../mockData/exportImportDay.json";

const parsed = rawData.datapoints.map((dp) => {
	const time = dp.from.slice(11, 16);
	const map: Record<string, number | string> = { time };
	for (const c of dp.constituentDatapoints) {
		map[c.type] = c.energy;
	}
	return map;
});

const importData = parsed.map((d) => ({
	x: d.time,
	y: d["grid-import"] ?? 0,
}));
const exportData = parsed.map((d) => ({
	x: d.time,
	y: d["grid-export"] ?? 0,
}));

const xTickValues = ["00:00", "06:00", "12:00", "18:00"];
const xTickFormat = (t: string) => {
	const h = parseInt(t.slice(0, 2));
	if (h === 0) return "12am";
	if (h === 6) return "6am";
	if (h === 12) return "12pm";
	if (h === 18) return "6pm";
	return t;
};

export default function ExportImportBarChart() {
	const { theme } = useChartTheme();
	return (
		<div className="w-full h-80">
			<VictoryChart
				domainPadding={{ x: 10 }}
				padding={{ top: 40, bottom: 40, left: 50, right: 20 }}
			>
				{/* Zero reference line */}
				<VictoryAxis
					tickFormat={() => ""}
					style={{
						axis: { stroke: theme.referenceLine, strokeWidth: 1 },
						ticks: { size: 0 },
						grid: { stroke: "none" },
					}}
				/>
				{/* Labels at bottom */}
				<VictoryAxis
					tickValues={xTickValues}
					tickFormat={xTickFormat}
					offsetY={40}
					style={{
						axis: { stroke: "none" },
						grid: { stroke: "none" },
					}}
				/>
				<VictoryAxis
					dependentAxis
					style={{
						axis: { stroke: "none" },
						tickLabels: { fontSize: 10 },
						grid: { stroke: theme.grid, strokeDasharray: "3 3" },
					}}
					label="£"
				/>
				<VictoryStack>
					<VictoryBar
						data={importData}
						style={{ data: { fill: theme.primary } }}
						labelComponent={<VictoryTooltip />}
					/>
					<VictoryBar
						data={exportData}
						style={{ data: { fill: theme.secondary } }}
						labelComponent={<VictoryTooltip />}
					/>
				</VictoryStack>
				<VictoryLegend
					x={250}
					y={0}
					orientation="horizontal"
					data={[
						{ name: "Import", symbol: { fill: theme.primary } },
						{ name: "Export", symbol: { fill: theme.secondary } },
					]}
				/>
			</VictoryChart>
		</div>
	);
}
