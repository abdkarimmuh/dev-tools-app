"use client"

import { Check, Copy } from "lucide-react"
import { useState } from "react"

import { Input } from "@/components/ui/input"
import {
  SECTIONS,
  type TailwindEntry,
} from "@/constants/frontend/tailwind-cheatsheet"
import { useToolState } from "@/hooks/use-tool-state"

function ClassRow({ entry }: { entry: TailwindEntry }) {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    await navigator.clipboard.writeText(entry.class)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }
  return (
    <div className="group flex items-center gap-3 rounded px-2 py-1.5 hover:bg-muted/50">
      <button onClick={copy} className="flex shrink-0 items-center gap-1.5">
        <code className="font-mono text-sm font-medium text-primary">
          {entry.class}
        </code>
        {copied ? (
          <Check className="size-3 text-green-500" />
        ) : (
          <Copy className="size-3 text-muted-foreground opacity-0 group-hover:opacity-100" />
        )}
      </button>
      <span className="truncate font-mono text-xs text-muted-foreground">
        {entry.css}
      </span>
    </div>
  )
}

export default function TailwindCheatsheetPage() {
  const [search, setSearch] = useToolState("tailwind-cheatsheet", "search", "")

  const query = search.toLowerCase().trim()
  const filtered = SECTIONS.map((section) => ({
    ...section,
    entries: section.entries.filter(
      (e) =>
        !query ||
        e.class.toLowerCase().includes(query) ||
        e.css.toLowerCase().includes(query) ||
        section.title.toLowerCase().includes(query)
    ),
  })).filter((s) => s.entries.length > 0)

  const totalEntries = SECTIONS.reduce((sum, s) => sum + s.entries.length, 0)

  return (
    <div className="flex h-full flex-col gap-4 px-4 lg:px-6">
      <div className="flex shrink-0 items-center gap-3">
        <Input
          className="flex-1"
          placeholder="Search class or CSS… (e.g. flex, border-radius, overflow)"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <span className="shrink-0 text-xs text-muted-foreground">
          {query
            ? `${filtered.reduce((n, s) => n + s.entries.length, 0)} / ${totalEntries}`
            : `${totalEntries} entries`}
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
                  <ClassRow key={entry.class} entry={entry} />
                ))}
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
              No classes found for &quot;{search}&quot;
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
