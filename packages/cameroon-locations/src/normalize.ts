import { notImplemented } from "./internal";

/**
 * Folds a name for comparison: lower case, accents removed, apostrophes and
 * punctuation dropped, `-`/`_`/whitespace collapsed to one space, and ordinal
 * suffixes unified so "Yaoundé 1er", "Yaounde I" and "yaounde-1" are equal.
 */
export function normalizeName(_name: string): string {
  return notImplemented("normalizeName");
}
