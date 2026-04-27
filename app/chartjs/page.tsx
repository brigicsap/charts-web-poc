"use client";

import { ChartThemeProvider, useChartTheme } from "../ChartThemeContext";
import { type ChartThemeName, chartThemes } from "../chartTheme";
import NavLinks from "../NavLinks";
import NotesBox from "../NotesBox";
import BatteryHistoryChart from "./components/BatteryHistoryChart";
import ExportImportBarChart from "./components/ExportImportBarChart";
import HomeUsageChart from "./components/HomeUsageChart";
import SavingsChart from "./components/SavingsChart";
import ThroughputWarrantyLimit from "./components/ThroughputWarrantyLimit";
import { notes } from "./notes";

function ThemeToggle() {
	const { themeName, setTheme } = useChartTheme();
	return (
		<div className="flex gap-2">
			{(Object.keys(chartThemes) as ChartThemeName[]).map((name) => (
				<button
					type="button"
					key={name}
					onClick={() => setTheme(name)}
					className={`px-3 py-1 rounded text-sm ${
						themeName === name
							? "bg-black text-white dark:bg-white dark:text-black"
							: "bg-zinc-200 text-zinc-700 dark:bg-zinc-700 dark:text-zinc-200"
					}`}
				>
					{name}
				</button>
			))}
		</div>
	);
}

export default function ChartJsPage() {
	return (
		<ChartThemeProvider>
			<div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
				<main className="flex flex-1 w-full max-w-3xl flex-col items-center gap-8 py-32 px-16 bg-white dark:bg-black sm:items-start">
					<NavLinks />
					<div className="flex w-full items-center justify-between">
						<h1 className="text-3xl font-semibold tracking-tight text-black dark:text-zinc-50">
							Chart.js
						</h1>
						<ThemeToggle />
					</div>
					<NotesBox content={notes} />

					<h2 className="text-xl font-medium text-black dark:text-zinc-200">
						Home Usage
					</h2>
					<HomeUsageChart />

					<h2 className="text-xl font-medium text-black dark:text-zinc-200">
						Export / Import
					</h2>
					<ExportImportBarChart />

					<h2 className="text-xl font-medium text-black dark:text-zinc-200">
						Battery History
					</h2>
					<BatteryHistoryChart />

					<h2 className="text-xl font-medium text-black dark:text-zinc-200">
						Throughput consumed vs warranty limit over time
					</h2>
					<ThroughputWarrantyLimit />

					<h2 className="text-xl font-medium text-black dark:text-zinc-200">
						Savings
					</h2>
					<SavingsChart />
				</main>
			</div>
		</ChartThemeProvider>
	);
}
