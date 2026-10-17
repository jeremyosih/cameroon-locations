"use client";

// ---------------------------------------------------------------------------
// The only place this component names the `cameroon-locations` npm package.
// GeoJSON files are imported dynamically so bundlers split them per level
// and detail; only the files a map shows are downloaded.
import {
  type AdminLevel,
  type AdminUnit,
  attribution,
  getUnit,
  type Language,
  type Pcode,
  regions,
  type SourceId,
} from "cameroon-locations";
import type { Feature, FeatureCollection, Geometry } from "geojson";
import type { LatLngBoundsExpression, Layer, Polygon } from "leaflet";
import { ArrowLeftIcon } from "lucide-react";
import * as React from "react";
import { GeoJSON, useMap } from "react-leaflet";
import { Button } from "@/components/ui/button";
import {
  MapControlContainer,
  Map as MapRoot,
  MapTileLayer,
  MapZoomControl,
} from "@/components/ui/map";
import { cn } from "@/lib/utils";
import { type ColorScaleMethod, createColorScale } from "./cameroon-map-scale";

type Loader = () => Promise<{ default: unknown }>;
const GEOJSON: Record<AdminLevel, Record<CameroonMapDetail, Loader>> = {
  region: {
    low: () => import("cameroon-locations/geojson/regions.low.geo.json"),
    default: () => import("cameroon-locations/geojson/regions.geo.json"),
    high: () => import("cameroon-locations/geojson/regions.high.geo.json"),
  },
  division: {
    low: () => import("cameroon-locations/geojson/divisions.low.geo.json"),
    default: () => import("cameroon-locations/geojson/divisions.geo.json"),
    high: () => import("cameroon-locations/geojson/divisions.high.geo.json"),
  },
  arrondissement: {
    low: () =>
      import("cameroon-locations/geojson/arrondissements.low.geo.json"),
    default: () =>
      import("cameroon-locations/geojson/arrondissements.geo.json"),
    high: () =>
      import("cameroon-locations/geojson/arrondissements.high.geo.json"),
  },
};
// ---------------------------------------------------------------------------

export type CameroonMapDetail = "low" | "default" | "high";

/** `properties` of every boundary feature. `feature.id` is the P-code. */
export interface CameroonMapProperties {
  readonly pcode: Pcode;
  readonly level: AdminLevel;
  readonly name_fr: string;
  readonly name_en: string;
  readonly parentPcode: Pcode | null;
  readonly regionPcode?: Pcode;
  readonly divisionPcode?: Pcode;
}

type Boundaries = FeatureCollection<Geometry, CameroonMapProperties>;

export interface CameroonMapProps {
  /** Level shown first. With `drillDown`, the level you start from. */
  readonly level?: AdminLevel;
  /** Boundary simplification: `low` for small maps, `high` for city zooms. */
  readonly detail?: CameroonMapDetail;
  /** Selected P-code (controlled). `null` for none. */
  readonly selected?: Pcode | null;
  /** Initial selection when uncontrolled. */
  readonly defaultSelected?: Pcode;
  /** Called with the record of the clicked (or Enter-pressed) unit. */
  readonly onSelect?: (unit: AdminUnit) => void;
  /** Values keyed by P-code, drawn as a sequential choropleth. */
  readonly values?: Readonly<Record<Pcode, number>>;
  /** How values are split into the 5 colour classes. */
  readonly scale?: ColorScaleMethod;
  /** Legend title, or `false` to hide the legend. */
  readonly legend?: string | false;
  /** Formats values in tooltips and the legend. */
  readonly formatValue?: (value: number) => string;
  /** Show the unit name (and value) on hover and focus. */
  readonly tooltip?: boolean;
  /** Language of names and default texts. */
  readonly lang?: Language;
  /** Click a region to show its divisions, then their arrondissements. */
  readonly drillDown?: boolean;
  /** Fit the view to the selection, or to what is shown. */
  readonly fitBounds?: boolean;
  /** Show the base map tiles. */
  readonly tiles?: boolean;
  /** Sources credited in the attribution control, after the boundaries. */
  readonly sources?: readonly SourceId[];
  readonly className?: string;
  /** Extra map layers or controls (shadcn-map components). */
  readonly children?: React.ReactNode;
}

