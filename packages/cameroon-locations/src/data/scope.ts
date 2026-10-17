import type { AdminLevel, Pcode } from "../types";

/** The one shared empty result. Frozen, so callers cannot fill it. */
export const EMPTY: readonly never[] = Object.freeze([]);

/** OCHA P-code of any level: `CM` then 3, 6 or 9 digits. */
export const PCODE = /^CM\d{3}(?:\d{3}(?:\d{3})?)?$/;

/** P-code length at each level. */
export const PCODE_LENGTH: Readonly<Record<AdminLevel, number>> = Object.freeze(
  { region: 5, division: 8, arrondissement: 11 },
);

/**
 * True for a well-formed region (`CM004`), division (`CM004001`) or
 * arrondissement (`CM004001001`) P-code. Checks the format only: upper case,
 * no surrounding whitespace, and the code need not exist.
 */
export function isPcode(value: string): value is Pcode {
  return PCODE.test(value);
}

/** Codes and ids are compared trimmed and upper case. */
export const normalizeCode = (value: string): string =>
  value.trim().toUpperCase();

/**
 * Normalised `within` option: `undefined`, `""` and whitespace mean no
 * restriction (`undefined`); anything else is trimmed and upper-cased, and
 * then only matches if it is a P-code (see {@link isWithin}).
 */
export function normalizeWithin(
  within: string | undefined,
): string | undefined {
  const scope = within === undefined ? "" : normalizeCode(within);
  return scope === "" ? undefined : scope;
}

/**
 * True when `code` (a P-code, or a canton or village id) lies in `within`,
 * itself included. `within` must already be normalised: anything that is not
 * a P-code, such as a name or a partial code like `"CM00"`, matches nothing.
 */
export function isWithin(code: string, within: string): boolean {
  return isPcode(within) && code.startsWith(within);
}

/** Arrondissement P-code is the first 11 characters of canton and village ids. */
export const arrondissementOf = (id: string): Pcode => id.slice(0, 11);
