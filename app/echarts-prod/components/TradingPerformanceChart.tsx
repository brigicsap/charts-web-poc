"use client";

import { useMemo } from "react";
import type { EChartsOption } from "echarts";
import Chart from "./Chart";
import { baseOption, categoryAxes, valueAxis } from "./chartOptions";
import { mapTradingPerformanceData } from "../data/tradingMappers";
import { useTradingPerformance, useChartPalette } from "../hooks";

interface TradingPerformanceChartProps {
  date: string;
  onHover?: (index: number | null) => void;
  onClick?: (index: number | null) => void;
}

export function TradingPerformanceChart({
  date,
  onHover,
  onClick,
}: TradingPerformanceChartProps) {
  const { data, isLoading } = useTradingPerformance(date);
  const palette = useChartPalette();

  // Build chart options from data
  const options = useMemo<EChartsOption | null>(() => {
    if (!data || !palette) return null;

    const mapped = mapTradingPerformanceData(data);

    // Dual-axis configuration for power (left) and price (right)
    const chartOptions: EChartsOption = {
      ...baseOption(palette),
      animation: false,
      grid: {
        top: 16,
        right: 80,
        bottom: 40,
        left: 60,
        containLabel: false,
      },
      tooltip: {
        trigger: "axis",
        triggerOn: "mousemove|click",
        showContent: true,
        backgroundColor: "rgba(50, 50, 50, 0.9)",
        borderColor: "#555",
        textStyle: { color: "#fff" },
        axisPointer: {
          type: "line",
          lineStyle: {
            color: palette.grid,
            type: "dashed",
            width: 1,
          },
        },
      },
      xAxis: categoryAxes(mapped.xAxisData, palette),
      yAxis: [
        // Left axis: Power (kW)
        {
          ...valueAxis(palette, data.powerUnit || "Power (kW)"),
          position: "left" as const,
        },
        // Right axis: Price (£/kWh)
        {
          ...valueAxis(
            palette,
            `Price (£/${data.priceDenominatorUnit || "kWh"})`,
          ),
          position: "right" as const,
        },
      ],
      series: [
        // Power series (left axis - index 0)
        {
          name: "Committed Power",
          data: mapped.committedPowerSeries,
          type: "line",
          smooth: true,
          yAxisIndex: 0,
          showSymbol: false,
          itemStyle: { color: "#4F46E5" },
          areaStyle: { color: "rgba(79, 70, 229, 0.1)" },
          lineStyle: { width: 2 },
        },
        {
          name: "Dispatched Power",
          data: mapped.dispatchedPowerSeries,
          type: "line",
          smooth: true,
          yAxisIndex: 0,
          showSymbol: false,
          itemStyle: { color: "#10B981" },
          lineStyle: { width: 2 },
        },
        // Price series (right axis - index 1)
        {
          name: "Day-Ahead Price",
          data: mapped.dayAheadPriceSeries,
          type: "line",
          smooth: false,
          yAxisIndex: 1,
          showSymbol: false,
          itemStyle: { color: "#F59E0B" },
          lineStyle: { width: 1.5 },
        },
        {
          name: "Imbalance Price",
          data: mapped.imbalancePriceSeries,
          type: "line",
          smooth: false,
          yAxisIndex: 1,
          showSymbol: false,
          itemStyle: { color: "#EF4444" },
          lineStyle: { width: 1.5 },
        },
        {
          name: "FCR Price",
          data: mapped.fcrPriceSeries,
          type: "line",
          smooth: false,
          yAxisIndex: 1,
          showSymbol: false,
          itemStyle: { color: "#8B5CF6" },
          lineStyle: { width: 1.5 },
        },
      ],
    };

    return chartOptions;
  }, [data, palette]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-80 bg-slate-50 rounded">
        <p className="text-slate-500">Loading trading performance...</p>
      </div>
    );
  }

  if (!options) {
    return (
      <div className="flex items-center justify-center h-80 bg-slate-50 rounded">
        <p className="text-slate-500">No data available</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <h2 className="text-lg font-semibold mb-4 text-slate-900">
        Trading Performance
      </h2>
      <p className="text-sm text-slate-600 mb-4">
        Committed vs dispatched power (left axis) and pricing data (right axis)
      </p>
      <Chart option={options} onFocus={onHover} onSelect={onClick} />
    </div>
  );
}
