import type { AdminUnit } from "cameroon-locations";
import { useState } from "react";
import { CameroonMap } from "@/components/cameroon-map";

export default function CameroonMapDemo() {
  const [unit, setUnit] = useState<AdminUnit>();

  return (
    <div className="grid w-full gap-3">
      <CameroonMap
        level="region"
        selected={unit?.pcode ?? null}
        onSelect={setUnit}
      />
      <p className="text-muted-foreground text-sm">
        {unit ? (
          <>
            <span className="text-foreground font-medium">{unit.name.en}</span>{" "}
            <code className="bg-muted rounded px-1 py-0.5 font-mono text-xs">
              {unit.pcode}
            </code>{" "}
            · {unit.areaSqKm.toLocaleString("en")} km²
          </>
        ) : (
          "Click a region, or Tab to it and press Enter."
        )}
      </p>
    </div>
  );
}
