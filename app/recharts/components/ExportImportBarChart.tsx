"use client";

import {
	Bar,
	BarChart,
	CartesianGrid,
	Legend,
	ReferenceLine,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";
import { useChartTheme } from "../../ChartThemeContext";
import rawData from "../../mockData/exportImportDay.json";

const data = rawData.datapoints.map((dp) => {
	const time = dp.from.slice(11, 16);
	const entry: Record<string, string | number> = { time };
	for (const c of dp.constituentDatapoints) {
		entry[c.type] = c.energy;
	}
	return entry;
});

export default function ExportImportBarChart() {
	const { theme } = useChartTheme();
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
						ticks={["00:00", "06:00", "12:00", "18:00"]}
						tickSize={12}
						padding={{ left: 10 }}
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
						tickMargin={6}
						fontSize={14}
						label={{
							value: "£",
							position: "top",
							offset: 15,
						}}
					/>
					<Tooltip />
					<ReferenceLine y={0} stroke={theme.referenceLine} strokeWidth={1} />
					<Legend verticalAlign="top" align="right" />
					<Bar
						xAxisId="bottom"
						dataKey="grid-import"
						stackId="a"
						fill={theme.primary}
						name="Import"
						radius={[10, 10, 0, 0]}
					/>
					<Bar
						xAxisId="bottom"
						dataKey="grid-export"
						stackId="a"
						fill={theme.secondary}
						name="Export"
						radius={[10, 10, 0, 0]}
					/>
				</BarChart>
			</ResponsiveContainer>
		</div>
	);
}
