"use client"

import { useMemo, useState } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

interface Match {
  index: number
  length: number
  value: string
  groups: string[]
}

function findMatches(pattern: string, flags: string, text: string): Match[] | null {
  try {
    const regex = new RegExp(pattern, flags.includes("g") ? flags : flags + "g")
    const results: Match[] = []
    let m: RegExpExecArray | null
    while ((m = regex.exec(text)) !== null) {
      results.push({
        index: m.index,
        length: m[0].length,
        value: m[0],
        groups: m.slice(1),
      })
      if (m[0].length === 0) regex.lastIndex++
    }
    return results
  } catch {
    return null
  }
}

function HighlightedText({ text, matches }: { text: string; matches: Match[] }) {
  if (!matches.length) return <span>{text}</span>

  const parts: React.ReactNode[] = []
  let cursor = 0

  for (const match of matches) {
    if (match.index > cursor) {
      parts.push(<span key={cursor}>{text.slice(cursor, match.index)}</span>)
    }
    parts.push(
      <mark
        key={`m-${match.index}`}
        className="rounded bg-yellow-300 text-yellow-900 dark:bg-yellow-500 dark:text-yellow-950"
      >
        {text.slice(match.index, match.index + match.length)}
      </mark>
    )
    cursor = match.index + match.length
  }

  if (cursor < text.length) {
    parts.push(<span key={cursor}>{text.slice(cursor)}</span>)
  }

  return <>{parts}</>
}

const FLAG_OPTIONS = [
  { flag: "g", label: "g", title: "Global" },
  { flag: "i", label: "i", title: "Case insensitive" },
  { flag: "m", label: "m", title: "Multiline" },
  { flag: "s", label: "s", title: "Dot all" },
]

export default function RegexTesterPage() {
  const [pattern, setPattern] = useState("")
  const [flags, setFlags] = useState("g")
  const [testStr, setTestStr] = useState("")

  const toggleFlag = (flag: string) => {
    setFlags((prev) =>
      prev.includes(flag) ? prev.replace(flag, "") : prev + flag
    )
  }

  const matches = useMemo(
    () => (pattern && testStr ? findMatches(pattern, flags, testStr) : []),
    [pattern, flags, testStr]
  )

  const isInvalidRegex = useMemo(() => {
    if (!pattern) return false
    try {
      new RegExp(pattern, flags)
      return false
    } catch {
      return true
    }
  }, [pattern, flags])

  return (
    <div className="flex flex-col gap-6 px-4 lg:px-6 max-w-3xl">
      <div className="flex flex-col gap-2">
        <Label>Regex Pattern</Label>
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">/</span>
          <Input
            className={cn("font-mono", isInvalidRegex && "border-destructive focus-visible:ring-destructive")}
            placeholder="^hello\s+world$"
            value={pattern}
            onChange={(e) => setPattern(e.target.value)}
            spellCheck={false}
          />
          <span className="text-muted-foreground">/</span>
          <span className="font-mono text-muted-foreground">{flags || " "}</span>
        </div>
        {isInvalidRegex && (
          <p className="text-xs text-destructive">Regex tidak valid</p>
        )}

        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs text-muted-foreground">Flags:</span>
          {FLAG_OPTIONS.map(({ flag, label, title }) => (
            <Button
              key={flag}
              size="sm"
              variant={flags.includes(flag) ? "default" : "outline"}
              onClick={() => toggleFlag(flag)}
              className="h-7 w-8 p-0 font-mono text-xs"
              title={title}
            >
              {label}
            </Button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label>Test String</Label>
        <textarea
          className="h-40 w-full resize-none rounded-md border bg-background p-3 font-mono text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
          placeholder="Masukkan teks untuk ditest..."
          value={testStr}
          onChange={(e) => setTestStr(e.target.value)}
          spellCheck={false}
        />
      </div>

      {testStr && matches !== null && (
        <>
          <div className="flex items-center gap-2">
            <Badge variant={matches.length > 0 ? "default" : "secondary"}>
              {matches.length} match{matches.length !== 1 ? "es" : ""}
            </Badge>
          </div>

          <div className="flex flex-col gap-2">
            <Label>Preview</Label>
            <div className="min-h-12 rounded-md border bg-muted p-3 font-mono text-sm whitespace-pre-wrap break-all">
              <HighlightedText text={testStr} matches={matches} />
            </div>
          </div>

          {matches.length > 0 && (
            <div className="flex flex-col gap-2">
              <Label>Matches</Label>
              <div className="flex flex-col gap-1.5">
                {matches.map((m, i) => (
                  <div key={i} className="rounded-md border bg-muted px-3 py-2 font-mono text-sm">
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground">#{i + 1}</span>
                      <span className="font-medium">{JSON.stringify(m.value)}</span>
                      <span className="text-xs text-muted-foreground">index: {m.index}</span>
                    </div>
                    {m.groups.some((g) => g !== undefined) && (
                      <div className="mt-1 flex flex-wrap gap-1">
                        {m.groups.map((g, gi) => (
                          <span key={gi} className="rounded bg-background px-1.5 py-0.5 text-xs">
                            group {gi + 1}: {JSON.stringify(g)}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
