"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";

import { Input } from "@/components/ui/input";
import {
  type HtmlEntity,
  SECTIONS
} from "@/constants/frontend/html-entities-cheatsheet";
import { useLanguage } from "@/contexts/language-context";
import { useToolState } from "@/hooks/use-tool-state";

function EntityRow({ entry }: { entry: HtmlEntity }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await navigator.clipboard.writeText(entry.entity);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <button
      onClick={copy}
      className="group flex w-full items-center gap-3 rounded px-2 py-1.5 text-left hover:bg-muted/50"
    >
      <span className="flex w-8 shrink-0 items-center justify-center rounded border bg-background font-mono text-sm font-medium text-primary">
        {entry.char}
      </span>
      <span className="w-24 shrink-0 font-mono text-sm">{entry.entity}</span>
      <span className="w-20 shrink-0 font-mono text-xs text-muted-foreground">
        {entry.numeric}
      </span>
      <span className="flex-1 truncate font-mono text-xs text-muted-foreground">
        {entry.description}
      </span>
      {copied ? (
        <Check className="size-3 shrink-0 text-green-500" />
      ) : (
        <Copy className="size-3 shrink-0 text-muted-foreground opacity-0 group-hover:opacity-100" />
      )}
    </button>
  );
}

export default function HtmlEntitiesCheatsheetPage() {
  const { t } = useLanguage();
  const [search, setSearch] = useToolState(
    "html-entities-cheatsheet",
    "search",
    ""
  );

  const query = search.toLowerCase().trim();
  const filtered = SECTIONS.map((section) => ({
    ...section,
    entries: section.entries.filter(
      (e) =>
        !query ||
        e.entity.toLowerCase().includes(query) ||
        e.numeric.toLowerCase().includes(query) ||
        e.char === search ||
        e.description.toLowerCase().includes(query)
    )
  })).filter((s) => s.entries.length > 0);

  const totalEntries = SECTIONS.reduce((sum, s) => sum + s.entries.length, 0);

  return (
    <div className="flex h-full flex-col gap-4 px-4 lg:px-6">
      <div className="flex shrink-0 items-center gap-3">
        <Input
          className="flex-1"
          placeholder={t.htmlEntitiesCheatsheetSearchPlaceholder}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <span className="shrink-0 text-xs text-muted-foreground">
          {query
            ? `${filtered.reduce((n, s) => n + s.entries.length, 0)} / ${totalEntries}`
            : `${totalEntries} ${t.cheatsheetEntries}`}
        </span>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="flex flex-col gap-6 pb-4">
          {filtered.map((section) => (
            <div key={section.title}>
              <h3 className="mb-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                {section.title}
              </h3>
              <div className="divide-y rounded-md border">
                {section.entries.map((entry) => (
                  <EntityRow key={entry.entity} entry={entry} />
                ))}
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
              {t.cheatsheetNoResults} &quot;{search}&quot;
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
