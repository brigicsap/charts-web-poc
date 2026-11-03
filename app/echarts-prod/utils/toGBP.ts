export function toGBP(s: { units: number; nanos: number }): number {
  return s.units + s.nanos / 1_000_000_000;
}
