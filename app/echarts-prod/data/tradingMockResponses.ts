import { Instant, LocalDate, ZoneId } from "@js-joda/core";

export interface TradingRow {
  timestamp: string;
  committedPower: number;
  dispatchedPower: number;
  dayAheadPrice: number;
  imbalancePrice: number;
  fcrPrice: number;
}

export interface TradingPerformanceResponse {
  rows: TradingRow[];
  powerUnit: string;
  priceDenominatorUnit: string;
}

export function makeTradingPerformanceResponse(
  date: string,
): TradingPerformanceResponse {
  const parsedDate = LocalDate.parse(date);
  const startOfDay = parsedDate
    .atStartOfDay()
    .atZone(ZoneId.SYSTEM)
    .toInstant();

  // Generate 30-minute intervals for a day (48 slots)
  const rows: TradingRow[] = [];
  for (let i = 0; i < 48; i++) {
    const timestamp = startOfDay.plusSeconds(i * 1800); // 30 minutes = 1800 seconds

    // Simulated data with realistic patterns
    const baseHour = i / 2;
    const committedPower = 4.5 + Math.sin(baseHour * 0.3) * 1.5; // 3-6 kW
    const dispatchedPower = committedPower + (Math.random() - 0.5) * 0.3; // ±0.15 kW variance
    const dayAheadPrice = 0.35 + Math.sin(baseHour * 0.4) * 0.1; // £0.25-0.45/kWh
    const imbalancePrice = dayAheadPrice * (0.8 + Math.random() * 0.4); // 80-120% of day-ahead
    const fcrPrice = 0.12 + Math.random() * 0.08; // £0.12-0.20/kWh

    rows.push({
      timestamp: timestamp.toString(),
      committedPower: Math.round(committedPower * 100) / 100,
      dispatchedPower: Math.round(dispatchedPower * 100) / 100,
      dayAheadPrice: Math.round(dayAheadPrice * 100) / 100,
      imbalancePrice: Math.round(imbalancePrice * 100) / 100,
      fcrPrice: Math.round(fcrPrice * 100) / 100,
    });
  }

  return {
    rows,
    powerUnit: "kW",
    priceDenominatorUnit: "kWh",
  };
}
