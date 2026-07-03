"use client"

import { Check, Copy } from "lucide-react"
import { useEffect, useRef, useState } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToolState } from "@/hooks/use-tool-state"
import { handleTextareaTab } from "@/lib/utils"

function queryPath(obj: unknown, path: string): unknown[] {
  if (!path || path === "$") return [obj]

  const tokens = tokenize(path.replace(/^[$]\.?/, ""))
  return evaluate([obj], tokens)
}

function tokenize(path: string): string[] {
  const tokens: string[] = []
  let i = 0
  while (i < path.length) {
    if (path[i] === ".") {
      if (path[i + 1] === ".") {
        tokens.push("..")
        i += 2
      } else {
        i++
      }
      continue
    }
    if (path[i] === "[") {
      const end = path.indexOf("]", i)
      tokens.push(path.slice(i + 1, end))
      i = end + 1
      continue
    }
    const end = path.slice(i).search(/[.\[]/)
    if (end === -1) {
      tokens.push(path.slice(i))
      break
    }
    tokens.push(path.slice(i, i + end))
    i += end
  }
  return tokens.filter(Boolean)
}

function evaluate(current: unknown[], tokens: string[]): unknown[] {
  if (tokens.length === 0) return current
  const [head, ...rest] = tokens

  if (head === "..") {
    const all = flatDeep(current)
    return evaluate(all, rest)
  }
  if (head === "*") {
    const next: unknown[] = []
    for (const item of current) {
      if (Array.isArray(item)) next.push(...item)
      else if (item && typeof item === "object")
        next.push(...Object.values(item))
    }
    return evaluate(next, rest)
  }
  const idx = Number(head)
  if (!isNaN(idx)) {
    const next = current
      .flatMap((item) => (Array.isArray(item) ? [item[idx]] : []))
      .filter((v) => v !== undefined)
    return evaluate(next, rest)
  }
  if (head.includes(":")) {
    const [startStr, endStr] = head.split(":")
    return current.flatMap((item) => {
      if (!Array.isArray(item)) return []
      const start = startStr ? Number(startStr) : 0
      const end = endStr ? Number(endStr) : item.length
      return item.slice(start, end)
    })
  }
  const next = current.flatMap((item) => {
    if (item && typeof item === "object" && !Array.isArray(item)) {
      const val = (item as Record<string, unknown>)[head]
      return val !== undefined ? [val] : []
    }
    return []
  })
  return evaluate(next, rest)
}

function flatDeep(items: unknown[]): unknown[] {
  const result: unknown[] = []
  const traverse = (val: unknown) => {
    result.push(val)
    if (Array.isArray(val)) val.forEach(traverse)
    else if (val && typeof val === "object")
      Object.values(val).forEach(traverse)
  }
  items.forEach(traverse)
  return result
}

const EXAMPLE_JSON = `{
  "store": {
    "books": [
      { "title": "The Hobbit", "author": "Tolkien", "price": 8.99 },
      { "title": "1984", "author": "Orwell", "price": 7.99 },
      { "title": "Dune", "author": "Herbert", "price": 9.99 }
    ],
    "name": "Book Haven"
  }
}`

const EXAMPLES = [
  { label: "All books", path: "$.store.books[*]" },
  { label: "First book", path: "$.store.books[0]" },
  { label: "All titles", path: "$.store.books[*].title" },
  { label: "Store name", path: "$.store.name" },
  { label: "All prices", path: "$..price" },
]

export default function JsonPathPage() {
  const [json, setJson] = useToolState("json-path", "json", EXAMPLE_JSON)
  const [path, setPath] = useToolState(
    "json-path",
    "path",
    "$.store.books[*].title"
  )
  const [results, setResults] = useState<unknown[]>([])
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      if (!json || !path) {
        setResults([])
        setError(null)
        return
      }
      try {
        const parsed = JSON.parse(json)
        const res = queryPath(parsed, path)
        setResults(res)
        setError(null)
      } catch (e) {
        setError((e as Error).message)
        setResults([])
      }
    }, 400)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [json, path])

  const output = JSON.stringify(results, null, 2)

  const copy = async () => {
    await navigator.clipboard.writeText(output)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="flex h-full flex-col gap-4 px-4 lg:px-6">
      <div className="flex shrink-0 flex-col gap-2">
        <Label className="mb-1">JSONPath Expression</Label>
        <Input
          className="font-mono"
          placeholder="$.store.books[*].title"
          value={path}
          onChange={(e) => setPath(e.target.value)}
          spellCheck={false}
        />
        <div className="flex flex-wrap gap-1.5">
          {EXAMPLES.map((ex) => (
            <button
              key={ex.path}
              onClick={() => setPath(ex.path)}
              className="rounded border px-2 py-0.5 font-mono text-xs hover:bg-muted"
            >
              {ex.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="flex min-h-0 flex-col gap-2">
          <div className="flex shrink-0 items-center justify-between">
            <span className="text-sm font-medium">JSON Document</span>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setJson("")
                setResults([])
                setError(null)
              }}
              className="text-xs"
            >
              Clear
            </Button>
          </div>
          <textarea
            className="min-h-0 w-full flex-1 resize-none rounded-md border bg-background p-3 font-mono text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
            value={json}
            onChange={(e) => setJson(e.target.value)}
            onKeyDown={(e) => handleTextareaTab(e, json, setJson)}
            spellCheck={false}
          />
        </div>

        <div className="flex min-h-0 flex-col gap-2">
          <div className="flex shrink-0 items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Results</span>
              {!error && results.length > 0 && (
                <Badge variant="secondary">
                  {results.length} match{results.length !== 1 ? "es" : ""}
                </Badge>
              )}
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={copy}
              disabled={!output || !!error}
              className="gap-1 text-xs"
            >
              {copied ? (
                <Check className="size-3" />
              ) : (
                <Copy className="size-3" />
              )}
              {copied ? "Copied!" : "Copy"}
            </Button>
          </div>
          {error ? (
            <div className="min-h-0 flex-1 overflow-auto rounded-md border border-destructive bg-destructive/10 p-3 font-mono text-sm text-destructive">
              {error}
            </div>
          ) : (
            <textarea
              readOnly
              className="min-h-0 w-full flex-1 resize-none rounded-md border bg-muted p-3 font-mono text-sm outline-none"
              value={output}
              placeholder="Results will appear here..."
              spellCheck={false}
            />
          )}
        </div>
      </div>
    </div>
  )
}
