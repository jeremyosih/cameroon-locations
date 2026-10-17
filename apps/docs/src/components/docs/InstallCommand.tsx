import { useEffect, useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CopyButton } from "./CopyButton";

const MANAGERS = ["npm", "pnpm", "bun", "yarn"] as const;
type Manager = (typeof MANAGERS)[number];

const STORAGE_KEY = "docs:package-manager";
const EVENT = "docs:package-manager";

export interface InstallCommandProps {
  /** Packages to install, e.g. `"cameroon-locations"` or `"cameroon-locations effect"`. */
  readonly packages?: string;
  /** Install as dev dependency. */
  readonly dev?: boolean;
  /** shadcn registry item URL; renders `shadcn add <url>` instead of an install. */
  readonly shadcn?: string;
  /** Explicit command per manager. Wins over `packages` and `shadcn`. */
  readonly commands?: Partial<Record<Manager, string>>;
}

function commandFor(manager: Manager, props: InstallCommandProps): string {
  const explicit = props.commands?.[manager];
  if (explicit) return explicit;
  if (props.shadcn) {
    const runner = {
      npm: "npx",
      pnpm: "pnpm dlx",
      bun: "bunx --bun",
      yarn: "yarn dlx",
    }[manager];
    return `${runner} shadcn@latest add ${props.shadcn}`;
  }
  const pkgs = props.packages ?? "cameroon-locations";
  const dev = props.dev ? " -D" : "";
  const verb = manager === "npm" ? "install" : "add";
  return `${manager} ${verb}${dev} ${pkgs}`;
}

function isManager(value: string | null): value is Manager {
  return MANAGERS.includes(value as Manager);
}

/**
 * Install command with an npm/pnpm/bun/yarn switcher. The choice is
 * remembered and shared by every instance on the page.
 */
export function InstallCommand(props: InstallCommandProps) {
  const [manager, setManager] = useState<Manager>("npm");

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (isManager(saved)) setManager(saved);
    const onChange = (e: Event) => {
      const next = (e as CustomEvent<string>).detail;
      if (isManager(next)) setManager(next);
    };
    window.addEventListener(EVENT, onChange);
    return () => window.removeEventListener(EVENT, onChange);
  }, []);

  const select = (value: string) => {
    if (!isManager(value)) return;
    localStorage.setItem(STORAGE_KEY, value);
    window.dispatchEvent(new CustomEvent(EVENT, { detail: value }));
  };

  const command = commandFor(manager, props);

  return (
    <div className="not-prose bg-code my-6 overflow-hidden rounded-lg border">
      <Tabs value={manager} onValueChange={select} className="gap-0">
        <div className="flex items-center justify-between border-b px-2 py-1.5">
          <TabsList aria-label="Package manager">
            {MANAGERS.map((m) => (
              <TabsTrigger key={m} value={m} className="font-mono text-xs">
                {m}
              </TabsTrigger>
            ))}
          </TabsList>
          <CopyButton value={command} />
        </div>
      </Tabs>
      <pre className="overflow-x-auto px-4 py-3.5 font-mono text-[0.8125rem] leading-relaxed">
        <code>
          <span className="text-muted-foreground select-none">$ </span>
          {command}
        </code>
      </pre>
    </div>
  );
}

export default InstallCommand;
