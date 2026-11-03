"use client";

import type { CustomSeriesRenderItemAPI } from "echarts";
import { useMemo } from "react";
import rawData from "../../mockData/customerAppRetention.json";
import { useChartPalette } from "../hooks";
import Chart from "./Chart";
import { baseOption } from "./chartOptions";
import LegendValues from "./LegendValues";

type RetentionData = {
  [key: string]: string;
};

export default function CustomerAppRetention() {
  const palette = useChartPalette();

  const funnelData = useMemo(() => {
    if (!rawData || rawData.length === 0) return [];

    const data = rawData[0] as RetentionData;
    const stages = [
      "All homes",
      "Has app session",
      "Active after 1 day",
      "Active after 7 days",
      "Active after 14 days",
      "Active after 30 days",
    ];

    return stages.map((stage) => ({
      name: stage,
      value: Number.parseInt(data[stage] || "0", 10),
    }));
  }, []);

  const transitionData = useMemo(
    () =>
      funnelData.slice(0, -1).map((item, index) => {
        const next = funnelData[index + 1];
        const pctChange =
          item.value === 0 ? 0 : ((next.value - item.value) / item.value) * 100;
        const sign = pctChange > 0 ? "+" : "";
        return {
          fromIndex: index,
          fromValue: item.value,
          toValue: next.value,
          label: `${sign}${pctChange.toFixed(1)}%`,
        };
      }),
    [funnelData],
  );

  return (
    <div className="w-full min-w-0 space-y-3">
      <LegendValues
        items={funnelData.map((item, index) => ({
          label: item.name,
          color: palette.retention[index],
          valueText: item.value.toLocaleString("en-GB"),
        }))}
      />
      <Chart
        height={360}
        option={{
          ...baseOption(palette),
          color: palette.retention,
          // Tooltip
          tooltip: { trigger: "axis", axisPointer: { type: "shadow" } },
          // Layout & spacing
          grid: {
            top: 60,
            left: 50,
            right: 20,
            bottom: 30,
          },
          // Axes
          xAxis: {
            type: "category",
            data: funnelData.map((item) => item.name),
            axisLabel: { show: false },
            axisTick: { show: false },
            axisLine: { show: false },
          },
          yAxis: {
            type: "value",
            max: (value: { max: number }) => Math.ceil(value.max * 1.2),
            axisLabel: { color: palette.text },
            splitLine: { lineStyle: { type: "dashed", color: palette.border } },
          },
          // Data series
          series: [
            // Stacked retention bars
            ...funnelData.map((item, index) => {
              const color = palette.retention[index];
              return {
                name: item.name,
                type: "bar" as const,
                stack: "retention",
                barWidth: "100%",
                barCategoryGap: "0%",
                barGap: "0%",
                itemStyle: {
                  color,
                  borderRadius: [4, 4, 0, 0],
                },
                label: {
                  show: true,
                  position: "top" as const,
                  formatter: `${item.value}`,
                  color,
                  fontWeight: 600,
                },
                data: funnelData.map((_, slotIndex) =>
                  slotIndex === index ? item.value : null,
                ),
              };
            }),
            // Transition flow lines with percentage change
            {
              name: "Transition",
              type: "custom",
              silent: true,
              tooltip: { show: false },
              data: transitionData.map((t) => [
                t.fromIndex,
                t.fromValue,
                t.toValue,
                t.label,
              ]),
              renderItem: (
                _params: unknown,
                api: CustomSeriesRenderItemAPI,
              ) => {
                const fromIndex = Number(api.value(0));
                const fromValue = Number(api.value(1));
                const toValue = Number(api.value(2));
                const label = String(api.value(3));

                const yValue = Math.min(fromValue, toValue) * 0.72;
                const fromCoord = api.coord([fromIndex, yValue]);
                const toCoord = api.coord([fromIndex + 1, yValue]);

                const y = fromCoord[1];
                const x1 = fromCoord[0] + 10;
                const x2 = toCoord[0] - 10;
                const arrowSize = 6;

                return {
                  type: "group",
                  children: [
                    {
                      type: "line",
                      shape: { x1, y1: y, x2, y2: y },
                      style: { stroke: "#ffffff", lineWidth: 1.5 },
                    },
                    {
                      type: "polygon",
                      shape: {
                        points: [
                          [x2, y],
                          [x2 - arrowSize, y - arrowSize / 2],
                          [x2 - arrowSize, y + arrowSize / 2],
                        ],
                      },
                      style: { fill: "#ffffff" },
                    },
                    {
                      type: "text",
                      style: {
                        x: (x1 + x2) / 2,
                        y: y - 4,
                        text: label,
                        textAlign: "center",
                        textVerticalAlign: "bottom",
                        fill: "#ffffff",
                        fontSize: 11,
                        fontWeight: 600,
                      },
                    },
                  ],
                };
              },
              z: 20,
            },
          ],
        }}
      />
    </div>
  );
}
