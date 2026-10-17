import { useState } from "react";
import {
  LocationPicker,
  type LocationSelection,
} from "@/components/location-picker";

export default function LocationPickerDemo() {
  const [selection, setSelection] = useState<LocationSelection>();

  return (
    <div className="grid w-full max-w-2xl gap-6">
      <LocationPicker onValueChange={setSelection} className="sm:grid-cols-3" />
      <p className="text-muted-foreground text-sm">
        {selection?.unit ? (
          <>
            <span className="text-foreground font-medium">
              {[selection.region, selection.division, selection.arrondissement]
                .filter((u) => u !== undefined)
                .map((u) => u.name.en)
                .join(" › ")}
            </span>{" "}
            <code className="bg-muted rounded px-1 py-0.5 font-mono text-xs">
              {selection.pcode}
            </code>
          </>
        ) : (
          "Pick a region, or type to search: try “extreme nord” or “yaounde 1er”."
        )}
      </p>
    </div>
  );
}
