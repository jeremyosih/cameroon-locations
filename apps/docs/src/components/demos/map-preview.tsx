import { lazy, Suspense } from "react";

// Lazy, so the server build never evaluates Leaflet (it needs `window`).
const DEMOS = {
  basic: lazy(() => import("./cameroon-map-demo")),
  choropleth: lazy(() => import("./cameroon-map-choropleth-demo")),
  drilldown: lazy(() => import("./cameroon-map-drilldown-demo")),
};

/**
 * Hosts a map demo on the docs site (`client:only="react"`). Base map tiles
 * follow the docs theme toggle through the `dark` class on `<html>`.
 */
export default function MapPreview({
  demo,
}: {
  readonly demo: keyof typeof DEMOS;
}) {
  const Demo = DEMOS[demo];
  return (
    <Suspense
      fallback={
        <div className="bg-muted/40 h-[420px] w-full animate-pulse rounded-lg border" />
      }
    >
      <Demo />
    </Suspense>
  );
}
