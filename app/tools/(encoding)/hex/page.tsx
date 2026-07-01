"use client"

import { Check, Copy } from "lucide-react"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { useLanguage } from "@/contexts/language-context"
import { useToolState } from "@/hooks/use-tool-state"

function encodeHex(str: string): string {
  return Array.from(new TextEncoder().encode(str))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
}

function decodeHex(hex: string): string {
  const clean = hex.replace(/\s/g, "")
  if (clean.length % 2 !== 0)
    throw new Error("Invalid hex: odd number of characters.")
  const bytes = clean.match(/.{2}/g)!.map((b) => {
    const n = parseInt(b, 16)
    if (isNaN(n)) throw new Error(`Invalid hex byte: ${b}`)
    return n
  })
  return new TextDecoder().decode(new Uint8Array(bytes))
}

export default function HexPage() {
  const { t } = useLanguage()
  const [input, setInput] = useToolState("hex", "input", "")
  const [output, setOutput] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const encode = () => {
    try {
      setOutput(encodeHex(input))
      setError(null)
    } catch {
      setError(t.hexEncodeError)
    }
  }

  const decode = () => {
    try {
      setOutput(decodeHex(input))
      setError(null)
    } catch (e) {
      setError((e as Error).message || t.hexDecodeError)
    }
  }

  const clear = () => {
    setInput("")
    setOutput("")
    setError(null)
  }

  const swap = () => {
    setInput(output)
    setOutput("")
    setError(null)
  }

  const copy = async () => {
    await navigator.clipboard.writeText(output)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="flex h-full flex-col gap-4 px-4 lg:px-6">
      <div className="flex shrink-0 justify-end gap-4">
        <Button size="lg" onClick={encode} disabled={!input}>
          {t.encode}
        </Button>
        <Button
          size="lg"
          variant="secondary"
          onClick={decode}
          disabled={!input}
        >
          {t.decode}
        </Button>
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="flex min-h-0 flex-col gap-2">
          <div className="flex shrink-0 items-center justify-between">
            <span className="text-sm font-medium">Input</span>
            <Button
              size="sm"
              variant="ghost"
              onClick={clear}
              className="text-xs"
            >
              {t.clear}
            </Button>
          </div>
          <textarea
            className="min-h-0 w-full flex-1 resize-none rounded-md border bg-background p-3 font-mono text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
            placeholder={t.hexInputPlaceholder}
            value={input}
            onChange={(e) => {
              setInput(e.target.value)
              setOutput("")
              setError(null)
            }}
            spellCheck={false}
          />
        </div>

        <div className="flex min-h-0 flex-col gap-2">
          <div className="flex shrink-0 items-center justify-between">
            <span className="text-sm font-medium">Output</span>
            <div className="flex items-center gap-1">
              {output && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={swap}
                  className="text-xs"
                >
                  {t.swap}
                </Button>
              )}
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
                {copied ? t.copied : t.copy}
              </Button>
            </div>
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
              placeholder={t.outputPlaceholder}
              spellCheck={false}
            />
          )}
        </div>
      </div>
    </div>
  )
}
