import type { EChartsOption } from "echarts";
import type { ChartPalette } from "../hooks/useChartPalette";

export function baseOption(palette: ChartPalette): EChartsOption {
  return {
    // General
    animation: false,
    backgroundColor: palette.background,
    textStyle: { color: palette.text },

    // Layout & spacing
    grid: { top: 32, bottom: 42, left: 56, right: 24, containLabel: true },

    // Tooltip
    tooltip: {
      trigger: "axis",
      showContent: false,
      axisPointer: {
        type: "shadow",
        shadowStyle: { color: palette.focus, opacity: 0.12 },
      },
    },
  };
}

export function categoryAxes(
  labels: string[],
  palette: ChartPalette,
  formatter?: (value: string) => string,
): EChartsOption["xAxis"] {
  return [
    // Bottom axis (labels)
    {
      type: "category",
      data: labels,
      axisLine: { onZero: false, lineStyle: { color: palette.border } },
      axisTick: { alignWithLabel: true, lineStyle: { color: palette.border } },
      axisLabel: { color: palette.text, formatter, hideOverlap: true },
    },
    // Top axis (border only, no labels)
    {
      type: "category",
      position: "top",
      axisLine: {
        show: true,
        onZero: false,
        lineStyle: { color: palette.border },
      },
      axisLabel: { show: false },
      axisTick: { show: false },
    },
  ];
}

export function valueAxis(
  palette: ChartPalette,
  name: string,
): EChartsOption["yAxis"] {
  return {
    // Value axis configuration
    type: "value",
    name,
    splitNumber: 4,
    axisLine: { show: true, lineStyle: { color: palette.border } },
    axisLabel: { color: palette.text },
    splitLine: { lineStyle: { color: palette.border, type: "dashed" } },
  };
}
