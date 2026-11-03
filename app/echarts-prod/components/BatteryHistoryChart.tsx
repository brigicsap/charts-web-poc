"use client";

import type { EChartsOption, LineSeriesOption } from "echarts";
import { useState } from "react";
import type { BatteryResponse, Resolution } from "../data/contracts";
import {
  formatChartTimestamp,
  formatDateRange,
  INITIAL_DATE,
  moveDate,
} from "../data/dates";
import { mapBatteryChart } from "../data/mappers";
import { useBatteryData, useChartPalette } from "../hooks";
import { getMissingRanges } from "../utils";
import Chart from "./Chart";
import { baseOption, categoryAxes, valueAxis } from "./chartOptions";
import { DataControls, DataDetails, DataState } from "./DataControls";
import LegendValues from "./LegendValues";

function BatteryPlot({ response }: { response: BatteryResponse }) {
  const palette = useChartPalette();
  const data = mapBatteryChart(response);
  const view = response.resolution;
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(data.latest);
  const value = focusedIndex == null ? null : data.values[focusedIndex];
  const axes = categoryAxes(data.labels, palette, (timestamp) =>
    formatChartTimestamp(timestamp, view),
  );
  if (Array.isArray(axes)) {
    axes[0] = {
      ...axes[0],
      type: "category",
      boundaryGap: false,
      axisLabel: {
        color: palette.text,
        formatter: (timestamp: string) => formatChartTimestamp(timestamp, view),
        interval: view === "day" ? 23 : 95,
      },
      axisTick: { interval: view === "day" ? 23 : 95 },
    };
  }
  const series: LineSeriesOption[] = [
    // Main battery line with missing data indicators
    {
      name: "Battery",
      type: "line",
      data: data.values,
      smooth: true,
      connectNulls: false,
      symbol: "none",
      z: 0,
      lineStyle: { color: palette.battery, width: 2 },
      itemStyle: { color: palette.battery },
      markArea: {
        silent: true,
        itemStyle: { color: palette.missing, opacity: 0.35 },
        data: getMissingRanges(data.values).map(([start, end]) => [
          { xAxis: data.labels[start] },
          { xAxis: data.labels[Math.min(end + 1, data.labels.length - 1)] },
        ]),
      },
    },
    // Hover halo effect (large transparent circle on hover)
    {
      name: "Battery halo",
      type: "line",
      data: data.values,
      silent: true,
      showSymbol: false,
      symbol: "circle",
      symbolSize: 22,
      lineStyle: { opacity: 0 },
      emphasis: {
        scale: false,
        itemStyle: { color: palette.battery, opacity: 0.2 },
      },
      z: 2,
    },
    // Focus indicator (small circle at hover point)
    {
      name: "Battery focus",
      type: "line",
      data: data.values,
      silent: true,
      showSymbol: false,
      symbol: "circle",
      symbolSize: 13,
      lineStyle: { opacity: 0 },
      emphasis: {
        scale: false,
        itemStyle: {
          color: palette.focus,
          borderColor: palette.background,
          borderWidth: 2,
        },
      },
      z: 3,
    },
  ];
  const option: EChartsOption = {
    ...baseOption(palette),
    // Axes
    xAxis: axes,
    yAxis: { ...valueAxis(palette, "%"), min: 0, max: 100, interval: 25 },
    // Tooltip
    tooltip: {
      trigger: "axis",
      showContent: false,
      axisPointer: {
        type: "line",
        z: 1,
        lineStyle: { color: palette.focus, type: "dashed", width: 2 },
      },
    },
    // Data series
    series,
  };
  return (
    <>
      <LegendValues
        isInteractive
        items={[
          {
            label: "Battery",
            color: palette.battery,
            valueText: value == null ? "No data" : `${value.toFixed(1)}%`,
          },
        ]}
      />
      <Chart
        option={option}
        interaction="line"
        selectedIndex={selectedIndex}
        onSelect={setSelectedIndex}
        onFocus={setFocusedIndex}
        initialIndex={data.latest}
        maxInteractiveIndex={data.latest}
      />
    </>
  );
}

export default function BatteryHistoryChart() {
  const [date, setDate] = useState(INITIAL_DATE);
  const [resolution, setResolution] = useState<Resolution>("day");
  const query = useBatteryData({ date, resolution });
  const ready =
    query.data && !query.isError && query.data.datapoints.length > 0;
  return (
    <section className="w-full min-w-0 space-y-3" aria-label="Battery History">
      <DataControls
        date={date}
        resolution={resolution}
        onDateChange={setDate}
        onResolutionChange={setResolution}
        onPrevious={() => setDate(moveDate(date, resolution, -1))}
        onNext={() => setDate(moveDate(date, resolution, 1))}
        onRefresh={() => {
          void query.refetch();
        }}
        fetching={query.isFetching}
      />
      {query.data && (
        <p className="text-sm tabular-nums text-zinc-500">
          {formatDateRange(query.data.range.from, query.data.range.to)} (
          {query.data.timezone})
        </p>
      )}
      <DataState
        pending={query.isPending}
        error={query.error}
        empty={!query.isPending && !query.data?.datapoints.length}
        retry={() => {
          void query.refetch();
        }}
      />
      {ready && <BatteryPlot key={query.request.url} response={query.data} />}
      <DataDetails
        request={query.request.url}
        response={query.data ?? null}
        mapped={query.data ? mapBatteryChart(query.data) : null}
      />
    </section>
  );
}
