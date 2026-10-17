"use client";

// Leaflet building blocks for cameroon-map: the map, base map tiles, a
// layers menu, zoom and fullscreen controls.
//
// Adapted from shadcn-map (https://github.com/tonghohin/shadcn-map),
// MIT License, Copyright (c) 2025 Hin. Trimmed to what cameroon-map needs.
// Changes: the layers menu is drawn inside the map element, so it needs no
// dropdown-menu, stays inside the map and works in fullscreen; fullscreen
// uses the browser Fullscreen API; dark tiles follow the `dark` class on
// <html>, so no theme provider is needed.
import type {} from "@maplibre/maplibre-gl-leaflet";
import {
  DomEvent,
  type LatLngExpression,
  type LayerGroup as LeafletLayerGroup,
  type Map as LeafletMap,
  type TileLayer as LeafletTileLayer,
  type MaplibreGL,
} from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  CheckIcon,
  CircleIcon,
  LayersIcon,
  MaximizeIcon,
  MinimizeIcon,
  MinusIcon,
  PlusIcon,
} from "lucide-react";
import type { Map as MaplibreMap } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import * as React from "react";
import {
  LayerGroup,
  type LayerGroupProps,
  MapContainer,
  type MapContainerProps,
  TileLayer,
  type TileLayerProps,
  useMap,
  useMapEvents,
} from "react-leaflet";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { cn } from "@/lib/utils";

function MapRoot({
  zoom = 15,
  minZoom = 1,
  maxZoom = 18,
  maxBounds = [
    [180, -Infinity],
    [-180, Infinity],
  ],
  maxBoundsViscosity = 1,
  className,
  ...props
}: Omit<MapContainerProps, "zoomControl"> & {
  center: LatLngExpression;
  ref?: React.Ref<LeafletMap>;
}) {
  return (
    <MapContainer
      zoom={zoom}
      minZoom={minZoom}
      maxZoom={maxZoom}
      maxBounds={maxBounds}
      maxBoundsViscosity={maxBoundsViscosity}
      attributionControl={false}
      zoomControl={false}
      className={cn("z-50 size-full min-h-96 flex-1 rounded-md", className)}
      {...props}
    />
  );
}

// --- Base map tiles ---------------------------------------------------------

const DEFAULT_VECTOR_STYLE_URL =
  "https://tiles.openfreemap.org/styles/positron";
const DEFAULT_DARK_VECTOR_STYLE_URL =
  "https://tiles.openfreemap.org/styles/dark";
const DEFAULT_RASTER_URL = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
const DEFAULT_RASTER_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';

interface MapTileSourceProps {
  vectorStyleUrl?: string;
  darkVectorStyleUrl?: string;
  rasterUrl?: string;
  darkRasterUrl?: string;
  rasterAttribution?: string;
  darkRasterAttribution?: string;
}

type MapTileSource =
  // No attribution needed: vector styles define it in their sources.
  | { type: "vector"; styleUrl: string }
  | { type: "raster"; url: string; attribution?: string };

function resolveTileSource({
  isDark,
  webglSupported,
  vectorStyleUrl,
  darkVectorStyleUrl,
  rasterUrl,
  darkRasterUrl,
  rasterAttribution,
  darkRasterAttribution,
}: MapTileSourceProps & {
  isDark: boolean;
  webglSupported: boolean;
}): MapTileSource {
  const userStyleUrl = isDark
    ? (darkVectorStyleUrl ?? vectorStyleUrl)
    : vectorStyleUrl;
  const userRasterUrl = isDark ? (darkRasterUrl ?? rasterUrl) : rasterUrl;
  const userRasterAttribution = isDark
    ? (darkRasterAttribution ?? rasterAttribution)
    : rasterAttribution;

  if (webglSupported && (userStyleUrl || !userRasterUrl)) {
    return {
      type: "vector",
      styleUrl:
        userStyleUrl ??
        (isDark ? DEFAULT_DARK_VECTOR_STYLE_URL : DEFAULT_VECTOR_STYLE_URL),
    };
  }

  return userRasterUrl
    ? { type: "raster", url: userRasterUrl, attribution: userRasterAttribution }
    : {
        type: "raster",
        url: DEFAULT_RASTER_URL,
        attribution: userRasterAttribution ?? DEFAULT_RASTER_ATTRIBUTION,
      };
}

