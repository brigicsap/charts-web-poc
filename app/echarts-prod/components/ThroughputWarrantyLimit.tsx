"use client";

import { useState } from "react";
import { useChartPalette } from "../hooks";
import Chart from "./Chart";
import { baseOption, categoryAxes, valueAxis } from "./chartOptions";
import LegendValues from "./LegendValues";

const throughput = [1.1, 2.4, 3.8, 5.1, 6.3, 7.6, 8.9, 10.1, 11.4, 12];
const warranty = [15, 14.5, 14, 13.5, 13, 12.5, 12, 11.5, 11, 10.5];
const labels = throughput.map((_, index) => `Yr${index + 1}`);

export default function ThroughputWarrantyLimit() {
  const palette = useChartPalette();
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(1);
  const focus = focusedIndex ?? 1;
  return (
    <div className="w-full min-w-0 space-y-3">
      <LegendValues
        isInteractive
        items={[
          {
            label: "Throughput",
            color: palette.battery,
            valueText: `${throughput[focus].toFixed(2)} MWh`,
          },
          {
            label: "Warranty",
            color: palette.warranty,
            valueText: `${warranty[focus].toFixed(2)} MWh`,
          },
        ]}
      />
      <Chart
        interaction="line"
        selectedIndex={selectedIndex}
        onSelect={setSelectedIndex}
        onFocus={setFocusedIndex}
        initialIndex={1}
        maxInteractiveIndex={labels.length - 1}
        option={{
          ...baseOption(palette),
          // Axes
          xAxis: categoryAxes(labels, palette),
          yAxis: { ...valueAxis(palette, "MWh"), min: 0, max: 15 },
          // Tooltip
          tooltip: {
            trigger: "axis",
            showContent: false,
            axisPointer: {
              type: "line",
              lineStyle: { color: palette.focus, type: "dashed" },
            },
          },
          // Data series
          series: [
            // Throughput line with limit markers
            {
              name: "Throughput",
              type: "line",
              data: throughput,
              smooth: true,
              showSymbol: false,
              symbol: "circle",
              symbolSize: 10,
              lineStyle: { color: palette.battery, width: 3 },
              itemStyle: { color: palette.battery },
              areaStyle: { color: palette.battery, opacity: 0.15 },
              markLine: {
                silent: true,
                symbol: "none",
                lineStyle: { type: "dashed" },
                data: [
                  {
                    xAxis: 8,
                    lineStyle: { color: palette.alert },
                    label: { formatter: "Limit hit", color: palette.alert },
                  },
                  {
                    xAxis: 1,
                    lineStyle: { color: palette.border },
                    label: { formatter: "Now", color: palette.text },
                  },
                ],
              },
            },
            // Warranty line
            {
              name: "Warranty",
              type: "line",
              data: warranty,
              smooth: true,
              showSymbol: false,
              symbol: "circle",
              symbolSize: 8,
              lineStyle: { color: palette.warranty, width: 2 },
              itemStyle: { color: palette.warranty },
            },
          ],
        }}
      />
    </div>
  );
}
