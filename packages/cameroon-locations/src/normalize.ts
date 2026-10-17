const ROMAN: Readonly<Record<string, number>> = {
  i: 1,
  ii: 2,
  iii: 3,
  iv: 4,
  v: 5,
  vi: 6,
  vii: 7,
  viii: 8,
  ix: 9,
  x: 10,
};

// "1er", "1re", "2e", "2eme", "1st", "2nd", "3rd", "4th"
const ORDINAL = /^(\d+)(?:er|re|e|eme|ere|st|nd|rd|th)$/;

/**
 * Folds a name for comparison: compatibility forms unified (NFKD, so "Ⅱ"
 * reads "II" and full-width letters are plain), lower case, accents removed, apostrophes and
 * punctuation dropped, `-`/`_`/whitespace collapsed to one space, and a
 * trailing ordinal unified so "Yaoundé 1er", "Yaounde I", "Yaoundé-1" and
 * "YAOUNDE 1ER" all fold to `"yaounde 1"`.
 */
export function normalizeName(name: string): string {
  const words = name
    .normalize("NFKD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/['’`ʼ]/g, "")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim()
    .split(" ");
  const last = words.at(-1);
  if (last !== undefined && words.length > 1) {
    const roman = ROMAN[last];
    const ordinal = ORDINAL.exec(last)?.[1];
    if (roman !== undefined) words[words.length - 1] = String(roman);
    else if (ordinal !== undefined) words[words.length - 1] = ordinal;
  }
  return words.join(" ");
}
