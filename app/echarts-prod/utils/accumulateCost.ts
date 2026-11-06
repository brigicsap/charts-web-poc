// Add an API money value to a running total while preserving nanounit precision.
export function accumulateCost(
  current: number,
  value: { units: number; nanos: number },
): number {
  const total = current + value.units + value.nanos / 1e9;
  return Math.round(total * 1e9) / 1e9;
}
