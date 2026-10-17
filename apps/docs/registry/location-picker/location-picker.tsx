"use client";

import { CheckIcon, ChevronsUpDownIcon } from "lucide-react";
import * as React from "react";
import { buttonVariants } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  getAncestors,
  getChildren,
  getUnit,
} from "@/lib/cameroon-locations/lookup";
import { normalizeName } from "@/lib/cameroon-locations/normalize";
import { search } from "@/lib/cameroon-locations/search";
import type {
  AdminLevel,
  AdminUnit,
  Arrondissement,
  Division,
  Language,
  Pcode,
  Region,
} from "@/lib/cameroon-locations/types";
import { cn } from "@/lib/utils";

const LEVELS = ["region", "division", "arrondissement"] as const;

/** P-codes of a (possibly partial) selection. */
export interface LocationPickerPcodes {
  readonly region?: Pcode;
  readonly division?: Pcode;
  readonly arrondissement?: Pcode;
}

/**
 * A P-code of any level (`"CM002007001"`, `"CM002"`), or the P-codes of a
 * partial selection. Parents are derived from the deepest P-code.
 */
export type LocationPickerValue = Pcode | LocationPickerPcodes;

/** What `onValueChange` receives: the selected records, top to bottom. */
export interface LocationSelection {
  readonly region: Region | undefined;
  readonly division: Division | undefined;
  readonly arrondissement: Arrondissement | undefined;
  /** The deepest selected unit. */
  readonly unit: AdminUnit | undefined;
  /** P-code of `unit`. */
  readonly pcode: Pcode | undefined;
}

export interface LocationPickerProps {
  /** Controlled value. `null` clears the picker. */
  readonly value?: LocationPickerValue | null;
  /** Initial value when uncontrolled. */
  readonly defaultValue?: LocationPickerValue;
  /** Called with the full selection whenever a level changes. */
  readonly onValueChange?: (selection: LocationSelection) => void;
  /** Language of names and default texts. */
  readonly lang?: Language;
  /** Deepest level to pick. */
  readonly depth?: AdminLevel;
  readonly disabled?: boolean;
  /** Field labels per level. */
  readonly labels?: Partial<Record<AdminLevel, string>>;
  /** Trigger placeholders per level. */
  readonly placeholders?: Partial<Record<AdminLevel, string>>;
  readonly searchPlaceholder?: string;
  readonly emptyMessage?: string;
  /** Renders a hidden input with the deepest selected P-code, for forms. */
  readonly name?: string;
  /** Base id for the triggers (`${id}-region`, …). */
  readonly id?: string;
  readonly className?: string;
}

const TEXT = {
  en: {
    labels: {
      region: "Region",
      division: "Division",
      arrondissement: "Arrondissement",
    },
    placeholders: {
      region: "Select a region",
      division: "Select a division",
      arrondissement: "Select an arrondissement",
    },
    search: "Search…",
    empty: "No match.",
  },
  fr: {
    labels: {
      region: "Région",
      division: "Département",
      arrondissement: "Arrondissement",
    },
    placeholders: {
      region: "Choisir une région",
      division: "Choisir un département",
      arrondissement: "Choisir un arrondissement",
    },
    search: "Rechercher…",
    empty: "Aucun résultat.",
  },
} as const;

/** P-codes from the deepest valid unit in `value`, cut at `depth`. */
function toPcodes(
  value: LocationPickerValue | null | undefined,
  depth: AdminLevel,
): LocationPickerPcodes {
  const pcode =
    typeof value === "string"
      ? value
      : (value?.arrondissement ?? value?.division ?? value?.region);
  const unit = pcode ? getUnit(pcode) : undefined;
  if (!unit) return {};
  const chain = [...getAncestors(unit.pcode), unit];
  const max = LEVELS.indexOf(depth);
  const out: Record<string, Pcode> = {};
  for (const u of chain) {
    if (LEVELS.indexOf(u.level) <= max) out[u.level] = u.pcode;
  }
  return out;
}

