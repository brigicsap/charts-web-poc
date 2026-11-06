import type { BarSeriesOption } from "echarts";

export type ChartSeries = {
  name: string;
  color: string;
  data: (number | null)[];
};

// Build stacked bars with spacing and selection styling for chart interactions.
export function buildStackedSeries(
  series: ChartSeries[],
  selectedIndex: number | null,
  barMaxWidth = 32,
): BarSeriesOption[] {
  const slotCount = series[0]?.data.length ?? 0;
  const totals = Array.from({ length: slotCount }, (_, index) => {
    let positive = 0;
    let negative = 0;
    for (const item of series) {
      const value = item.data[index] ?? 0;
      if (value > 0) positive += value;
      else negative += value;
    }
    return { positive, negative };
  });
  const span =
    Math.max(0, ...totals.map((item) => item.positive)) -
    Math.min(0, ...totals.map((item) => item.negative));
  const gap = span * 0.008;
  return series.flatMap((item, seriesIndex): BarSeriesOption[] => {
    const hasAbove = (index: number, value: number) =>
      series
        .slice(seriesIndex + 1)
        .some((other) => (other.data[index] ?? 0) * value > 0);
    const real: BarSeriesOption = {
      id: item.name,
      name: item.name,
      type: "bar",
      stack: "usage",
      barMaxWidth,
      emphasis: { disabled: true },
      data: item.data.map((value, index) => ({
        value,
        itemStyle: {
          color: item.color,
          opacity: selectedIndex == null || selectedIndex === index ? 1 : 0.3,
          borderRadius:
            value != null && value !== 0 && !hasAbove(index, value)
              ? value > 0
                ? [4, 4, 0, 0]
                : [0, 0, 4, 4]
              : 0,
        },
      })),
    };
    if (seriesIndex === series.length - 1) return [real];
    return [
      real,
      {
        id: `${item.name}__gap`,
        name: `${item.name}__gap`,
        type: "bar",
        stack: "usage",
        barMaxWidth,
        silent: true,
        legendHoverLink: false,
        tooltip: { show: false },
        itemStyle: { color: "transparent" },
        data: item.data.map((value, index) =>
          value != null && value !== 0 && hasAbove(index, value)
            ? Math.sign(value) * gap
            : 0,
        ),
      },
    ];
  });
}
