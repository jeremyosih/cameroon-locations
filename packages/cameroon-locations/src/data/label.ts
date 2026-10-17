// French and English function words kept in lower case inside a name.
const SMALL = new Set([
  "de",
  "du",
  "des",
  "la",
  "le",
  "les",
  "et",
  "ou",
  "au",
  "aux",
  "en",
  "sur",
  "sous",
  "of",
  "and",
  "the",
]);
const ROMAN = /^(?:X{1,3}(?:IX|IV|V?I{0,3})|IX|IV|V?I{1,3}|V)$/;
const VOWEL = /[AEIOUYÀÂÄÉÈÊËÎÏÔÖÙÛÜŸ]/;
const ORDINAL_SUFFIX = /^(?:ER|RE|E|EME|ÈME|ÈRE)$/;
// A word: letters and digits, with apostrophes inside (SA'A, D'ÉLÉPHANT).
const WORD = /[\p{L}\p{N}][\p{L}\p{N}'’`]*/gu;

const capitalize = (w: string): string =>
  w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();

function caseLetters(w: string, first: boolean): string {
  if (ROMAN.test(w)) return w;
  const lower = w.toLowerCase();
  if (!first && SMALL.has(lower)) return lower;
  if (w === "ST") return "St";
  // Acronyms have no vowel: PK, CDC, CRTV, TSF.
  if (w.length > 1 && !VOWEL.test(w)) return w;
  return capitalize(w);
}

function caseWord(word: string, first: boolean): string {
  // Printed in mixed case already: keep it as printed.
  if (/\p{Ll}/u.test(word)) return word;
  // Elision or prefix: D'ÉLÉPHANT -> d'Éléphant, M'BITOM -> M'Bitom.
  const elision = /^(\p{L})(['’`])(\p{L}.*)$/u.exec(word);
  if (elision) {
    const [, letter = "", mark = "", rest = ""] = elision;
    const head =
      !first && (letter === "D" || letter === "L")
        ? letter.toLowerCase()
        : letter;
    return head + mark + caseWord(rest, true);
  }
  // Letters and digits: ADJAP1 -> Adjap1, 2E -> 2e, 8A and 4X4 unchanged.
  return word.replace(/\p{L}[\p{L}'’`]*|\p{N}+/gu, (part, offset: number) => {
    if (/^\p{N}/u.test(part)) return part;
    if (offset > 0)
      return ORDINAL_SUFFIX.test(part) ? part.toLowerCase() : part;
    return caseLetters(part, first);
  });
}

/**
 * Human-friendly casing of a name printed in upper case by BUCREP:
 * "NKOL-ESSONG II" -> "Nkol-Essong II", "QUARTIER D'ÉLÉPHANT" ->
 * "Quartier d'Éléphant", "LAMIDAT DE GAROUA/ARDO BAME" ->
 * "Lamidat de Garoua/Ardo Bame". Only letter case changes: spaces, hyphens,
 * apostrophes and other punctuation are kept exactly as printed.
 */
export function toLabel(name: string): string {
  let previousEnd = 0;
  return name.replace(WORD, (word, offset: number) => {
    const before = name.slice(previousEnd, offset);
    const first = previousEnd === 0 || /[(/]\s*$/.test(before);
    previousEnd = offset + word.length;
    return caseWord(word, first);
  });
}