function toSelection(pcodes: LocationPickerPcodes): LocationSelection {
  const get = <T extends AdminUnit>(p?: Pcode) =>
    p ? (getUnit(p) as T | undefined) : undefined;
  const region = get<Region>(pcodes.region);
  const division = get<Division>(pcodes.division);
  const arrondissement = get<Arrondissement>(pcodes.arrondissement);
  const unit = arrondissement ?? division ?? region;
  return { region, division, arrondissement, unit, pcode: unit?.pcode };
}

/**
 * Cascading region → division → arrondissement picker. Each level is a
 * searchable combobox (accent- and typo-tolerant, French and English names
 * and aliases); choosing a parent resets its children. Values are OCHA
 * P-codes.
 */
export function LocationPicker({
  value,
  defaultValue,
  onValueChange,
  lang = "en",
  depth = "arrondissement",
  disabled = false,
  labels,
  placeholders,
  searchPlaceholder,
  emptyMessage,
  name,
  id,
  className,
}: LocationPickerProps) {
  const autoId = React.useId();
  const baseId = id ?? autoId;
  const controlled = value !== undefined;
  const [internal, setInternal] = React.useState(() =>
    toPcodes(defaultValue, depth),
  );
  const current = toPcodes(controlled ? value : internal, depth);
  const triggers = React.useRef<Partial<Record<AdminLevel, HTMLElement>>>({});
  const text = TEXT[lang];
  const levels = LEVELS.slice(0, LEVELS.indexOf(depth) + 1);

  const select = (level: AdminLevel, pcode: Pcode | undefined) => {
    const next: Record<string, Pcode> = {};
    for (const l of LEVELS) {
      if (l === level) {
        if (pcode) next[l] = pcode;
        break;
      }
      const p = current[l];
      if (p) next[l] = p;
    }
    if (!controlled) setInternal(next);
    onValueChange?.(toSelection(next));
  };

  const deepest = current.arrondissement ?? current.division ?? current.region;

  return (
    <div
      data-slot="location-picker"
      className={cn("grid w-full gap-4", className)}
    >
      {levels.map((level, i) => {
        const parentLevel = i > 0 ? levels[i - 1] : undefined;
        const parent = parentLevel ? current[parentLevel] : "CM";
        const next = levels[i + 1];
        return (
          <LevelCombobox
            key={level}
            id={`${baseId}-${level}`}
            level={level}
            lang={lang}
            parent={parent}
            selected={current[level]}
            disabled={disabled || !parent}
            label={labels?.[level] ?? text.labels[level]}
            placeholder={placeholders?.[level] ?? text.placeholders[level]}
            searchPlaceholder={searchPlaceholder ?? text.search}
            emptyMessage={emptyMessage ?? text.empty}
            triggerRef={(el) => {
              if (el) triggers.current[level] = el;
              else delete triggers.current[level];
            }}
            onSelect={(pcode) => select(level, pcode)}
            focusAfterSelect={() => (next ? triggers.current[next] : undefined)}
          />
        );
      })}
      {name ? <input type="hidden" name={name} value={deepest ?? ""} /> : null}
    </div>
  );
}

interface LevelComboboxProps {
  readonly id: string;
  readonly level: AdminLevel;
  readonly lang: Language;
  /** Parent P-code (`"CM"` for regions), or undefined when not chosen yet. */
  readonly parent: Pcode | undefined;
  readonly selected: Pcode | undefined;
  readonly disabled: boolean;
  readonly label: string;
  readonly placeholder: string;
  readonly searchPlaceholder: string;
  readonly emptyMessage: string;
  readonly triggerRef: (el: HTMLElement | null) => void;
  readonly onSelect: (pcode: Pcode | undefined) => void;
  /** Element to focus once a choice closes the popover. */
  readonly focusAfterSelect: () => HTMLElement | undefined;
}

interface Option {
  readonly unit: AdminUnit;
  /** Matched alias or other-language name, when it isn't the shown name. */
  readonly hint?: string;
}

