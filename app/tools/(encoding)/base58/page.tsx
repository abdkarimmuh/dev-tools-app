"use client"

import { Check, Copy } from "lucide-react"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { useLanguage } from "@/contexts/language-context"
import { useToolState } from "@/hooks/use-tool-state"

const ALPHABET = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz"

function encodeBase58(str: string): string {
  const bytes = Array.from(new TextEncoder().encode(str))
  let leadingZeros = 0
  for (const b of bytes) {
    if (b !== 0) break
    leadingZeros++
  }
  let num = BigInt(0)
  for (const b of bytes) num = num * 256n + BigInt(b)
  let result = ""
  while (num > 0n) {
    result = ALPHABET[Number(num % 58n)] + result
    num = num / 58n
  }
  return "1".repeat(leadingZeros) + result
}

function decodeBase58(str: string): string {
  const clean = str.trim()
  let leadingZeros = 0
  for (const char of clean) {
    if (char !== "1") break
    leadingZeros++
  }
  let num = BigInt(0)
  for (const char of clean) {
    const idx = ALPHABET.indexOf(char)
    if (idx === -1) throw new Error(`Invalid Base58 character: "${char}"`)
    num = num * 58n + BigInt(idx)
  }
  const bytes: number[] = []
  while (num > 0n) {
    bytes.unshift(Number(num % 256n))
    num = num / 256n
  }
  const result = new Uint8Array([...new Array(leadingZeros).fill(0), ...bytes])
  return new TextDecoder().decode(result)
}

export default function Base58Page() {
  const { t } = useLanguage()
  const [input, setInput] = useToolState("base58", "input", "")
  const [output, setOutput] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const encode = () => {
    try {
      setOutput(encodeBase58(input))
      setError(null)
    } catch {
      setError(t.base58EncodeError)
    }
  }

  const decode = () => {
    try {
      setOutput(decodeBase58(input))
      setError(null)
    } catch (e) {
      setError((e as Error).message || t.base58DecodeError)
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
            placeholder={t.base58InputPlaceholder}
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