const CHILD: Partial<Record<AdminLevel, AdminLevel>> = {
  region: "division",
  division: "arrondissement",
};

const TEXT = {
  en: { back: "Back", all: "Cameroon", noData: "No data" },
  fr: { back: "Retour", all: "Cameroun", noData: "Pas de données" },
} as const;

/** Colour classes, low to high. Defined by the registry item's CSS vars. */
const FILLS = [
  "var(--choropleth-1)",
  "var(--choropleth-2)",
  "var(--choropleth-3)",
  "var(--choropleth-4)",
  "var(--choropleth-5)",
] as const;

const cache: Partial<Record<string, Promise<Boundaries>>> = {};

function loadBoundaries(
  level: AdminLevel,
  detail: CameroonMapDetail,
): Promise<Boundaries> {
  const key = `${level}:${detail}`;
  const cached = cache[key];
  if (cached) return cached;
  const promise = GEOJSON[level]
    [detail]()
    .then((mod) => mod.default as Boundaries)
    .catch((error: unknown) => {
      delete cache[key];
      throw error;
    });
  cache[key] = promise;
  return promise;
}

function useBoundaries(level: AdminLevel, detail: CameroonMapDetail) {
  const [data, setData] = React.useState<{
    key: string;
    value: Boundaries;
  }>();
  const key = `${level}:${detail}`;
  React.useEffect(() => {
    let live = true;
    loadBoundaries(level, detail).then(
      (value) => live && setData({ key, value }),
      (error: unknown) => console.error("cameroon-map:", error),
    );
    return () => {
      live = false;
    };
  }, [level, detail, key]);
  return data?.key === key ? data.value : undefined;
}

type Bounds = [[number, number], [number, number]];

function toBounds(bbox: AdminUnit["bbox"]): Bounds {
  const [minLng, minLat, maxLng, maxLat] = bbox;
  return [
    [minLat, minLng],
    [maxLat, maxLng],
  ];
}

const CAMEROON: Bounds = regions.reduce<Bounds>(
  ([[s, w], [n, e]], r) => {
    const [[rs, rw], [rn, re]] = toBounds(r.bbox);
    return [
      [Math.min(s, rs), Math.min(w, rw)],
      [Math.max(n, rn), Math.max(e, re)],
    ];
  },
  [
    [90, 180],
    [-90, -180],
  ],
);

function boundsOf(pcode: Pcode): Bounds {
  const unit = getUnit(pcode);
  return unit ? toBounds(unit.bbox) : CAMEROON;
}

function escapeHtml(text: string): string {
  return text.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
}

/**
 * Map of Cameroon's regions, divisions or arrondissements on shadcn-map
 * (react-leaflet), keyed by OCHA P-code: selection, tooltips, a sequential
 * choropleth and optional drill-down. Boundaries come from the
 * `cameroon-locations` package and are credited in the attribution control.
 */
