import { describe, expect, test } from "bun:test";
import { createColorScale } from "../../registry/cameroon-map/cameroon-map-scale";

describe("createColorScale", () => {
  test("quantile classes hold about as many values each", () => {
    const scale = createColorScale([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], {
      steps: 5,
    });
    expect(scale.domain).toEqual([1, 10]);
    const counts = [0, 0, 0, 0, 0];
    for (let v = 1; v <= 10; v++) {
      const b = scale.bucket(v);
      counts[b] = (counts[b] ?? 0) + 1;
    }
    expect(counts).toEqual([2, 2, 2, 2, 2]);
  });

  test("quantile resists outliers, linear does not", () => {
    const values = [1, 2, 3, 4, 1000];
    expect(createColorScale(values).bucket(4)).toBe(3);
    expect(createColorScale(values, { method: "linear" }).bucket(4)).toBe(0);
    expect(createColorScale(values, { method: "linear" }).bucket(1000)).toBe(4);
  });

  test("breaks are inclusive lower bounds", () => {
    const scale = createColorScale([0, 100], { method: "linear", steps: 4 });
    expect(scale.breaks).toEqual([25, 50, 75]);
    expect(scale.bucket(24.9)).toBe(0);
    expect(scale.bucket(25)).toBe(1);
    expect(scale.bucket(100)).toBe(3);
  });

  test("missing values and empty input", () => {
    const scale = createColorScale([1, Number.NaN, 3]);
    expect(scale.domain).toEqual([1, 3]);
    expect(scale.bucket(undefined)).toBe(-1);
    expect(scale.bucket(Number.NaN)).toBe(-1);
    expect(createColorScale([]).bucket(1)).toBe(-1);
    expect(createColorScale([]).domain).toBeUndefined();
  });
});
