import { Instant } from "@js-joda/core";
import { formatTimestamp } from "../utils/formatTimestamp";
import type { TradingPerformanceResponse } from "./tradingMockResponses";

export interface MappedTradingData {
  xAxisData: string[];
  committedPowerSeries: (number | null)[];
  dispatchedPowerSeries: (number | null)[];
  dayAheadPriceSeries: (number | null)[];
  imbalancePriceSeries: (number | null)[];
  fcrPriceSeries: (number | null)[];
}

export function mapTradingPerformanceData(
  response: TradingPerformanceResponse,
): MappedTradingData {
  const xAxisData = response.rows.map((row) => {
    const instant = Instant.parse(row.timestamp);
    const date = new Date(instant.toEpochMilli());
    return date.toLocaleTimeString("en-GB", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  });

  return {
    xAxisData,
    committedPowerSeries: response.rows.map((row) => row.committedPower),
    dispatchedPowerSeries: response.rows.map((row) => row.dispatchedPower),
    dayAheadPriceSeries: response.rows.map((row) => row.dayAheadPrice),
    imbalancePriceSeries: response.rows.map((row) => row.imbalancePrice),
    fcrPriceSeries: response.rows.map((row) => row.fcrPrice),
  };
}
