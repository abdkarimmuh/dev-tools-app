"use client"

import { Check, Copy } from "lucide-react"
import { useState } from "react"

import { Input } from "@/components/ui/input"
import { useToolState } from "@/hooks/use-tool-state"

interface TailwindEntry {
  class: string
  css: string
}

interface TailwindSection {
  title: string
  entries: TailwindEntry[]
}

const SECTIONS: TailwindSection[] = [
  {
    title: "Flexbox",
    entries: [
      { class: "flex", css: "display: flex" },
      { class: "inline-flex", css: "display: inline-flex" },
      { class: "flex-row", css: "flex-direction: row" },
      { class: "flex-col", css: "flex-direction: column" },
      { class: "flex-wrap", css: "flex-wrap: wrap" },
      { class: "flex-nowrap", css: "flex-wrap: nowrap" },
      { class: "flex-1", css: "flex: 1 1 0%" },
      { class: "flex-auto", css: "flex: 1 1 auto" },
      { class: "flex-none", css: "flex: none" },
      { class: "items-start", css: "align-items: flex-start" },
      { class: "items-center", css: "align-items: center" },
      { class: "items-end", css: "align-items: flex-end" },
      { class: "items-stretch", css: "align-items: stretch" },
      { class: "justify-start", css: "justify-content: flex-start" },
      { class: "justify-center", css: "justify-content: center" },
      { class: "justify-end", css: "justify-content: flex-end" },
      { class: "justify-between", css: "justify-content: space-between" },
      { class: "justify-around", css: "justify-content: space-around" },
      { class: "gap-0", css: "gap: 0px" },
      { class: "gap-1", css: "gap: 0.25rem" },
      { class: "gap-2", css: "gap: 0.5rem" },
      { class: "gap-4", css: "gap: 1rem" },
      { class: "gap-6", css: "gap: 1.5rem" },
      { class: "gap-8", css: "gap: 2rem" },
    ],
  },
  {
    title: "Grid",
    entries: [
      { class: "grid", css: "display: grid" },
      {
        class: "grid-cols-1",
        css: "grid-template-columns: repeat(1, minmax(0, 1fr))",
      },
      {
        class: "grid-cols-2",
        css: "grid-template-columns: repeat(2, minmax(0, 1fr))",
      },
      {
        class: "grid-cols-3",
        css: "grid-template-columns: repeat(3, minmax(0, 1fr))",
      },
      {
        class: "grid-cols-4",
        css: "grid-template-columns: repeat(4, minmax(0, 1fr))",
      },
      { class: "col-span-1", css: "grid-column: span 1 / span 1" },
      { class: "col-span-2", css: "grid-column: span 2 / span 2" },
      { class: "col-span-full", css: "grid-column: 1 / -1" },
    ],
  },
  {
    title: "Spacing",
    entries: [
      { class: "p-0", css: "padding: 0px" },
      { class: "p-1", css: "padding: 0.25rem" },
      { class: "p-2", css: "padding: 0.5rem" },
      { class: "p-4", css: "padding: 1rem" },
      { class: "p-6", css: "padding: 1.5rem" },
      { class: "p-8", css: "padding: 2rem" },
      { class: "px-4", css: "padding-left: 1rem; padding-right: 1rem" },
      { class: "py-4", css: "padding-top: 1rem; padding-bottom: 1rem" },
      { class: "m-0", css: "margin: 0px" },
      { class: "m-auto", css: "margin: auto" },
      { class: "mx-auto", css: "margin-left: auto; margin-right: auto" },
      { class: "m-4", css: "margin: 1rem" },
      { class: "mt-4", css: "margin-top: 1rem" },
      { class: "mb-4", css: "margin-bottom: 1rem" },
    ],
  },
  {
    title: "Sizing",
    entries: [
      { class: "w-full", css: "width: 100%" },
      { class: "w-screen", css: "width: 100vw" },
      { class: "w-auto", css: "width: auto" },
      { class: "w-1/2", css: "width: 50%" },
      { class: "w-1/3", css: "width: 33.333333%" },
      { class: "w-1/4", css: "width: 25%" },
      { class: "max-w-sm", css: "max-width: 24rem" },
      { class: "max-w-md", css: "max-width: 28rem" },
      { class: "max-w-lg", css: "max-width: 32rem" },
      { class: "max-w-xl", css: "max-width: 36rem" },
      { class: "max-w-2xl", css: "max-width: 42rem" },
      { class: "h-full", css: "height: 100%" },
      { class: "h-screen", css: "height: 100vh" },
      { class: "h-auto", css: "height: auto" },
      { class: "min-h-0", css: "min-height: 0px" },
    ],
  },
  {
    title: "Typography",
    entries: [
      { class: "text-xs", css: "font-size: 0.75rem; line-height: 1rem" },
      { class: "text-sm", css: "font-size: 0.875rem; line-height: 1.25rem" },
      { class: "text-base", css: "font-size: 1rem; line-height: 1.5rem" },
      { class: "text-lg", css: "font-size: 1.125rem; line-height: 1.75rem" },
      { class: "text-xl", css: "font-size: 1.25rem; line-height: 1.75rem" },
      { class: "text-2xl", css: "font-size: 1.5rem; line-height: 2rem" },
      { class: "font-normal", css: "font-weight: 400" },
      { class: "font-medium", css: "font-weight: 500" },
      { class: "font-semibold", css: "font-weight: 600" },
      { class: "font-bold", css: "font-weight: 700" },
      { class: "text-left", css: "text-align: left" },
      { class: "text-center", css: "text-align: center" },
      { class: "text-right", css: "text-align: right" },
      {
        class: "truncate",
        css: "overflow: hidden; text-overflow: ellipsis; white-space: nowrap",
      },
      { class: "leading-none", css: "line-height: 1" },
      { class: "leading-tight", css: "line-height: 1.25" },
      { class: "leading-normal", css: "line-height: 1.5" },
    ],
  },
  {
    title: "Borders",
    entries: [
      { class: "border", css: "border-width: 1px" },
      { class: "border-0", css: "border-width: 0px" },
      { class: "border-2", css: "border-width: 2px" },
      { class: "border-t", css: "border-top-width: 1px" },
      { class: "border-b", css: "border-bottom-width: 1px" },
      { class: "rounded", css: "border-radius: 0.25rem" },
      { class: "rounded-sm", css: "border-radius: 0.125rem" },
      { class: "rounded-md", css: "border-radius: 0.375rem" },
      { class: "rounded-lg", css: "border-radius: 0.5rem" },
      { class: "rounded-xl", css: "border-radius: 0.75rem" },
      { class: "rounded-full", css: "border-radius: 9999px" },
      { class: "rounded-none", css: "border-radius: 0px" },
    ],
  },
  {
    title: "Display & Position",
    entries: [
      { class: "block", css: "display: block" },
      { class: "inline", css: "display: inline" },
      { class: "inline-block", css: "display: inline-block" },
      { class: "hidden", css: "display: none" },
      { class: "relative", css: "position: relative" },
      { class: "absolute", css: "position: absolute" },
      { class: "fixed", css: "position: fixed" },
      { class: "sticky", css: "position: sticky" },
      { class: "inset-0", css: "top: 0; right: 0; bottom: 0; left: 0" },
      { class: "z-0", css: "z-index: 0" },
      { class: "z-10", css: "z-index: 10" },
      { class: "z-50", css: "z-index: 50" },
      { class: "overflow-hidden", css: "overflow: hidden" },
      { class: "overflow-auto", css: "overflow: auto" },
    ],
  },
  {
    title: "Transitions & Animations",
    entries: [
      {
        class: "transition",
        css: "transition-property: color, background-color, border-color, ...; duration: 150ms",
      },
      {
        class: "transition-all",
        css: "transition-property: all; duration: 150ms",
      },
      { class: "duration-150", css: "transition-duration: 150ms" },
      { class: "duration-300", css: "transition-duration: 300ms" },
      {
        class: "ease-in",
        css: "transition-timing-function: cubic-bezier(0.4, 0, 1, 1)",
      },
      {
        class: "ease-out",
        css: "transition-timing-function: cubic-bezier(0, 0, 0.2, 1)",
      },
      {
        class: "ease-in-out",
        css: "transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1)",
      },
      { class: "animate-spin", css: "animation: spin 1s linear infinite" },
      {
        class: "animate-ping",
        css: "animation: ping 1s cubic-bezier(0, 0, 0.2, 1) infinite",
      },
      {
        class: "animate-pulse",
        css: "animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      { class: "animate-bounce", css: "animation: bounce 1s infinite" },
    ],
  },
]

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
        !query || e.class.includes(query) || e.css.toLowerCase().includes(query)
    ),
  })).filter((s) => s.entries.length > 0)

  return (
    <div className="flex h-full flex-col gap-4 px-4 lg:px-6">
      <div className="shrink-0">
        <Input
          placeholder="Search classes or CSS... (e.g. flex, padding, border-radius)"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="flex flex-col gap-6 pb-4">
          {filtered.map((section) => (
            <div key={section.title}>
              <h3 className="mb-2 text-sm font-semibold tracking-wide text-muted-foreground uppercase">
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