function getStyleAttribution(glMap: MaplibreMap) {
  return Object.keys(glMap.getStyle()?.sources ?? {})
    .map((sourceId) => glMap.getSource(sourceId)?.attribution)
    .filter(Boolean)
    .join(", ");
}

function MapVectorLayer({
  styleUrl,
  onError,
}: {
  styleUrl: string;
  onError: () => void;
}) {
  const map = useMap();
  const layerRef = React.useRef<MaplibreGL | null>(null);
  const styleUrlRef = React.useRef(styleUrl);
  const onErrorRef = React.useRef(onError);

  React.useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  React.useEffect(() => {
    styleUrlRef.current = styleUrl;
    layerRef.current?.getMaplibreMap()?.setStyle(styleUrl);
  }, [styleUrl]);

  React.useEffect(() => {
    let cancelled = false;
    let contextLostTimeout: ReturnType<typeof setTimeout> | undefined;
    // Managed here rather than by maplibre-gl-leaflet, so it updates when the
    // style changes and is removed with the layer.
    let attribution = "";

    function removeLayer(layer: MaplibreGL, isBroken = false) {
      if (isBroken) {
        // A layer that failed to initialize has no GL map to clean up.
        layer.onRemove = function (this: MaplibreGL) {
          this.getContainer()?.remove();
          return this;
        };
      }
      map.removeLayer(layer);
    }

    async function addLayer() {
      const { maplibreGL } = await import("@maplibre/maplibre-gl-leaflet");
      if (cancelled) return;

      const layer = maplibreGL({
        style: styleUrlRef.current,
        attributionControl: false,
      });

      try {
        layer.addTo(map);
      } catch {
        removeLayer(layer, true);
        onErrorRef.current();
        return;
      }

      const glMap = layer.getMaplibreMap();
      glMap.on("webglcontextlost", () => {
        contextLostTimeout = setTimeout(() => onErrorRef.current(), 3000);
      });
      glMap.on("webglcontextrestored", () => {
        clearTimeout(contextLostTimeout);
      });
      glMap.on("idle", () => {
        const nextAttribution = getStyleAttribution(glMap);
        if (nextAttribution === attribution) return;
        map.attributionControl?.removeAttribution(attribution);
        map.attributionControl?.addAttribution(nextAttribution);
        attribution = nextAttribution;
      });
      layerRef.current = layer;
    }

    addLayer();

    return () => {
      cancelled = true;
      clearTimeout(contextLostTimeout);
      map.attributionControl?.removeAttribution(attribution);
      if (layerRef.current) {
        removeLayer(layerRef.current);
        layerRef.current = null;
      }
    };
  }, [map]);

  return null;
}

// --- Layers -----------------------------------------------------------------

interface MapTileLayerOption {
  /** Identifies the layer; keep it stable. */
  name: string;
  /** Shown in the layers menu. Defaults to `name`. */
  label?: string;
}

interface MapLayerGroupOption {
  /** Identifies the group; keep it stable. */
  name: string;
  /** Shown in the layers menu. Defaults to `name`. */
  label?: string;
  disabled?: boolean;
}

interface MapLayersContextType {
  registerTileLayer: (layer: MapTileLayerOption) => () => void;
  tileLayers: MapTileLayerOption[];
  selectedTileLayer: string;
  setSelectedTileLayer: (name: string) => void;
  registerLayerGroup: (layer: MapLayerGroupOption) => () => void;
  layerGroups: MapLayerGroupOption[];
  activeLayerGroups: string[];
  setActiveLayerGroups: (names: string[]) => void;
}

const MapLayersContext = React.createContext<MapLayersContextType | null>(null);

function useMapLayersContext() {
  return React.useContext(MapLayersContext);
}

/**
 * A base map. Vector tiles (OpenFreeMap) when WebGL is available, raster
 * tiles otherwise or when only `rasterUrl` is given. Inside `MapLayers`,
 * each one is an option of the layers menu.
 */
