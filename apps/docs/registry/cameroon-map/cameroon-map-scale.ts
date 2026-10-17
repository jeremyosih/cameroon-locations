/** How values are split into colour classes. */
export type ColorScaleMethod = "quantile" | "linear";

export interface ColorScale {
  /** Number of colour classes. */
  readonly steps: number;
  /** Smallest and largest value, or `undefined` without values. */
  readonly domain: readonly [min: number, max: number] | undefined;
  /** `steps - 1` ascending breaks; class `i` holds `breaks[i-1] <= v < breaks[i]`. */
  readonly breaks: readonly number[];
  /** Class of a value, from 0 to `steps - 1`, or -1 for no data. */
  bucket(value: number | null | undefined): number;
}

/** Linear-interpolated quantile of an ascending array (like d3.quantile). */
function quantile(sorted: readonly number[], p: number): number {
  const i = (sorted.length - 1) * p;
  const lo = Math.floor(i);
  const a = sorted[lo] as number;
  const b = sorted[Math.min(lo + 1, sorted.length - 1)] as number;
  return a + (b - a) * (i - lo);
}

/**
 * Sequential colour classes for a choropleth. `quantile` (the default)
 * puts about as many units in each class, which suits skewed data such as
 * population; `linear` splits the range into equal intervals.
 */
export function createColorScale(
  values: Iterable<number>,
  options: { readonly steps?: number; readonly method?: ColorScaleMethod } = {},
): ColorScale {
  const steps = Math.max(1, Math.floor(options.steps ?? 5));
  const sorted = [...values]
    .filter((v) => Number.isFinite(v))
    .sort((a, b) => a - b);
  const min = sorted[0];
  const max = sorted.at(-1);
  if (min === undefined || max === undefined) {
    return { steps, domain: undefined, breaks: [], bucket: () => -1 };
  }
  const breaks = Array.from({ length: steps - 1 }, (_, k) =>
    options.method === "linear"
      ? min + ((max - min) * (k + 1)) / steps
      : quantile(sorted, (k + 1) / steps),
  );
  return {
    steps,
    domain: [min, max],
    breaks,
    bucket(value) {
      if (value === null || value === undefined || !Number.isFinite(value)) {
        return -1;
      }
      let i = 0;
      while (i < breaks.length && value >= (breaks[i] as number)) i++;
      return i;
    },
  };
}
