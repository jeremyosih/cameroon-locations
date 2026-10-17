import {
  type AdminUnit,
  attribution,
  getUnit,
  type LngLat,
} from "cameroon-locations";
import type { Feature, FeatureCollection, Geometry } from "geojson";
import type { Path } from "leaflet";
import { LocateFixedIcon } from "lucide-react";
import {
  type ClipboardEvent,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import { CircleMarker, GeoJSON, useMap, useMapEvents } from "react-leaflet";
import {
  MapRoot,
  MapTileLayer,
  MapZoomControl,
} from "@/components/cameroon-map-leaflet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";

// Both are large, so they load after the page, as separate chunks:
// `locate` bundles its own polygons; the GeoJSON is only for drawing.
type Geo = typeof import("cameroon-locations/geo");
type Shapes = FeatureCollection<Geometry, { pcode: string }>;
const loadGeo = () => import("cameroon-locations/geo");
const loadShapes = () =>
  import("cameroon-locations/geojson/arrondissements.geo.json").then(
    (mod) => mod.default as unknown as Shapes,
  );

const PRESETS: readonly { label: string; point: LngLat }[] = [
  { label: "Yaoundé", point: [11.5167, 3.8667] },
  { label: "Douala", point: [9.7043, 4.0511] },
  { label: "Garoua", point: [13.3958, 9.3017] },
  { label: "N’Djamena (Chad)", point: [15.0444, 12.1348] },
];

const CREDIT = attribution(["ocha-cod-ab-cmr"]).replace(
  /[&<>"']/g,
  (c) => `&#${c.charCodeAt(0)};`,
);

/** `locate`'s answer, or the `nearest` fallback when it has none. */
type Result =
  | { readonly found: true; readonly unit: AdminUnit }
  | {
      readonly found: false;
      readonly unit: AdminUnit;
      readonly distanceKm: number;
    };

type Bounds = [[number, number], [number, number]];

/** "3.8667, 11.5167" (lat, lng: the order map apps copy) → [lng, lat]. */
function parsePair(text: string): LngLat | undefined {
  const m =
    /^\s*\(?\s*(-?\d+(?:\.\d+)?)\s*[,;\s]\s*(-?\d+(?:\.\d+)?)\s*\)?\s*$/.exec(
      text,
    );
  return m ? [Number(m[2]), Number(m[1])] : undefined;
}

const fmt = (n: number) => String(Number(n.toFixed(4)));

function boundsAround(point: LngLat, unit: AdminUnit): Bounds {
  const [minLng, minLat, maxLng, maxLat] = unit.bbox;
  const [lng, lat] = point;
  return [
    [Math.min(minLat, lat), Math.min(minLng, lng)],
    [Math.max(maxLat, lat), Math.max(maxLng, lng)],
  ];
}

export default function LocateDemo() {
  const [geo, setGeo] = useState<Geo>();
  const [shapes, setShapes] = useState<ReadonlyMap<string, Feature>>();
  const [query, setQuery] = useState({
    point: PRESETS[0]?.point ?? ([11.5167, 3.8667] as LngLat),
    fly: true,
  });
  const [lat, setLat] = useState(fmt(query.point[1]));
  const [lng, setLng] = useState(fmt(query.point[0]));
  const [inputError, setInputError] = useState<string>();
  const [locating, setLocating] = useState(false);
  const [deviceError, setDeviceError] = useState<string>();
  const [loadError, setLoadError] = useState(false);
  // Bumped by every new point and on unmount, so a pending geolocation
  // request can't replace a newer choice.
  const request = useRef(0);
  const id = useId();

  useEffect(() => {
    let active = true;
    const fail = () => active && setLoadError(true);
    loadGeo().then((mod) => active && setGeo(mod), fail);
    loadShapes().then(
      (fc) =>
        active &&
        setShapes(new Map(fc.features.map((f) => [f.properties.pcode, f]))),
      fail,
    );
    return () => {
      active = false;
    };
  }, []);

  useEffect(
    () => () => {
      request.current++;
    },
    [],
  );

  const result = useMemo((): Result | undefined => {
    if (!geo) return undefined;
    const unit = geo.locate(query.point);
    if (unit) return { found: true, unit };
    const near = geo.nearest(query.point, { limit: 1 })[0];
    return near && { found: false, ...near };
  }, [geo, query.point]);

  const go = (point: LngLat, fly: boolean) => {
    request.current++;
    setLocating(false);
    setQuery({ point, fly });
    setLat(fmt(point[1]));
    setLng(fmt(point[0]));
    setInputError(undefined);
    setDeviceError(undefined);
  };

  /** Locates typed or pasted coordinates, or explains what's wrong. */
  const enter = (point: LngLat) => {
    const [x, y] = point;
    if (
      !Number.isFinite(x) ||
      !Number.isFinite(y) ||
      Math.abs(y) > 90 ||
      Math.abs(x) > 180
    ) {
      setInputError(
        "Enter a latitude between -90 and 90 and a longitude between -180 and 180.",
      );
      return;
    }
    go(point, true);
  };

  const submit = (event: { preventDefault: () => void }) => {
    event.preventDefault();
    const pair = parsePair(lat);
    if (pair) return enter(pair);
    enter(
      lat.trim() && lng.trim()
        ? [Number(lng), Number(lat)]
        : [Number.NaN, Number.NaN],
    );
  };

  // Pasting "3.8667, 11.5167" in either field fills both and locates it.
  const paste = (event: ClipboardEvent<HTMLInputElement>) => {
    const point = parsePair(event.clipboardData.getData("text"));
    if (!point) return;
    event.preventDefault();
    setLat(String(point[1]));
    setLng(String(point[0]));
    enter(point);
  };

  const useMyLocation = () => {
    if (!("geolocation" in navigator)) {
      setDeviceError("This browser can’t share its location.");
      return;
    }
    const ticket = ++request.current;
    setLocating(true);
    setDeviceError(undefined);
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        if (ticket !== request.current) return;
        go([coords.longitude, coords.latitude], true);
      },
      (error) => {
        if (ticket !== request.current) return;
        setLocating(false);
        setDeviceError(
          error.code === error.PERMISSION_DENIED
            ? "Location access was denied. Click the map or type coordinates instead."
            : "Couldn’t get your location. Click the map or type coordinates instead.",
        );
      },
      { timeout: 10_000, maximumAge: 60_000 },
    );
  };

  const highlight = result && shapes?.get(result.unit.pcode);
  const target =
    result && query.fly ? boundsAround(query.point, result.unit) : undefined;
  const [x, y] = query.point;
  const call = `[${fmt(x)}, ${fmt(y)}]`;

  return (
    <div className="grid w-full min-w-0 grid-cols-1 gap-3">
      <form
        onSubmit={submit}
        noValidate
        className="grid grid-cols-2 items-end gap-2 sm:grid-cols-[1fr_1fr_auto]"
      >
        <div className="grid gap-1.5">
          <label htmlFor={`${id}-lat`} className="text-sm font-medium">
            Latitude
          </label>
          <Input
            id={`${id}-lat`}
            value={lat}
            onChange={(e) => setLat(e.target.value)}
            onPaste={paste}
            inputMode="decimal"
            autoComplete="off"
            spellCheck={false}
            placeholder="3.8667"
            aria-invalid={inputError ? true : undefined}
            aria-describedby={`${id}-hint`}
            className="font-mono tabular-nums"
          />
        </div>
        <div className="grid gap-1.5">
          <label htmlFor={`${id}-lng`} className="text-sm font-medium">
            Longitude
          </label>
          <Input
            id={`${id}-lng`}
            value={lng}
            onChange={(e) => setLng(e.target.value)}
            onPaste={paste}
            inputMode="decimal"
            autoComplete="off"
            spellCheck={false}
            placeholder="11.5167"
            aria-invalid={inputError ? true : undefined}
            aria-describedby={`${id}-hint`}
            className="font-mono tabular-nums"
          />
        </div>
        <Button type="submit" className="col-span-2 sm:col-span-1">
          Locate
        </Button>
        <p
          id={`${id}-hint`}
          className={
            inputError
              ? "text-destructive col-span-full text-xs"
              : "text-muted-foreground col-span-full text-xs"
          }
        >
          {inputError ?? (
            <>
              Paste “lat, lng” as map apps copy it. <code>locate</code> takes{" "}
              <code>[lng, lat]</code>, like GeoJSON.
            </>
          )}
        </p>
      </form>

      <div className="flex flex-wrap items-center gap-1.5">
        {PRESETS.map((p) => (
          <Button
            key={p.label}
            type="button"
            size="sm"
            variant="outline"
            onClick={() => go(p.point, true)}
          >
            {p.label}
          </Button>
        ))}
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={useMyLocation}
          disabled={locating}
          className="sm:ml-auto"
        >
          {locating ? <Spinner aria-hidden="true" /> : <LocateFixedIcon />}
          {locating ? "Locating…" : "Use my location"}
        </Button>
      </div>
      {deviceError ? (
        <p role="alert" className="text-destructive text-xs">
          {deviceError}
        </p>
      ) : null}

      <div className="bg-card relative isolate h-[360px] w-full overflow-hidden rounded-lg border">
        <MapRoot
          center={[7.37, 12.35]}
          zoom={5.5}
          minZoom={2}
          maxZoom={14}
          zoomSnap={0.25}
          attributionControl
          className="absolute inset-0 z-0 min-h-0 cursor-crosshair rounded-none"
        >
          <MapTileLayer />
          <Attribution html={CREDIT} />
          <MapZoomControl position="top-2 left-2" />
          <ClickToLocate onLocate={(point) => go(point, false)} />
          {highlight && result ? (
            <GeoJSON
              key={`${result.unit.pcode}:${result.found}`}
              data={highlight}
              interactive={false}
              style={
                result.found
                  ? { weight: 2.5, fillOpacity: 0.18 }
                  : { weight: 2, fillOpacity: 0.06, dashArray: "6 4" }
              }
              // Leaflet writes colours as SVG attributes, which can't read
              // CSS variables; classes can, and win over attributes.
              onEachFeature={(_, layer) =>
                layer.on("add", () =>
                  (layer as Path)
                    .getElement()
                    ?.classList.add(
                      ...(result.found
                        ? ["fill-brand", "stroke-brand"]
                        : ["fill-muted-foreground", "stroke-muted-foreground"]),
                    ),
                )
              }
            />
          ) : null}
          <CircleMarker
            center={[y, x]}
            radius={7}
            interactive={false}
            className="fill-foreground stroke-background"
            pathOptions={{ weight: 3, fillOpacity: 1 }}
          />
          {target ? <FlyTo bounds={target} /> : null}
        </MapRoot>
        <p className="bg-background/90 text-muted-foreground pointer-events-none absolute top-2 right-2 z-[1000] rounded-md border px-2 py-1 text-xs shadow-xs backdrop-blur-sm">
          Click anywhere
        </p>
      </div>

      <div className="bg-background rounded-lg border p-3 text-sm sm:p-4">
        <p className="text-muted-foreground mb-2 font-mono text-xs break-words">
          locate({call}){result && !result.found ? " → undefined" : ""}
        </p>
        {loadError ? (
          <p role="alert" className="text-destructive mb-2 text-sm">
            {geo
              ? "Couldn’t load the boundary outlines."
              : "Couldn’t load the boundaries."}{" "}
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="ml-1"
              // Browsers cache a failed dynamic import until the page reloads.
              onClick={() => window.location.reload()}
            >
              Reload
            </Button>
          </p>
        ) : null}
        {!result ? (
          loadError ? null : (
            <p className="text-muted-foreground flex items-center gap-2">
              <Spinner aria-hidden="true" /> Loading boundaries…
            </p>
          )
        ) : result.found ? (
          <Hierarchy unit={result.unit} />
        ) : (
          <>
            <p className="mb-2">
              Outside Cameroon or on a border. Nearest:{" "}
              <span className="font-medium">{result.unit.name.fr}</span>{" "}
              <span className="text-muted-foreground tabular-nums">
                ({result.distanceKm.toFixed(1)} km to its centroid)
              </span>
            </p>
            {result.unit.level === "arrondissement" ? (
              <Hierarchy unit={result.unit} />
            ) : null}
          </>
        )}
      </div>
      <p className="sr-only" aria-live="polite" aria-atomic="true">
        {result
          ? result.found
            ? `${chain(result.unit)}.`
            : `Outside Cameroon or on a border. Nearest arrondissement: ${chain(result.unit)}, ${result.distanceKm.toFixed(1)} kilometres away.`
          : ""}
      </p>
    </div>
  );
}