function MapTileLayer({
  name = "Default",
  label,
  vectorStyleUrl,
  darkVectorStyleUrl,
  rasterUrl,
  darkRasterUrl,
  rasterAttribution,
  darkRasterAttribution,
  ...props
}: Omit<Partial<TileLayerProps>, "url" | "attribution"> &
  MapTileSourceProps & {
    name?: string;
    label?: string;
    /** Only applies to raster tiles. */
    ref?: React.Ref<LeafletTileLayer>;
  }) {
  const map = useMap();
  if (map.attributionControl) {
    map.attributionControl.setPrefix("");
  }

  const context = useMapLayersContext();
  const isDark = useIsDark();
  const webgl = useWebGLSupport();
  const [isVectorFailed, setIsVectorFailed] = React.useState(false);

  const register = context?.registerTileLayer;
  React.useEffect(() => register?.({ name, label }), [register, name, label]);

  if (context && context.selectedTileLayer !== name) return null;
  if (webgl === null) return null;

  const source = resolveTileSource({
    isDark,
    webglSupported: webgl && !isVectorFailed,
    vectorStyleUrl,
    darkVectorStyleUrl,
    rasterUrl,
    darkRasterUrl,
    rasterAttribution,
    darkRasterAttribution,
  });

  if (source.type === "vector") {
    return (
      <MapVectorLayer
        styleUrl={source.styleUrl}
        onError={() => setIsVectorFailed(true)}
      />
    );
  }

  return (
    <TileLayer url={source.url} attribution={source.attribution} {...props} />
  );
}

/** An overlay that the layers menu can switch on and off. */
function MapLayerGroup({
  name,
  label,
  disabled,
  ...props
}: LayerGroupProps &
  MapLayerGroupOption & { ref?: React.Ref<LeafletLayerGroup> }) {
  const context = useMapLayersContext();

  const register = context?.registerLayerGroup;
  React.useEffect(
    () => register?.({ name, label, disabled }),
    [register, name, label, disabled],
  );

  if (context && !context.activeLayerGroups.includes(name)) return null;
  return <LayerGroup {...props} />;
}

/** Holds the base maps and overlays listed by `MapLayersControl`. */
function MapLayers({
  defaultTileLayer,
  defaultLayerGroups = [],
  ...props
}: Omit<React.ComponentProps<typeof MapLayersContext.Provider>, "value"> & {
  defaultTileLayer?: string;
  defaultLayerGroups?: string[];
}) {
  const [tileLayers, setTileLayers] = React.useState<MapTileLayerOption[]>([]);
  const [selectedTileLayer, setSelectedTileLayer] = React.useState<string>(
    defaultTileLayer || "",
  );
  const [layerGroups, setLayerGroups] = React.useState<MapLayerGroupOption[]>(
    [],
  );
  const [activeLayerGroups, setActiveLayerGroups] =
    React.useState<string[]>(defaultLayerGroups);

  // Registration returns its cleanup, so options follow mounts and label
  // changes (e.g. a new language) instead of going stale. The menu keeps
  // the order in which options first appeared.
  const order = React.useRef(new Map<string, number>());
  const rank = React.useCallback((name: string) => {
    const known = order.current.get(name);
    if (known !== undefined) return known;
    order.current.set(name, order.current.size);
    return order.current.size - 1;
  }, []);

  const registerTileLayer = React.useCallback(
    (tileLayer: MapTileLayerOption) => {
      setTileLayers((prev) => upsert(prev, tileLayer, rank));
      return () => setTileLayers((prev) => remove(prev, tileLayer.name));
    },
    [rank],
  );

  const registerLayerGroup = React.useCallback(
    (layerGroup: MapLayerGroupOption) => {
      setLayerGroups((prev) => upsert(prev, layerGroup, rank));
      return () => setLayerGroups((prev) => remove(prev, layerGroup.name));
    },
    [rank],
  );

  React.useEffect(() => {
    if (
      defaultTileLayer &&
      tileLayers.length > 0 &&
      !tileLayers.some((tileLayer) => tileLayer.name === defaultTileLayer)
    ) {
      throw new Error(
        `Invalid defaultTileLayer "${defaultTileLayer}" provided to MapLayers. It must match a MapTileLayer's name prop.`,
      );
    }

    // Select the default, or the first, when nothing (or a layer that is
    // gone) is selected.
    const first = tileLayers[0];
    if (
      first &&
      !tileLayers.some((layer) => layer.name === selectedTileLayer)
    ) {
      setSelectedTileLayer(
        defaultTileLayer &&
          tileLayers.some((layer) => layer.name === defaultTileLayer)
          ? defaultTileLayer
          : first.name,
      );
    }

    if (
      defaultLayerGroups.length > 0 &&
      layerGroups.length > 0 &&
      defaultLayerGroups.some(
        (name) => !layerGroups.some((group) => group.name === name),
      )
    ) {
      throw new Error(
        "Invalid defaultLayerGroups value provided to MapLayers. All names must match a MapLayerGroup's name prop.",
      );
    }
  }, [
    tileLayers,
    defaultTileLayer,
    selectedTileLayer,
    layerGroups,
    defaultLayerGroups,
  ]);

  const value = React.useMemo(
    () => ({
      registerTileLayer,
      tileLayers,
      selectedTileLayer,
      setSelectedTileLayer,
      registerLayerGroup,
      layerGroups,
      activeLayerGroups,
      setActiveLayerGroups,
    }),
    [
      registerTileLayer,
      tileLayers,
      selectedTileLayer,
      registerLayerGroup,
      layerGroups,
      activeLayerGroups,
    ],
  );

  return <MapLayersContext.Provider value={value} {...props} />;
}

