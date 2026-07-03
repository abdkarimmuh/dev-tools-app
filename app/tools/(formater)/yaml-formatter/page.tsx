"use client"

import * as yaml from "js-yaml"
import { Check, Copy } from "lucide-react"
import { useEffect, useRef, useState } from "react"

import { Button } from "@/components/ui/button"
import { useToolState } from "@/hooks/use-tool-state"
import { handleTextareaTab } from "@/lib/utils"

export default function YamlFormatterPage() {
  const [input, setInput] = useToolState("yaml-formatter", "input", "")
  const [output, setOutput] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      if (!input) {
        setOutput("")
        setError(null)
        return
      }
      try {
        const parsed = yaml.load(input)
        setOutput(yaml.dump(parsed, { indent: 2, lineWidth: -1 }))
        setError(null)
      } catch (e) {
        setError((e as Error).message)
        setOutput("")
      }
    }, 500)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [input])

  const copy = async () => {
    await navigator.clipboard.writeText(output)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="flex h-full flex-col gap-4 px-4 lg:px-6">
      <div className="flex shrink-0 justify-end gap-4">
        <Button
          size="lg"
          onClick={() => {
            try {
              const parsed = yaml.load(input)
              setOutput(yaml.dump(parsed, { indent: 2, lineWidth: -1 }))
              setError(null)
            } catch (e) {
              setError((e as Error).message)
              setOutput("")
            }
          }}
          disabled={!input}
        >
          Format
        </Button>
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="flex min-h-0 flex-col gap-2">
          <div className="flex shrink-0 items-center justify-between">
            <span className="text-sm font-medium">Input</span>
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
              "name: John\nage: 30\nhobbies:\n  - reading\n  - coding"
            }
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => handleTextareaTab(e, input, setInput)}
            spellCheck={false}
          />
        </div>

        <div className="flex min-h-0 flex-col gap-2">
          <div className="flex shrink-0 items-center justify-between">
            <span className="text-sm font-medium">Output</span>
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