const LEVELS = ["Arrondissement", "Division", "Region"] as const;

function lineage(unit: AdminUnit): AdminUnit[] {
  const units: AdminUnit[] = [];
  for (let u: AdminUnit | undefined = unit; u; ) {
    units.push(u);
    u = u.parentPcode ? getUnit(u.parentPcode) : undefined;
  }
  return units;
}

const chain = (unit: AdminUnit) =>
  lineage(unit)
    .map((u) => u.name.fr)
    .join(", ");

/** Arrondissement › division › region, with English names and P-codes. */
function Hierarchy({ unit }: { readonly unit: AdminUnit }) {
  return (
    <ol className="grid gap-2 sm:gap-1.5">
      {lineage(unit).map((u, i) => (
        <li
          key={u.pcode}
          className="grid grid-cols-[1fr_auto] items-baseline gap-x-2 sm:grid-cols-[7rem_1fr_auto]"
        >
          <span className="text-muted-foreground col-span-2 text-xs sm:col-span-1">
            {LEVELS[i]}
          </span>
          <span className="min-w-0 break-words">
            <span className={i === 0 ? "font-medium" : undefined}>
              {u.name.fr}
            </span>
            {u.name.en !== u.name.fr ? (
              <span className="text-muted-foreground" lang="en">
                {" "}
                · {u.name.en}
              </span>
            ) : null}
          </span>
          <code className="bg-muted rounded px-1 py-0.5 font-mono text-xs">
            {u.pcode}
          </code>
        </li>
      ))}
    </ol>
  );
}

function ClickToLocate({
  onLocate,
}: {
  readonly onLocate: (point: LngLat) => void;
}) {
  useMapEvents({
    click: ({ latlng }) => onLocate([latlng.lng, latlng.lat]),
  });
  return null;
}

function FlyTo({ bounds }: { readonly bounds: Bounds }) {
  const map = useMap();
  const key = bounds.flat().join(",");
  // biome-ignore lint/correctness/useExhaustiveDependencies: refly when the box changes
  useEffect(() => {
    map.flyToBounds(bounds, { padding: [32, 32], maxZoom: 11, duration: 0.6 });
  }, [map, key]);
  return null;
}

/** Adds the boundary credit to Leaflet's attribution control (required). */
function Attribution({ html }: { readonly html: string }) {
  const map = useMap();
  useEffect(() => {
    const control = map.attributionControl;
    control?.addAttribution(html);
    return () => {
      control?.removeAttribution(html);
    };
  }, [map, html]);
  return null;
}
