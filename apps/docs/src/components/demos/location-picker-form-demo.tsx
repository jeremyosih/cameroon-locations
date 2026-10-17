import { useState } from "react";
import { LocationPicker } from "@/components/location-picker";
import { Button } from "@/components/ui/button";
import { getUnit } from "@/lib/cameroon-locations/lookup";

export default function LocationPickerFormDemo() {
  const [pcode, setPcode] = useState<string | null>("CM002007");
  const [submitted, setSubmitted] = useState<string>();

  return (
    <form
      className="bg-background grid w-full max-w-sm gap-5 rounded-lg border p-6 shadow-xs"
      onSubmit={(event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        setSubmitted(String(data.get("arrondissement")));
      }}
    >
      <div className="grid gap-1">
        <div className="font-medium">Adresse de livraison</div>
        <p className="text-muted-foreground text-sm">
          Choisissez votre arrondissement.
        </p>
      </div>
      <LocationPicker
        lang="fr"
        name="arrondissement"
        value={pcode}
        onValueChange={(selection) => setPcode(selection.pcode ?? null)}
      />
      <div className="flex items-center justify-between gap-3">
        <Button type="button" variant="ghost" onClick={() => setPcode(null)}>
          Effacer
        </Button>
        <Button
          type="submit"
          disabled={!pcode || getUnit(pcode)?.level !== "arrondissement"}
        >
          Valider
        </Button>
      </div>
      {submitted ? (
        <p className="text-muted-foreground text-xs">
          Envoyé :{" "}
          <code className="bg-muted rounded px-1 py-0.5 font-mono">
            arrondissement={submitted}
          </code>
        </p>
      ) : null}
    </form>
  );
}
