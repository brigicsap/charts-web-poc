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
import rawData from "../../mockData/homeUsageMockDay.json";

const parsed = rawData.datapoints.map((dp) => {
	const time = dp.from.slice(11, 16);
	const map: Record<string, number | string> = { time };
	for (const c of dp.constituentDatapoints) {
		map[c.type] = c.energy;
	}
	return map;
});

const solarData = parsed.map((d) => ({
	x: d.time,
	y: d["solar-consumption"] ?? 0,
}));
const gridData = parsed.map((d) => ({
	x: d.time,
	y: d["grid-consumption"] ?? 0,
}));
const batteryData = parsed.map((d) => ({
	x: d.time,
	y: d["battery-consumption"] ?? 0,
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

export default function BarChartDemo() {
	const { theme } = useChartTheme();
	return (
		<div className="w-full h-80">
			<VictoryChart
				domainPadding={{ x: 10 }}
				padding={{ top: 40, bottom: 40, left: 50, right: 20 }}
			>
				<VictoryAxis
					tickValues={xTickValues}
					tickFormat={xTickFormat}
					style={{ grid: { stroke: "none" } }}
				/>
				<VictoryAxis
					dependentAxis
					style={{
						axis: { stroke: "none" },
						tickLabels: { fontSize: 10 },
						grid: { stroke: theme.grid, strokeDasharray: "3 3" },
					}}
					label="kWh"
					axisLabelComponent={<></>}
				/>
				<VictoryStack>
					<VictoryBar
						data={solarData}
						style={{ data: { fill: theme.secondary } }}
						labelComponent={<VictoryTooltip />}
					/>
					<VictoryBar
						data={gridData}
						style={{ data: { fill: theme.tertiary } }}
						labelComponent={<VictoryTooltip />}
					/>
					<VictoryBar
						data={batteryData}
						style={{ data: { fill: theme.primary } }}
						labelComponent={<VictoryTooltip />}
					/>
				</VictoryStack>
				<VictoryLegend
					x={230}
					y={0}
					orientation="horizontal"
					gutter={20}
					data={[
						{ name: "Solar", symbol: { fill: theme.secondary } },
						{ name: "Grid", symbol: { fill: theme.tertiary } },
						{ name: "Battery", symbol: { fill: theme.primary } },
					]}
				/>
			</VictoryChart>
		</div>
	);
}
