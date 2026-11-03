import type { EChartsType } from "echarts";

export function applyChartHighlight(
  chart: EChartsType,
  index: number | null,
  isLineInteraction: boolean,
) {
  chart.dispatchAction({ type: "downplay" });
  if (index == null) {
    chart.dispatchAction({ type: "hideTip" });
  } else {
    chart.dispatchAction({
      type: "showTip",
      seriesIndex: 0,
      dataIndex: index,
    });
    if (isLineInteraction) {
      chart.dispatchAction({ type: "highlight", dataIndex: index });
    }
  }
}
