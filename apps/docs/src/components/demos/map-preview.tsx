import { ThemeProvider, useTheme } from "next-themes";
import { lazy, Suspense, useEffect } from "react";

// Lazy, so the server build never evaluates Leaflet (it needs `window`).
const DEMOS = {
  basic: lazy(() => import("./cameroon-map-demo")),
  choropleth: lazy(() => import("./cameroon-map-choropleth-demo")),
  drilldown: lazy(() => import("./cameroon-map-drilldown-demo")),
};

const read = (): "light" | "dark" =>
  document.documentElement.classList.contains("dark") ? "dark" : "light";

/** Mirrors the docs theme toggle (the `dark` class) into next-themes. */
function SyncTheme() {
  const { setTheme } = useTheme();
  useEffect(() => {
    setTheme(read());
    const observer = new MutationObserver(() => setTheme(read()));
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, [setTheme]);
  return null;
}

/**
 * Hosts a map demo on the docs site (`client:only="react"`). shadcn-map
 * picks light or dark tiles from next-themes; the docs have their own theme
 * toggle, so this forwards it. In a Next.js app, the app's `ThemeProvider`
 * does this.
 */
export default function MapPreview({
  demo,
}: {
  readonly demo: keyof typeof DEMOS;
}) {
  const Demo = DEMOS[demo];
  return (
    <ThemeProvider
      attribute="class"
      storageKey="theme"
      defaultTheme={read()}
      enableSystem={false}
      disableTransitionOnChange
    >
      <SyncTheme />
      <Suspense
        fallback={
          <div className="bg-muted/40 h-[420px] w-full animate-pulse rounded-lg border" />
        }
      >
        <Demo />
      </Suspense>
    </ThemeProvider>
  );
}
