"use client";

import { useState } from "react";
import { ChartThemeProvider, useChartTheme } from "../ChartThemeContext";
import { type ChartThemeName, chartThemes } from "../chartTheme";
import NavLinks from "../NavLinks";
import NotesBox from "../NotesBox";
import BatteryHistoryChart from "./components/BatteryHistoryChart";
import CustomerAppRetention from "./components/CustomerAppRetention";
import EnergyChart from "./components/EnergyChart";
import ThroughputWarrantyLimit from "./components/ThroughputWarrantyLimit";
import WeeklyActiveUsers from "./components/WeeklyActiveUsers";
import { TradingPerformanceChart } from "./components/TradingPerformanceChart";
import { type Scenario, scenarioSchema } from "./data/contracts";
import { DataProvider } from "./data/queries";
import { notes } from "./notes";

function ThemeToggle() {
  const { themeName, setTheme } = useChartTheme();
  return (
    <fieldset className="flex flex-wrap gap-2" aria-label="Chart palette">
      {(Object.keys(chartThemes) as ChartThemeName[]).map((name) => (
        <button
          type="button"
          key={name}
          aria-pressed={themeName === name}
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
    </fieldset>
  );
}

export default function EChartsPage() {
  const [scenario, setScenario] = useState<Scenario>("success");
  return (
    <ChartThemeProvider>
      <DataProvider scenario={scenario}>
        <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
          <main className="flex flex-1 w-full min-w-0 max-w-5xl flex-col items-stretch gap-8 py-12 px-4 bg-white dark:bg-black sm:px-8">
            <NavLinks />
            <div className="flex flex-wrap gap-4 w-full items-center justify-between">
              <h1 className="text-3xl font-semibold tracking-tight text-black dark:text-zinc-50">
                ECharts Prod
              </h1>
              <label className="flex items-center gap-2 text-sm">
                API scenario
                <select
                  aria-label="API scenario"
                  value={scenario}
                  onChange={(event) =>
                    setScenario(scenarioSchema.parse(event.target.value))
                  }
                  className="rounded border border-zinc-300 bg-transparent px-2 py-1"
                >
                  <option value="success">Success</option>
                  <option value="slow">Slow</option>
                  <option value="empty">Empty</option>
                  <option value="gaps">Missing intervals</option>
                  <option value="error">Server error</option>
                  <option value="invalid">Invalid response</option>
                </select>
              </label>
              <ThemeToggle />
            </div>
            <NotesBox content={notes} />
            <h2 className="text-xl font-medium text-black dark:text-zinc-200">
              Home Usage
            </h2>
            <EnergyChart kind="home-usage" />
            <h2 className="text-xl font-medium text-black dark:text-zinc-200">
              Export / Import
            </h2>
            <EnergyChart kind="import-export" />
            <h2 className="text-xl font-medium text-black dark:text-zinc-200">
              Battery History
            </h2>
            <BatteryHistoryChart />
            <h2 className="text-xl font-medium text-black dark:text-zinc-200">
              Customer App Retention
            </h2>
            <CustomerAppRetention />
            <h2 className="text-xl font-medium text-black dark:text-zinc-200">
              Weekly Active Users
            </h2>
            <WeeklyActiveUsers />
            <h2 className="text-xl font-medium text-black dark:text-zinc-200">
              Throughput consumed vs warranty limit over time
            </h2>
            <ThroughputWarrantyLimit />
            <h2 className="text-xl font-medium text-black dark:text-zinc-200">
              Trading Performance
            </h2>
            <TradingPerformanceChart date="2026-04-22" />
          </main>
        </div>
      </DataProvider>
    </ChartThemeProvider>
  );
}
