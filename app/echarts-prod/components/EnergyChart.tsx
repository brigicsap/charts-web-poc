"use client";

import { useState } from "react";
import type { EnergyResponse, Resolution } from "../data/contracts";
import {
	formatChartTimestamp,
	formatDateRange,
	INITIAL_DATE,
} from "../data/dates";
import { mapEnergyChart, type Unit } from "../data/mappers";
import { useEnergyData } from "../data/queries";
import Chart from "./Chart";
import {
	baseOption,
	categoryAxes,
	useChartPalette,
	valueAxis,
} from "./chartOptions";
import { DataControls, DataDetails, DataState } from "./DataControls";
import LegendValues from "./LegendValues";
import { buildStackedSeries } from "./utils";

function EnergyPlot({
	response,
	unit,
}: {
	response: EnergyResponse;
	unit: Unit;
}) {
	const palette = useChartPalette();
	const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
	const mapped = mapEnergyChart(response, unit);
	const appearances = {
		"solar-consumption": { name: "Solar", color: palette.solar },
		"battery-consumption": { name: "Battery", color: palette.battery },
		"grid-consumption": { name: "Grid", color: palette.grid },
		"grid-import": { name: "Import", color: palette.gridImport },
		"grid-export": { name: "Export", color: palette.gridExport },
	};
	const series = mapped.series.map((item) => ({
		...item,
		...appearances[item.type],
	}));
	const format = (value: number | null) =>
		value == null
			? "No data"
			: unit === "cost"
				? new Intl.NumberFormat("en-GB", {
						style: "currency",
						currency: "GBP",
					}).format(value)
				: `${value.toFixed(2)} kWh`;
	return (
		<>
			<LegendValues
				isInteractive={selectedIndex != null}
				items={series.map((item) => ({
					label: item.name,
					color: item.color,
					valueText: format(
						selectedIndex == null ? item.summary : item.data[selectedIndex],
					),
				}))}
			/>
			<Chart
				interaction="bar"
				selectedIndex={selectedIndex}
				onSelect={setSelectedIndex}
				maxInteractiveIndex={response.datapoints.length - 1}
				option={{
					...baseOption(palette),
					xAxis: categoryAxes(mapped.labels, palette, (value) =>
						formatChartTimestamp(value, response.resolution),
					),
					yAxis: valueAxis(palette, unit === "cost" ? "£" : "kWh"),
					series: buildStackedSeries(
						series,
						selectedIndex,
						response.resolution === "day" ? 8 : 40,
					),
				}}
			/>
		</>
	);
}

export default function EnergyChart({
	kind,
}: {
	kind: "home-usage" | "import-export";
}) {
	const [date, setDate] = useState(INITIAL_DATE);
	const [resolution, setResolution] = useState<Resolution>("day");
	const [unit, setUnit] = useState<Unit>("energy");
	const query = useEnergyData(kind, { date, resolution });
	const previous = query.data?.pagination.previous.at(-1);
	const next = query.data?.pagination.next[0];
	const ready =
		query.data && !query.isError && query.data.datapoints.length > 0;
	return (
		<section
			className="w-full min-w-0 space-y-3"
			aria-label={kind === "home-usage" ? "Home Usage" : "Export / Import"}
		>
			<DataControls
				date={date}
				resolution={resolution}
				onDateChange={setDate}
				onResolutionChange={(value) => {
					const linked = query.data?.pagination.resolutions[value];
					if (linked) setDate(linked.from.substring(0, 10));
					setResolution(value);
				}}
				onPrevious={
					previous ? () => setDate(previous.from.substring(0, 10)) : undefined
				}
				onNext={next ? () => setDate(next.from.substring(0, 10)) : undefined}
				onRefresh={() => {
					void query.refetch();
				}}
				fetching={query.isFetching}
			/>
			{query.data && (
				<p className="text-sm tabular-nums text-zinc-500">
					{formatDateRange(
						query.data.pagination.current.from,
						query.data.pagination.current.to,
					)}
				</p>
			)}
			{kind === "import-export" && (
				<fieldset className="flex gap-1" aria-label="Unit">
					{(["energy", "cost"] as const).map((value) => (
						<button
							key={value}
							type="button"
							aria-pressed={unit === value}
							onClick={() => setUnit(value)}
							className={`rounded px-3 py-1 text-sm ${unit === value ? "bg-zinc-800 text-white" : "bg-zinc-200 text-zinc-700"}`}
						>
							{value === "energy" ? "kWh" : "£"}
						</button>
					))}
				</fieldset>
			)}
			<DataState
				pending={query.isPending}
				error={query.error}
				empty={!query.isPending && !query.data?.datapoints.length}
				retry={() => {
					void query.refetch();
				}}
			/>
			{ready && (
				<EnergyPlot
					key={`${query.request.url}:${unit}`}
					response={query.data}
					unit={unit}
				/>
			)}
			<DataDetails
				request={query.request.url}
				response={query.data ?? null}
				mapped={query.data ? mapEnergyChart(query.data, unit) : null}
			/>
		</section>
	);
}