export function CameroonMap({
  level = "region",
  detail = "default",
  selected,
  defaultSelected,
  onSelect,
  values,
  scale = "quantile",
  legend,
  formatValue,
  tooltip = true,
  lang = "en",
  drillDown = false,
  fitBounds = true,
  tiles = true,
  sources,
  className,
  children,
}: CameroonMapProps) {
  const [internalSelected, setInternalSelected] = React.useState<
    Pcode | undefined
  >(defaultSelected);
  const current =
    selected === undefined ? internalSelected : (selected ?? undefined);
  // Drill-down: the unit whose children are shown. Tied to the starting
  // level, so changing `level` resets it.
  const [drill, setDrill] = React.useState<{
    readonly from: AdminLevel;
    readonly unit: AdminUnit | undefined;
  }>();
  const focus = drillDown && drill?.from === level ? drill.unit : undefined;
  const setFocus = (unit: AdminUnit | undefined) =>
    setDrill({ from: level, unit });
  const [fitTarget, setFitTarget] = React.useState<Pcode | undefined>(current);

  const viewLevel = (focus && CHILD[focus.level]) || level;
  const boundaries = useBoundaries(viewLevel, detail);
  const features = React.useMemo(() => {
    if (!boundaries) return undefined;
    if (!focus) return boundaries;
    return {
      ...boundaries,
      features: boundaries.features.filter(
        (f) => f.properties.parentPcode === focus.pcode,
      ),
    };
  }, [boundaries, focus]);

  const colorScale = React.useMemo(() => {
    if (!values || !features) return undefined;
    const shown = features.features
      .map((f) => values[f.properties.pcode])
      .filter((v): v is number => v !== undefined);
    return createColorScale(shown, { method: scale, steps: FILLS.length });
  }, [values, features, scale]);

  const format = React.useMemo(() => {
    if (formatValue) return formatValue;
    const nf = new Intl.NumberFormat(lang, {
      notation: "compact",
      maximumFractionDigits: 1,
    });
    return (v: number) => nf.format(v);
  }, [formatValue, lang]);

  // A new selection moves the view: fit to it and, with drill-down, show
  // its children (or its siblings, for an arrondissement), as a click does.
  React.useEffect(() => {
    setFitTarget(current);
    if (!drillDown || !CHILD[level]) return;
    const unit = current ? getUnit(current) : undefined;
    const shown =
      unit && !CHILD[unit.level] && unit.parentPcode
        ? getUnit(unit.parentPcode)
        : unit;
    setDrill({ from: level, unit: shown });
  }, [current, drillDown, level]);

  // Set when a keyboard action replaces the shapes, so focus moves to the
  // first shape of the new view instead of being lost.
  const refocus = React.useRef(false);

  const activate = (unit: AdminUnit, keyboard: boolean) => {
    if (selected === undefined) setInternalSelected(unit.pcode);
    if (drillDown && CHILD[unit.level]) {
      refocus.current = keyboard;
      setFocus(unit);
      setFitTarget(unit.pcode);
    }
    onSelect?.(unit);
  };

  const back = (event: React.MouseEvent) => {
    const parent = focus?.parentPcode ? getUnit(focus.parentPcode) : undefined;
    const up = parent && CHILD[parent.level] ? parent : undefined;
    // `detail` is 0 for a click from Enter or Space.
    refocus.current = event.detail === 0;
    setFocus(up);
    setFitTarget(up?.pcode);
  };

  const credit = escapeHtml(
    attribution(["ocha-cod-ab-cmr", ...(sources ?? [])]),
  );
  const text = TEXT[lang];
  const showLegend = legend !== false && colorScale?.domain !== undefined;

  return (
    <div
      data-slot="cameroon-map"
      className={cn(
        "bg-card relative isolate h-[420px] w-full overflow-hidden rounded-lg border",
        className,
      )}
    >
      <MapRoot
        center={[7.37, 12.35]}
        zoom={6}
        minZoom={5}
        zoomSnap={0.25}
        maxZoom={13}
        maxBounds={[
          [-1, 5],
          [16, 20],
        ]}
        attributionControl
        className="absolute inset-0 z-0 min-h-0 rounded-none"
      >
        {tiles ? <MapTileLayer /> : null}
        <Attribution html={credit} />
        <MapZoomControl position="top-2 left-2" />
        {features ? (
          <Boundaries
            key={`${viewLevel}:${detail}:${focus?.pcode ?? ""}`}
            data={features}
            refocus={refocus}
            state={{
              lang,
              tooltip,
              selected: current,
              values,
              colorScale,
              format,
              noData: text.noData,
              onActivate: activate,
            }}
          />
        ) : null}
        {fitBounds ? (
          <FitView bounds={fitTarget ? boundsOf(fitTarget) : CAMEROON} />
        ) : null}
        {drillDown && focus ? (
          <MapControlContainer className="top-2 left-12">
            <Button
              type="button"
              size="sm"
              variant="secondary"
              className="border shadow-xs"
              onClick={back}
            >
              <ArrowLeftIcon />
              <span>
                {text.back}
                <span className="text-muted-foreground font-normal">
                  {" · "}
                  {focus.name[lang]}
                </span>
              </span>
            </Button>
          </MapControlContainer>
        ) : null}
        {showLegend && colorScale?.domain ? (
          <MapControlContainer className="top-2 right-2">
            <figure className="bg-background/90 text-foreground rounded-md border px-2.5 py-2 text-[11px] shadow-xs backdrop-blur-sm">
              {legend ? (
                <figcaption className="mb-1.5 font-medium">{legend}</figcaption>
              ) : null}
              <div className="flex gap-0.5" aria-hidden="true">
                {FILLS.map((fill) => (
                  <span
                    key={fill}
                    className="h-2.5 w-9 first:rounded-l-sm last:rounded-r-sm"
                    style={{ background: fill }}
                  />
                ))}
              </div>
              <div className="text-muted-foreground mt-1 flex justify-between gap-2 tabular-nums">
                <span>{format(colorScale.domain[0])}</span>
                <span>{format(colorScale.domain[1])}</span>
              </div>
              <ul className="sr-only">
                {FILLS.map((fill, i) => {
                  const lo =
                    i === 0 ? colorScale.domain?.[0] : colorScale.breaks[i - 1];
                  const hi =
                    i === FILLS.length - 1
                      ? colorScale.domain?.[1]
                      : colorScale.breaks[i];
                  return (
                    <li key={fill}>
                      {lo === undefined ? "" : format(lo)} –{" "}
                      {hi === undefined ? "" : format(hi)}
                    </li>
                  );
                })}
              </ul>
            </figure>
          </MapControlContainer>
        ) : null}
        {children}
      </MapRoot>
    </div>
  );
}

