import { useState } from "react";
import { CameroonMap } from "@/components/cameroon-map";
import { LocationPicker } from "@/components/location-picker";

export default function CameroonMapDrillDownDemo() {
  const [pcode, setPcode] = useState<string | null>(null);

  return (
    <div className="grid w-full gap-4">
      <LocationPicker
        lang="fr"
        value={pcode}
        onValueChange={(selection) => setPcode(selection.pcode ?? null)}
        className="sm:grid-cols-3"
      />
      <CameroonMap
        lang="fr"
        drillDown
        selected={pcode}
        onSelect={(unit) => setPcode(unit.pcode)}
        className="h-[460px]"
      />
    </div>
  );
}
