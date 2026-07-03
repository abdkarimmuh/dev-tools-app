"use client"

import { ArrowLeftRight, Check, Copy } from "lucide-react"
import { useEffect, useRef, useState } from "react"

import { Button } from "@/components/ui/button"
import { useToolState } from "@/hooks/use-tool-state"
import { handleTextareaTab } from "@/lib/utils"

type Direction = "json-to-csv" | "csv-to-json"

function jsonToCsv(jsonStr: string): string {
  const data = JSON.parse(jsonStr)
  if (!Array.isArray(data)) throw new Error("Input must be a JSON array")
  if (data.length === 0) return ""
  const headers = Array.from(new Set(data.flatMap((row) => Object.keys(row))))
  const escape = (v: unknown) => {
    const str = v === null || v === undefined ? "" : String(v)
    return str.includes(",") || str.includes('"') || str.includes("\n")
      ? `"${str.replace(/"/g, '""')}"`
      : str
  }
  const rows = data.map((row: Record<string, unknown>) =>
    headers.map((h) => escape(row[h])).join(",")
  )
  return [headers.join(","), ...rows].join("\n")
}

function csvToJson(csvStr: string): string {
  const lines = csvStr.trim().split("\n")
  if (lines.length < 2)
    throw new Error("CSV must have a header row and at least one data row")

  function parseLine(line: string): string[] {
    const result: string[] = []
    let current = ""
    let inQuotes = false
    for (let i = 0; i < line.length; i++) {
      const ch = line[i]
      if (ch === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"'
          i++
        } else inQuotes = !inQuotes
      } else if (ch === "," && !inQuotes) {
        result.push(current)
        current = ""
      } else {
        current += ch
      }
    }
    result.push(current)
    return result
  }

  const headers = parseLine(lines[0])
  const rows = lines
    .slice(1)
    .filter(Boolean)
    .map((line) => {
      const values = parseLine(line)
      return Object.fromEntries(headers.map((h, i) => [h, values[i] ?? ""]))
    })
  return JSON.stringify(rows, null, 2)
}

export default function JsonCsvPage() {
  const [input, setInput] = useToolState("json-csv", "input", "")
  const [direction, setDirection] = useToolState<Direction>(
    "json-csv",
    "direction",
    "json-to-csv"
  )
  const [output, setOutput] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const convert = (src: string, dir: Direction) => {
    if (!src) {
      setOutput("")
      setError(null)
      return
    }
    try {
      setOutput(dir === "json-to-csv" ? jsonToCsv(src) : csvToJson(src))
      setError(null)
    } catch (e) {
      setError((e as Error).message)
      setOutput("")
    }
  }

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => convert(input, direction), 500)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [input, direction])

  const swap = () => {
    const next: Direction =
      direction === "json-to-csv" ? "csv-to-json" : "json-to-csv"
    setInput(output)
    setDirection(next)
  }

  const copy = async () => {
    await navigator.clipboard.writeText(output)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="flex h-full flex-col gap-4 px-4 lg:px-6">
      <div className="flex shrink-0 justify-end gap-2">
        <Button size="lg" variant="outline" onClick={swap} className="gap-2">
          <ArrowLeftRight className="size-4" />
          {direction === "json-to-csv" ? "JSON → CSV" : "CSV → JSON"}
        </Button>
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="flex min-h-0 flex-col gap-2">
          <div className="flex shrink-0 items-center justify-between">
            <span className="text-sm font-medium">
              {direction === "json-to-csv" ? "JSON" : "CSV"}
            </span>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setInput("")
                setOutput("")
                setError(null)
              }}
              className="text-xs"
            >
              Clear
            </Button>
          </div>
          <textarea
            className="min-h-0 w-full flex-1 resize-none rounded-md border bg-background p-3 font-mono text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
            placeholder={
              direction === "json-to-csv"
                ? '[{"name":"Alice","age":30},{"name":"Bob","age":25}]'
                : "name,age\nAlice,30\nBob,25"
            }
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => handleTextareaTab(e, input, setInput)}
            spellCheck={false}
          />
        </div>

        <div className="flex min-h-0 flex-col gap-2">
          <div className="flex shrink-0 items-center justify-between">
            <span className="text-sm font-medium">
              {direction === "json-to-csv" ? "CSV" : "JSON"}
            </span>
            <Button
              size="sm"
              variant="ghost"
              onClick={copy}
              disabled={!output}
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
              placeholder="Output will appear here..."
              spellCheck={false}
            />
          )}
        </div>
      </div>
    </div>
  )
}