/** Adds the data attribution to Leaflet's attribution control (required). */
function Attribution({ html }: { readonly html: string }) {
  const map = useMap();
  React.useEffect(() => {
    const control = map.attributionControl;
    control?.addAttribution(html);
    return () => {
      control?.removeAttribution(html);
    };
  }, [map, html]);
  return null;
}

function FitView({ bounds }: { readonly bounds: Bounds }) {
  const map = useMap();
  const first = React.useRef(true);
  const key = bounds.flat().join(",");
  // biome-ignore lint/correctness/useExhaustiveDependencies: refit when the box changes
  React.useEffect(() => {
    const target: LatLngBoundsExpression = bounds;
    const options = { padding: [24, 24] as [number, number], maxZoom: 11 };
    if (first.current) {
      first.current = false;
      map.fitBounds(target, options);
    } else {
      map.flyToBounds(target, { ...options, duration: 0.6 });
    }
  }, [map, key]);
  return null;
}

interface PaintState {
  readonly lang: Language;
  readonly tooltip: boolean;
  readonly selected: Pcode | undefined;
  readonly values: Readonly<Record<Pcode, number>> | undefined;
  readonly colorScale: ReturnType<typeof createColorScale> | undefined;
  readonly format: (value: number) => string;
  readonly noData: string;
  readonly onActivate: (unit: AdminUnit, keyboard: boolean) => void;
}

type Unit = Feature<Geometry, CameroonMapProperties>;

function isSelected(pcode: Pcode, selected: Pcode | undefined): boolean {
  return selected?.startsWith(pcode) ?? false;
}

function paint(layer: Polygon, pcode: Pcode, s: PaintState, active: boolean) {
  const el = layer.getElement() as SVGPathElement | undefined;
  if (!el) return;
  const chosen = isSelected(pcode, s.selected);
  const bucket = s.colorScale ? s.colorScale.bucket(s.values?.[pcode]) : -1;
  const choropleth = s.colorScale !== undefined;
  const fill = choropleth
    ? bucket >= 0
      ? (FILLS[bucket] ?? FILLS[0])
      : "var(--muted-foreground)"
    : chosen
      ? "var(--primary)"
      : "var(--foreground)";
  const fillOpacity = choropleth
    ? bucket >= 0
      ? active
        ? 1
        : 0.88
      : 0.18
    : chosen
      ? 0.32
      : active
        ? 0.16
        : 0.06;
  el.style.fill = fill;
  el.style.fillOpacity = String(fillOpacity);
  el.style.stroke =
    chosen || active
      ? "var(--foreground)"
      : choropleth
        ? "var(--background)"
        : "color-mix(in oklab, var(--foreground) 45%, transparent)";
  el.style.strokeWidth = chosen ? "2.5" : active ? "2" : "1";
  el.style.strokeOpacity = "1";
  el.style.outline = "none";
  el.style.cursor = "pointer";
  el.style.transition = "fill-opacity 120ms, stroke-width 120ms";
  el.setAttribute("aria-pressed", String(chosen));
  if (chosen || active) layer.bringToFront();
}

