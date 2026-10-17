import {
  type AdminLevel,
  type AdminUnit,
  arrondissements,
  divisions,
  regions,
} from "cameroon-locations";
import { useMemo, useState } from "react";
import { CameroonMap } from "@/components/cameroon-map";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const UNITS: Record<AdminLevel, readonly AdminUnit[]> = {
  region: regions,
  division: divisions,
  arrondissement: arrondissements,
};

const LABELS: Record<AdminLevel, string> = {
  region: "Regions",
  division: "Divisions",
  arrondissement: "Arrondissements",
};

export default function CameroonMapChoroplethDemo() {
  const [level, setLevel] = useState<AdminLevel>("region");

  // Population density, inhabitants per km² (2005 census).
  const density = useMemo(() => {
    const values: Record<string, number> = {};
    for (const unit of UNITS[level]) {
      const total = unit.population2005?.total;
      if (total !== undefined) values[unit.pcode] = total / unit.areaSqKm;
    }
    return values;
  }, [level]);

  return (
    <div className="grid w-full gap-3">
      <Tabs value={level} onValueChange={(v) => setLevel(v as AdminLevel)}>
        <TabsList aria-label="Level">
          {(Object.keys(LABELS) as AdminLevel[]).map((l) => (
            <TabsTrigger key={l} value={l}>
              {LABELS[l]}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
      <CameroonMap
        level={level}
        values={density}
        legend="Inhabitants per km², 2005"
        formatValue={(v) => `${Math.round(v).toLocaleString("en")} /km²`}
        sources={["bucrep-rgph2005-repertoire-villages"]}
        className="h-[460px]"
      />
    </div>
  );
}
