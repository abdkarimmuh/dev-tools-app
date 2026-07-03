"use client"

import * as yaml from "js-yaml"
import { ArrowLeftRight, Check, Copy } from "lucide-react"
import { useEffect, useRef, useState } from "react"

import { Button } from "@/components/ui/button"
import { useToolState } from "@/hooks/use-tool-state"
import { handleTextareaTab } from "@/lib/utils"

type Direction = "json-to-yaml" | "yaml-to-json"

export default function JsonYamlPage() {
  const [input, setInput] = useToolState("json-yaml", "input", "")
  const [direction, setDirection] = useToolState<Direction>(
    "json-yaml",
    "direction",
    "json-to-yaml"
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
      if (dir === "json-to-yaml") {
        const parsed = JSON.parse(src)
        setOutput(yaml.dump(parsed, { indent: 2, lineWidth: -1 }))
      } else {
        const parsed = yaml.load(src)
        setOutput(JSON.stringify(parsed, null, 2))
      }
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
      direction === "json-to-yaml" ? "yaml-to-json" : "json-to-yaml"
    setInput(output)
    setDirection(next)
  }

  const copy = async () => {
    await navigator.clipboard.writeText(output)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const inputLabel = direction === "json-to-yaml" ? "JSON" : "YAML"
  const outputLabel = direction === "json-to-yaml" ? "YAML" : "JSON"

  return (
    <div className="flex h-full flex-col gap-4 px-4 lg:px-6">
      <div className="flex shrink-0 justify-end gap-2">
        <Button size="lg" variant="outline" onClick={swap} className="gap-2">
          <ArrowLeftRight className="size-4" />
          {direction === "json-to-yaml" ? "JSON → YAML" : "YAML → JSON"}
        </Button>
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="flex min-h-0 flex-col gap-2">
          <div className="flex shrink-0 items-center justify-between">
            <span className="text-sm font-medium">{inputLabel}</span>
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
              direction === "json-to-yaml"
                ? '{"name": "John", "age": 30}'
                : "name: John\nage: 30"
            }
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => handleTextareaTab(e, input, setInput)}
            spellCheck={false}
          />
        </div>

        <div className="flex min-h-0 flex-col gap-2">
          <div className="flex shrink-0 items-center justify-between">
            <span className="text-sm font-medium">{outputLabel}</span>
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
