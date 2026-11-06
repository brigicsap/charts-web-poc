// Convert an API money value from units and nanos to a GBP number.
export function toGBP(s: { units: number; nanos: number }): number {
	return s.units + s.nanos / 1_000_000_000;
}