/** Adds or replaces `item`, keeping options in first-registration order. */
function upsert<T extends { name: string }>(
  list: T[],
  item: T,
  rank: (name: string) => number,
): T[] {
  rank(item.name); // Ranks on arrival, not in whatever order sort compares.
  return [...list.filter((entry) => entry.name !== item.name), item].sort(
    (a, b) => rank(a.name) - rank(b.name),
  );
}

function remove<T extends { name: string }>(list: T[], name: string): T[] {
  return list.filter((entry) => entry.name !== name);
}

const MENU_ITEM =
  "relative flex w-full cursor-default items-center gap-2 rounded-sm py-1.5 pr-2 pl-8 text-left text-sm outline-hidden select-none hover:bg-accent hover:text-accent-foreground focus-visible:bg-accent focus-visible:text-accent-foreground disabled:pointer-events-none disabled:opacity-50";

/**
 * Button and menu to pick the base map and toggle overlays. Renders nothing
 * unless there is a choice to make. The menu is part of the map element, so
 * it opens inside the map, also in fullscreen.
 */
function MapLayersControl({
  tileLayersLabel = "Map type",
  layerGroupsLabel = "Layers",
  position = "top-1 right-1",
  align = "end",
  className,
  onClick,
  onKeyDown,
  ...props
}: React.ComponentProps<"button"> & {
  tileLayersLabel?: string;
  layerGroupsLabel?: string;
  position?: string;
  /** Menu edge aligned with the button: `end` for a control on the right. */
  align?: "start" | "end";
}) {
  const context = useMapLayersContext();
  if (!context) {
    throw new Error("MapLayersControl must be used within MapLayers");
  }
  const {
    tileLayers,
    selectedTileLayer,
    setSelectedTileLayer,
    layerGroups,
    activeLayerGroups,
    setActiveLayerGroups,
  } = context;

  const [open, setOpen] = React.useState(false);
  const rootRef = React.useRef<HTMLDivElement>(null);
  const menuRef = React.useRef<HTMLDivElement>(null);
  const id = React.useId();

  const items = () =>
    Array.from(
      menuRef.current?.querySelectorAll<HTMLButtonElement>(
        "[role^=menuitem]:not(:disabled)",
      ) ?? [],
    );

  const close = (refocus: boolean) => {
    setOpen(false);
    // The trigger is the first button. Found, not a ref: Button flavours
    // differ in how they forward refs.
    if (refocus) rootRef.current?.querySelector("button")?.focus();
  };

  // Close on a press outside the control.
  React.useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  // Focus the checked option (or the first) when the menu opens.
  // biome-ignore lint/correctness/useExhaustiveDependencies: on open only
  React.useEffect(() => {
    if (!open) return;
    const all = items();
    (
      all.find((el) => el.getAttribute("aria-checked") === "true") ?? all[0]
    )?.focus();
  }, [open]);

  const showTileLayers = tileLayers.length > 1;
  const showLayerGroups = layerGroups.length > 0;
  if (!showTileLayers && !showLayerGroups) return null;

  const onMenuKeyDown = (event: React.KeyboardEvent) => {
    const all = items();
    const index = all.indexOf(document.activeElement as HTMLButtonElement);
    const move = (to: number) => {
      event.preventDefault();
      all[(to + all.length) % all.length]?.focus();
    };
    if (event.key === "ArrowDown") move(index + 1);
    else if (event.key === "ArrowUp") move(index - 1);
    else if (event.key === "Home") move(0);
    else if (event.key === "End") move(all.length - 1);
    else if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      close(true);
    } else if (event.key === "Tab") close(false);
  };

  return (
    <MapControlContainer className={cn(position, className)}>
      <div ref={rootRef} className="relative">
        <Button
          type="button"
          variant="secondary"
          size="icon-sm"
          aria-label="Select layers"
          title="Select layers"
          aria-haspopup="menu"
          aria-expanded={open}
          aria-controls={open ? id : undefined}
          className="border"
          onClick={(event) => {
            onClick?.(event);
            setOpen((value) => !value);
          }}
          onKeyDown={(event) => {
            onKeyDown?.(event);
            if (event.key === "ArrowDown") {
              event.preventDefault();
              setOpen(true);
            }
          }}
          {...props}
        >
          <LayersIcon />
        </Button>
        {open ? (
          <div
            ref={menuRef}
            id={id}
            role="menu"
            aria-label="Layers"
            data-slot="map-layers-menu"
            onKeyDown={onMenuKeyDown}
            className={cn(
              "bg-popover text-popover-foreground animate-in fade-in-0 zoom-in-95 absolute top-full mt-1 max-h-72 min-w-36 overflow-y-auto rounded-md border p-1 shadow-md",
              align === "end" ? "right-0" : "left-0",
            )}
          >
            {showTileLayers ? (
              // biome-ignore lint/a11y/useSemanticElements: a menu group, not a form
              <div role="group" aria-labelledby={`${id}-tiles`}>
                <div
                  id={`${id}-tiles`}
                  className="px-2 py-1.5 text-sm font-medium"
                >
                  {tileLayersLabel}
                </div>
                {tileLayers.map((layer) => {
                  const checked = layer.name === selectedTileLayer;
                  return (
                    <button
                      key={layer.name}
                      type="button"
                      role="menuitemradio"
                      aria-checked={checked}
                      tabIndex={-1}
                      className={MENU_ITEM}
                      onClick={() => {
                        setSelectedTileLayer(layer.name);
                        close(true);
                      }}
                    >
                      <span className="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center">
                        {checked ? (
                          <CircleIcon className="size-2 fill-current" />
                        ) : null}
                      </span>
                      {layer.label ?? layer.name}
                    </button>
                  );
                })}
              </div>
            ) : null}
            {showTileLayers && showLayerGroups ? (
              <hr className="bg-border -mx-1 my-1 h-px border-0" />
            ) : null}
            {showLayerGroups ? (
              // biome-ignore lint/a11y/useSemanticElements: a menu group, not a form
              <div role="group" aria-labelledby={`${id}-groups`}>
                <div
                  id={`${id}-groups`}
                  className="px-2 py-1.5 text-sm font-medium"
                >
                  {layerGroupsLabel}
                </div>
                {layerGroups.map((group) => {
                  const checked = activeLayerGroups.includes(group.name);
                  return (
                    <button
                      key={group.name}
                      type="button"
                      role="menuitemcheckbox"
                      aria-checked={checked}
                      tabIndex={-1}
                      disabled={group.disabled}
                      className={MENU_ITEM}
                      onClick={() =>
                        setActiveLayerGroups(
                          checked
                            ? activeLayerGroups.filter((n) => n !== group.name)
                            : [...activeLayerGroups, group.name],
                        )
                      }
                    >
                      <span className="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center">
                        {checked ? <CheckIcon className="size-4" /> : null}
                      </span>
                      {group.label ?? group.name}
                    </button>
                  );
                })}
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </MapControlContainer>
  );
}

// --- Controls ---------------------------------------------------------------

function MapZoomControl({
  position = "top-1 left-1",
  className,
  ...props
}: React.ComponentProps<"div"> & { position?: string }) {
  const map = useMap();
  const [zoomLevel, setZoomLevel] = React.useState(map.getZoom());

  useMapEvents({
    zoomend: () => setZoomLevel(map.getZoom()),
  });

  return (
    <MapControlContainer className={cn(position, className)}>
      <ButtonGroup orientation="vertical" aria-label="Zoom controls" {...props}>
        <Button
          type="button"
          size="icon-sm"
          variant="secondary"
          aria-label="Zoom in"
          title="Zoom in"
          className="border"
          disabled={zoomLevel >= map.getMaxZoom()}
          onClick={() => map.zoomIn()}
        >
          <PlusIcon />
        </Button>
        <Button
          type="button"
          size="icon-sm"
          variant="secondary"
          aria-label="Zoom out"
          title="Zoom out"
          className="border"
          disabled={zoomLevel <= map.getMinZoom()}
          onClick={() => map.zoomOut()}
        >
          <MinusIcon />
        </Button>
      </ButtonGroup>
    </MapControlContainer>
  );
}

/** Shows the map element fullscreen. Hidden where the browser can't. */
function MapFullscreenControl({
  position = "top-1 right-1",
  className,
  ...props
}: React.ComponentProps<"button"> & { position?: string }) {
  const map = useMap();
  const [supported, setSupported] = React.useState(false);
  const [isFullscreen, setIsFullscreen] = React.useState(false);

  React.useEffect(() => {
    const element = map.getContainer();
    setSupported(
      document.fullscreenEnabled &&
        typeof element.requestFullscreen === "function",
    );
    const onChange = () => {
      setIsFullscreen(document.fullscreenElement === element);
      map.invalidateSize();
    };
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, [map]);

  if (!supported) return null;

  const toggle = () => {
    const element = map.getContainer();
    if (document.fullscreenElement === element) {
      void document.exitFullscreen();
    } else {
      void element.requestFullscreen();
    }
  };

  return (
    <MapControlContainer className={cn(position, className)}>
      <Button
        type="button"
        size="icon-sm"
        variant="secondary"
        onClick={toggle}
        aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
        title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
        className="border"
        {...props}
      >
        {isFullscreen ? <MinimizeIcon /> : <MaximizeIcon />}
      </Button>
    </MapControlContainer>
  );
}

/** Positions content over the map; clicks and scrolls don't reach the map. */
function MapControlContainer({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const element = containerRef.current;
    if (!element) return;
    DomEvent.disableClickPropagation(element);
    DomEvent.disableScrollPropagation(element);
  }, []);

  return (
    <div
      ref={containerRef}
      className={cn("absolute z-1000 size-fit cursor-default", className)}
      {...props}
    />
  );
}

// --- Hooks ------------------------------------------------------------------

function subscribeToTheme(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  });
  return () => observer.disconnect();
}

/** `true` while <html> has the `dark` class (shadcn/ui's dark mode). */
function useIsDark() {
  return React.useSyncExternalStore(
    subscribeToTheme,
    () => document.documentElement.classList.contains("dark"),
    () => false,
  );
}

let isWebGLSupportedCache: boolean | undefined;

function isWebGLSupported() {
  if (isWebGLSupportedCache === undefined) {
    try {
      const canvas = document.createElement("canvas");
      const gl = canvas.getContext("webgl2") ?? canvas.getContext("webgl");
      isWebGLSupportedCache = !!gl;
      gl?.getExtension("WEBGL_lose_context")?.loseContext();
    } catch {
      isWebGLSupportedCache = false;
    }
  }
  return isWebGLSupportedCache;
}

function useWebGLSupport() {
  const [isSupported, setIsSupported] = React.useState<boolean | null>(null);
  React.useEffect(() => {
    setIsSupported(isWebGLSupported());
  }, []);
  return isSupported;
}

export {
  MapControlContainer,
  MapFullscreenControl,
  MapLayerGroup,
  MapLayers,
  MapLayersControl,
  MapRoot,
  MapTileLayer,
  MapZoomControl,
};
