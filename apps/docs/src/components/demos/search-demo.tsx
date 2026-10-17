import type { AdminUnit } from "cameroon-locations";
import { search } from "cameroon-locations/search";
import { useMemo, useState } from "react";

const LEVEL: Record<AdminUnit["level"], string> = {
  region: "Region",
  division: "Division",
  arrondissement: "Arrondissement",
};

export default function SearchDemo() {
  const [query, setQuery] = useState("yaounde 1er");
  const results = useMemo(() => search(query, { limit: 6 }), [query]);

  return (
    <div className="bg-background w-full max-w-sm rounded-lg border shadow-xs">
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search a region, division or arrondissement"
        aria-label="Search locations"
        className="placeholder:text-muted-foreground w-full border-b bg-transparent px-3 py-2.5 text-sm outline-none"
      />
      <ul className="p-1 text-sm">
        {results.length === 0 ? (
          <li className="text-muted-foreground px-2 py-6 text-center text-xs">
            No match.
          </li>
        ) : (
          results.map((r) => (
            <li
              key={r.item.pcode}
              className="hover:bg-accent flex items-center justify-between gap-3 rounded-md px-2 py-1.5"
            >
              <span className="flex min-w-0 flex-col">
                <span className="truncate">{r.item.name.fr}</span>
                <span className="text-muted-foreground text-[11px]">
                  {LEVEL[r.item.level]} · {r.item.pcode}
                </span>
              </span>
              <span className="text-muted-foreground shrink-0 font-mono text-[11px] tabular-nums">
                {r.score.toFixed(2)}
              </span>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
