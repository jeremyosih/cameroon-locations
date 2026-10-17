// Survey the BUCREP text: indentation levels and lines not matching "NAME total male female".
const lines = (await Bun.file(process.argv[2]).text()).split("\n");
const ind: Record<string, number> = {}; const odd: string[] = [];
const rowRe = /^( *)(.+?) +(-|\d+) +(-|\d+) +(-|\d+) *$/;
const hdrRe = /^\d+\.(\d+\.)*\s/;
lines.forEach((l, i) => {
  if (!l.trim()) return;
  if (hdrRe.test(l)) { ind["hdr" + (l.match(/\d+\./g)!.length)] = (ind["hdr" + (l.match(/\d+\./g)!.length)] || 0) + 1; return; }
  const m = l.match(rowRe);
  if (!m) { odd.push(`${i + 1}: ${JSON.stringify(l)}`); return; }
  ind[m[1].length] = (ind[m[1].length] || 0) + 1;
  if (+m[3] !== +m[4] + +m[5] && m[3] !== "-") odd.push(`${i + 1}: SUM ${JSON.stringify(l.trim())}`);
});
console.log(ind); console.log("odd lines:", odd.length); odd.slice(0, +process.argv[3] || 60).forEach(s => console.log(" ", s.slice(0, 140)));
