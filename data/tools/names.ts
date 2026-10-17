// Name normalisation shared by the matching tools. Only used for *matching*; original spellings are always kept.
const ROMAN: Record<string, string> = { I: "1", II: "2", III: "3", IV: "4", V: "5", VI: "6", VII: "7" };

export const matchKey = (s: string) =>
  s
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
    .toUpperCase()
    .replace(/[’'`]/g, "")
    .replace(/\b(1ER|1ST|PREMIER)\b/g, "1").replace(/\b(\d+)(E|EME|ND|RD|TH)\b/g, "$1")
    .replace(/[-_/.,()]+/g, " ")
    .replace(/\b(I|II|III|IV|V|VI|VII)\b/g, m => ROMAN[m])
    .replace(/\b(ET|AND)\b/g, " ")
    .replace(/\s+/g, "");
