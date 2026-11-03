export function getMissingRanges(
  values: (number | null)[],
): [number, number][] {
  const ranges: [number, number][] = [];
  let start: number | null = null;
  values.forEach((value, index) => {
    if (value == null && start == null) start = index;
    if (start != null && (value != null || index === values.length - 1)) {
      ranges.push([start, value == null ? index : index - 1]);
      start = null;
    }
  });
  return ranges;
}