function LevelCombobox({
  id,
  level,
  lang,
  parent,
  selected,
  disabled,
  label,
  placeholder,
  searchPlaceholder,
  emptyMessage,
  triggerRef,
  onSelect,
  focusAfterSelect,
}: LevelComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const chose = React.useRef(false);
  const listId = `${id}-list`;
  const unit = selected ? getUnit(selected) : undefined;

  const options = React.useMemo((): readonly Option[] => {
    if (!parent) return [];
    if (query.trim()) {
      return search(query, {
        levels: [level],
        within: parent === "CM" ? undefined : parent,
        limit: 50,
      }).map(({ item, matched }) => ({
        unit: item,
        hint:
          normalizeName(matched) === normalizeName(item.name[lang])
            ? undefined
            : matched,
      }));
    }
    const collator = new Intl.Collator(lang, { numeric: true });
    return [...getChildren(parent)]
      .sort((a, b) =>
        collator.compare(
          normalizeName(a.name[lang]),
          normalizeName(b.name[lang]),
        ),
      )
      .map((u) => ({ unit: u }));
  }, [parent, query, level, lang]);

  // Highlighted option, kept in step with the results so that Enter picks
  // the best match for what was just typed, or the current value on open.
  const [highlighted, setHighlighted] = React.useState("");
  const has = (pcode: Pcode | undefined) =>
    pcode !== undefined && options.some((o) => o.unit.pcode === pcode);
  const active = has(highlighted)
    ? highlighted
    : !query.trim() && has(selected)
      ? (selected as Pcode)
      : (options[0]?.unit.pcode ?? "");

  return (
    <div data-slot="location-picker-field" className="grid min-w-0 gap-2">
      <label
        htmlFor={id}
        className={cn(
          "text-sm leading-none font-medium select-none",
          disabled && "opacity-50",
        )}
      >
        {label}
      </label>
      <Popover
        open={open}
        onOpenChange={(next) => {
          // Reset on open, so the list stays put while it animates out.
          if (next) {
            chose.current = false;
            setQuery("");
            setHighlighted("");
          }
          setOpen(next);
        }}
      >
        <PopoverTrigger
          ref={triggerRef}
          id={id}
          type="button"
          role="combobox"
          aria-expanded={open}
          aria-controls={open ? listId : undefined}
          disabled={disabled}
          className={cn(
            buttonVariants({ variant: "outline" }),
            "w-full justify-between px-3 font-normal",
          )}
          onFocus={() => {
            // The popover hands focus back to this trigger once it closes
            // (Radix and Base UI alike); after a choice, pass it on.
            if (!chose.current) return;
            chose.current = false;
            focusAfterSelect()?.focus();
          }}
        >
          <span className={cn("truncate", !unit && "text-muted-foreground")}>
            {unit ? unit.name[lang] : placeholder}
          </span>
          <ChevronsUpDownIcon className="text-muted-foreground size-4 shrink-0" />
        </PopoverTrigger>
        <PopoverContent
          align="start"
          // Trigger width: Radix sets the first variable, Base UI the second.
          className="w-[var(--radix-popover-trigger-width,var(--anchor-width))] min-w-56 p-0"
        >
          <Command
            shouldFilter={false}
            label={label}
            value={active}
            onValueChange={setHighlighted}
          >
            <CommandInput
              value={query}
              onValueChange={(next) => {
                setQuery(next);
                setHighlighted("");
              }}
              placeholder={searchPlaceholder}
              aria-label={`${label}: ${searchPlaceholder}`}
            />
            <CommandList id={listId}>
              <CommandEmpty>{emptyMessage}</CommandEmpty>
              {options.map(({ unit: option, hint }) => (
                <CommandItem
                  key={option.pcode}
                  value={option.pcode}
                  onSelect={() => {
                    // Ignore keys that reach the list while it animates out.
                    if (!open) return;
                    const deselect = option.pcode === selected;
                    chose.current = !deselect;
                    onSelect(deselect ? undefined : option.pcode);
                    setOpen(false);
                  }}
                >
                  <CheckIcon
                    className={cn(
                      "size-4",
                      option.pcode === selected ? "opacity-100" : "opacity-0",
                    )}
                  />
                  <span className="truncate">{option.name[lang]}</span>
                  {hint ? (
                    <span className="text-muted-foreground ml-auto truncate pl-2 text-xs">
                      {hint}
                    </span>
                  ) : null}
                </CommandItem>
              ))}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
