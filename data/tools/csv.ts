// Minimal RFC 4180 CSV parser: quoted fields, "" escapes, commas and line breaks inside quotes,
// CRLF or LF record separators. Strips a leading BOM and drops a trailing empty record.
export function parseCsv(text: string): string[][] {
  const s = text.replace(/^﻿/, "");
  const rows: string[][] = [];
  let row: string[] = [], field = "", quoted = false, i = 0;
  while (i < s.length) {
    const c = s[i];
    if (quoted) {
      if (c === '"') {
        if (s[i + 1] === '"') { field += '"'; i += 2; continue; }
        quoted = false; i++; continue;
      }
      field += c; i++; continue;
    }
    if (c === '"' && field === "") { quoted = true; i++; continue; }
    if (c === ",") { row.push(field); field = ""; i++; continue; }
    if (c === "\r" || c === "\n") {
      row.push(field); rows.push(row); row = []; field = "";
      i += c === "\r" && s[i + 1] === "\n" ? 2 : 1; continue;
    }
    field += c; i++;
  }
  if (quoted) throw new Error("csv: unterminated quoted field");
  if (field !== "" || row.length) { row.push(field); rows.push(row); }
  return rows.filter(r => !(r.length === 1 && r[0] === ""));
}

/** Parse a CSV and require every record to have the header's column count. */
export function parseCsvStrict(text: string, label: string): string[][] {
  const rows = parseCsv(text);
  const width = rows[0]?.length ?? 0;
  rows.forEach((r, n) => { if (r.length !== width) throw new Error(`${label}: record ${n + 1} has ${r.length} fields, expected ${width}: ${JSON.stringify(r)}`); });
  return rows;
}
