import type { AdminUnit } from "cameroon-locations";
import { type SearchResult, search } from "cameroon-locations/search";
import { useMemo, useState } from "react";

function run(query: string): readonly SearchResult[] | Error {
  try {
    return search(query, { limit: 6 });
  } catch (error) {
    return error instanceof Error ? error : new Error(String(error));
  }
}

const LEVEL: Record<AdminUnit["level"], string> = {
  region: "Region",
  division: "Division",
  arrondissement: "Arrondissement",
};

export default function SearchDemo() {
  const [query, setQuery] = useState("yaounde");
  const results = useMemo(() => run(query), [query]);

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
        {results instanceof Error ? (
          <li className="text-muted-foreground px-2 py-6 text-center text-xs">
            Search lands with the data release.
          </li>
        ) : results.length === 0 ? (
          <li className="text-muted-foreground px-2 py-6 text-center text-xs">
            No match.
          </li>
        ) : (
          results.map((r) => (
            <li
              key={r.item.pcode}
              className="hover:bg-accent flex items-center justify-between gap-3 rounded-md px-2 py-1.5"
            >
              <span className="truncate">{r.item.name.fr}</span>
              <span className="text-muted-foreground shrink-0 font-mono text-[11px]">
                {LEVEL[r.item.level]} · {r.item.pcode}
              </span>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
