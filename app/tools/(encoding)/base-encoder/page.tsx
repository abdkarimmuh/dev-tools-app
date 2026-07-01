"use client"

import { Check, Copy } from "lucide-react"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useLanguage } from "@/contexts/language-context"
import { useToolState } from "@/hooks/use-tool-state"

type Encoding = "base64" | "base32" | "base58" | "base16"

const ENCODINGS: { value: Encoding; label: string }[] = [
  { value: "base64", label: "Base64" },
  { value: "base32", label: "Base32" },
  { value: "base58", label: "Base58" },
  { value: "base16", label: "Hex (Base16)" },
]

// ── Base64 ──────────────────────────────────────────────────────────────────
function encodeBase64(str: string): string {
  return btoa(unescape(encodeURIComponent(str)))
}
function decodeBase64(str: string): string {
  return decodeURIComponent(escape(atob(str)))
}

// ── Base32 ──────────────────────────────────────────────────────────────────
const B32_ALPHA = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567"

function encodeBase32(str: string): string {
  const bytes = new TextEncoder().encode(str)
  let bits = 0,
    value = 0,
    output = ""
  for (const byte of bytes) {
    value = (value << 8) | byte
    bits += 8
    while (bits >= 5) {
      output += B32_ALPHA[(value >>> (bits - 5)) & 31]
      bits -= 5
    }
  }
  if (bits > 0) output += B32_ALPHA[(value << (5 - bits)) & 31]
  while (output.length % 8 !== 0) output += "="
  return output
}

function decodeBase32(str: string): string {
  const clean = str.toUpperCase().replace(/=+$/, "").replace(/\s/g, "")
  let bits = 0,
    value = 0
  const bytes: number[] = []
  for (const char of clean) {
    const idx = B32_ALPHA.indexOf(char)
    if (idx === -1) throw new Error(`Invalid Base32 character: "${char}"`)
    value = (value << 5) | idx
    bits += 5
    if (bits >= 8) {
      bytes.push((value >>> (bits - 8)) & 255)
      bits -= 8
    }
  }
  return new TextDecoder().decode(new Uint8Array(bytes))
}

// ── Base58 ──────────────────────────────────────────────────────────────────
const B58_ALPHA = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz"

function encodeBase58(str: string): string {
  const bytes = Array.from(new TextEncoder().encode(str))
  let leading = 0
  for (const b of bytes) {
    if (b !== 0) break
    leading++
  }
  let num = BigInt(0)
  for (const b of bytes) num = num * 256n + BigInt(b)
  let result = ""
  while (num > 0n) {
    result = B58_ALPHA[Number(num % 58n)] + result
    num = num / 58n
  }
  return "1".repeat(leading) + result
}

function decodeBase58(str: string): string {
  const clean = str.trim()
  let leading = 0
  for (const c of clean) {
    if (c !== "1") break
    leading++
  }
  let num = BigInt(0)
  for (const c of clean) {
    const idx = B58_ALPHA.indexOf(c)
    if (idx === -1) throw new Error(`Invalid Base58 character: "${c}"`)
    num = num * 58n + BigInt(idx)
  }
  const bytes: number[] = []
  while (num > 0n) {
    bytes.unshift(Number(num % 256n))
    num = num / 256n
  }
  return new TextDecoder().decode(
    new Uint8Array([...new Array(leading).fill(0), ...bytes])
  )
}

// ── Base16 / Hex ─────────────────────────────────────────────────────────────
function encodeBase16(str: string): string {
  return Array.from(new TextEncoder().encode(str))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
}

function decodeBase16(str: string): string {
  const clean = str.replace(/\s/g, "")
  if (clean.length % 2 !== 0)
    throw new Error("Invalid hex: odd number of characters.")
  const bytes = clean.match(/.{2}/g)!.map((b) => {
    const n = parseInt(b, 16)
    if (isNaN(n)) throw new Error(`Invalid hex byte: ${b}`)
    return n
  })
  return new TextDecoder().decode(new Uint8Array(bytes))
}

// ── Placeholders ─────────────────────────────────────────────────────────────
const PLACEHOLDERS: Record<Encoding, string> = {
  base64: "Enter text or Base64 string...",
  base32: "Enter text or Base32 string (e.g. JBSWY3DP...)...",
  base58: "Enter text or Base58 string...",
  base16: "Enter text or hex string (e.g. 48656c6c6f)...",
}

export default function BaseEncoderPage() {
  const { t } = useLanguage()
  const [encoding, setEncoding] = useToolState<Encoding>(
    "base-encoder",
    "encoding",
    "base64"
  )
  const [input, setInput] = useToolState("base-encoder", "input", "")
  const [output, setOutput] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const runEncode = () => {
    try {
      if (encoding === "base64") setOutput(encodeBase64(input))
      else if (encoding === "base32") setOutput(encodeBase32(input))
      else if (encoding === "base58") setOutput(encodeBase58(input))
      else setOutput(encodeBase16(input))
      setError(null)
    } catch (e) {
      setError((e as Error).message)
      setOutput("")
    }
  }

  const runDecode = () => {
    try {
      if (encoding === "base64") setOutput(decodeBase64(input))
      else if (encoding === "base32") setOutput(decodeBase32(input))
      else if (encoding === "base58") setOutput(decodeBase58(input))
      else setOutput(decodeBase16(input))
      setError(null)
    } catch (e) {
      setError((e as Error).message)
      setOutput("")
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
      <div className="flex shrink-0 items-end justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <Label className="mb-1">Encoding</Label>
          <Select
            value={encoding}
            onValueChange={(v) => {
              setEncoding(v as Encoding)
              setOutput("")
              setError(null)
            }}
          >
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ENCODINGS.map((e) => (
                <SelectItem key={e.value} value={e.value}>
                  {e.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-3">
          <Button size="lg" onClick={runEncode} disabled={!input}>
            {t.encode}
          </Button>
          <Button
            size="lg"
            variant="secondary"
            onClick={runDecode}
            disabled={!input}
          >
            {t.decode}
          </Button>
        </div>
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
            placeholder={PLACEHOLDERS[encoding]}
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
