import assert from "node:assert/strict";
import { test } from "node:test";
import { buildStackedSeries, getMissingRanges, toGBP } from "./utils.ts";

const series = (name, data) => ({ name, data, color: "#00a487" });

test("missing ranges include leading, interior, and trailing gaps without treating zero as missing", () => {
	assert.deepEqual(getMissingRanges([null, 0, 20, null, null, 40, null]), [
		[0, 0],
		[3, 4],
		[6, 6],
	]);
	assert.deepEqual(getMissingRanges([]), []);
	assert.deepEqual(getMissingRanges([null, null]), [[0, 1]]);
});

test("cost conversion preserves fractional and negative currency values", () => {
	assert.equal(toGBP({ units: 2, nanos: 250000000 }), 2.25);
	assert.equal(toGBP({ units: 0, nanos: -30848106 }), -0.030848106);
});

test("only the outer positive segment is rounded, including when later values are zero or missing", () => {
	const result = buildStackedSeries(
		[series("Solar", [1, 2, 3]), series("Battery", [2, 0, null])],
		null,
	);
	assert.equal(result[0].data[0].itemStyle.borderRadius, 0);
	assert.deepEqual(result[0].data[1].itemStyle.borderRadius, [4, 4, 0, 0]);
	assert.deepEqual(result[0].data[2].itemStyle.borderRadius, [4, 4, 0, 0]);
	assert.deepEqual(result[2].data[0].itemStyle.borderRadius, [4, 4, 0, 0]);
	assert.equal(result[2].data[2].value, null);
});

test("negative stacks round the bottom and insert negative separators only between same-sign segments", () => {
	const result = buildStackedSeries(
		[series("First", [-2, -2]), series("Second", [-1, 1])],
		null,
	);
	assert.equal(result[0].data[0].itemStyle.borderRadius, 0);
	assert.deepEqual(result[2].data[0].itemStyle.borderRadius, [0, 0, 4, 4]);
	assert.ok(result[1].data[0] < 0);
	assert.equal(result[1].data[1], 0);
});

test("separators scale with the data and cannot capture pointer or tooltip events", () => {
	const build = (scale) =>
		buildStackedSeries(
			[series("First", [scale]), series("Second", [2 * scale])],
			null,
		)[1];
	assert.equal(build(10).data[0], build(1).data[0] * 10);
	assert.equal(build(1).silent, true);
	assert.equal(build(1).tooltip.show, false);
	assert.equal(build(1).legendHoverLink, false);
});

test("selection dims other slots without changing the source values", () => {
	const input = [series("Solar", [1, 2])];
	const result = buildStackedSeries(input, 1);
	assert.equal(result[0].data[0].itemStyle.opacity, 0.3);
	assert.equal(result[0].data[1].itemStyle.opacity, 1);
	assert.deepEqual(input[0].data, [1, 2]);
	assert.deepEqual(buildStackedSeries([], null), []);
});