function tooltipContent(pcode: Pcode, name: string, s: PaintState) {
  const root = document.createElement("div");
  const title = document.createElement("div");
  title.className = "font-medium";
  title.textContent = name;
  root.append(title);
  if (s.values) {
    const value = s.values[pcode];
    const line = document.createElement("div");
    line.className = "tabular-nums opacity-80";
    line.textContent = value === undefined ? s.noData : s.format(value);
    root.append(line);
  }
  return root;
}

interface Shape {
  readonly layer: Polygon;
  readonly properties: CameroonMapProperties;
  /** The latest props, read when a tooltip opens. */
  readonly latest: () => PaintState;
}

const nameOf = (p: CameroonMapProperties, lang: Language) =>
  lang === "fr" ? p.name_fr : p.name_en;

/** Applies the props that can change after a shape is created. */
function sync({ layer, properties, latest }: Shape, s: PaintState) {
  const { pcode } = properties;
  paint(layer, pcode, s, false);
  layer.getElement()?.setAttribute("aria-label", nameOf(properties, s.lang));
  if (s.tooltip && !layer.getTooltip()) {
    layer.bindTooltip(
      () => tooltipContent(pcode, nameOf(properties, latest().lang), latest()),
      { sticky: true, direction: "top", offset: [0, -12], opacity: 1 },
    );
  } else if (!s.tooltip && layer.getTooltip()) {
    layer.unbindTooltip();
  }
}

function Boundaries({
  data,
  state,
  refocus,
}: {
  readonly data: Boundaries;
  readonly state: PaintState;
  readonly refocus: React.RefObject<boolean>;
}) {
  const latest = React.useRef(state);
  latest.current = state;
  const shapes = React.useRef(new Map<Pcode, Shape>());

  React.useEffect(() => {
    for (const shape of shapes.current.values()) sync(shape, state);
    // Keep the selected outline above its neighbours.
    for (const [pcode, { layer }] of shapes.current) {
      if (isSelected(pcode, state.selected)) layer.bringToFront();
    }
  }, [state]);

  // After a keyboard drill, focus the first shape of the new view.
  const map = useMap();
  React.useEffect(() => {
    if (!refocus.current) return;
    refocus.current = false;
    const first = shapes.current.values().next().value as Shape | undefined;
    const el = first?.layer.getElement() as SVGElement | undefined;
    if (!el) return;
    const focus = () => el.focus();
    focus();
    if (document.activeElement === el) return;
    // Shapes are hidden, so not focusable, while the map zooms.
    map.once("moveend", focus);
    return () => {
      map.off("moveend", focus);
    };
  }, [map, refocus]);

  const onEachFeature = React.useCallback((feature: Unit, layer: Layer) => {
    const path = layer as Polygon;
    const { properties } = feature;
    const { pcode } = properties;
    const shape: Shape = {
      layer: path,
      properties,
      latest: () => latest.current,
    };
    shapes.current.set(pcode, shape);
    const activate = (keyboard: boolean) => {
      const unit = getUnit(pcode);
      if (unit) latest.current.onActivate(unit, keyboard);
    };
    path.on({
      add: () => {
        const el = path.getElement();
        if (!el) return;
        el.setAttribute("tabindex", "0");
        el.setAttribute("role", "button");
        sync(shape, latest.current);
        el.addEventListener("keydown", (event) => {
          const e = event as KeyboardEvent;
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            activate(true);
          }
        });
        el.addEventListener("focus", () => {
          paint(path, pcode, latest.current, true);
          path.openTooltip(path.getBounds().getCenter());
        });
        el.addEventListener("blur", () => {
          paint(path, pcode, latest.current, false);
          path.closeTooltip();
        });
      },
      remove: () => shapes.current.delete(pcode),
      mouseover: () => paint(path, pcode, latest.current, true),
      mouseout: () => paint(path, pcode, latest.current, false),
      click: () => activate(false),
    });
  }, []);

  return <GeoJSON data={data} onEachFeature={onEachFeature} />;
}
