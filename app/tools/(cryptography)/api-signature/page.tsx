"use client"

import { Check, Copy, Eye, EyeOff } from "lucide-react"
import { useCallback, useEffect, useRef, useState } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { useLanguage } from "@/contexts/language-context"
import { useToolState } from "@/hooks/use-tool-state"

type Algorithm = "SHA-1" | "SHA-256" | "SHA-384" | "SHA-512"
type KeyEncoding = "utf8" | "hex" | "base64"
type OutputFormat = "hex" | "base64"

const ALGORITHMS: { value: Algorithm; label: string }[] = [
  { value: "SHA-256", label: "HMAC-SHA256" },
  { value: "SHA-512", label: "HMAC-SHA512" },
  { value: "SHA-384", label: "HMAC-SHA384" },
  { value: "SHA-1", label: "HMAC-SHA1" },
]

const KEY_ENCODINGS: { value: KeyEncoding; label: string }[] = [
  { value: "utf8", label: "UTF-8 (plaintext)" },
  { value: "hex", label: "Hex" },
  { value: "base64", label: "Base64" },
]

const OUTPUT_FORMATS: { value: OutputFormat; label: string }[] = [
  { value: "hex", label: "Hex" },
  { value: "base64", label: "Base64" },
]

function hexToBytes(hex: string): Uint8Array {
  const clean = hex.replace(/\s+/g, "")
  if (clean.length % 2 !== 0) throw new Error("Invalid hex string")
  const bytes = new Uint8Array(clean.length / 2)
  for (let i = 0; i < clean.length; i += 2) {
    bytes[i / 2] = parseInt(clean.substring(i, i + 2), 16)
  }
  return bytes
}

function base64ToBytes(b64: string): Uint8Array {
  return Uint8Array.from(atob(b64), (c) => c.charCodeAt(0))
}

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
}

function bytesToBase64(bytes: Uint8Array): string {
  return btoa(String.fromCharCode(...bytes))
}

async function generateHmac(
  secretKey: string,
  message: string,
  algorithm: Algorithm,
  keyEncoding: KeyEncoding,
  outputFormat: OutputFormat
): Promise<string> {
  let keyBytes: Uint8Array
  if (keyEncoding === "hex") {
    keyBytes = hexToBytes(secretKey)
  } else if (keyEncoding === "base64") {
    keyBytes = base64ToBytes(secretKey)
  } else {
    keyBytes = new TextEncoder().encode(secretKey)
  }

  const keyBuffer = keyBytes.buffer.slice(
    keyBytes.byteOffset,
    keyBytes.byteOffset + keyBytes.byteLength
  ) as ArrayBuffer

  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    keyBuffer,
    { name: "HMAC", hash: algorithm },
    false,
    ["sign"]
  )

  const msgBytes = new TextEncoder().encode(message)
  const sig = await crypto.subtle.sign("HMAC", cryptoKey, msgBytes)
  const bytes = new Uint8Array(sig)

  return outputFormat === "hex" ? bytesToHex(bytes) : bytesToBase64(bytes)
}

export default function ApiSignaturePage() {
  const { t } = useLanguage()
  const [algorithm, setAlgorithm] = useToolState<Algorithm>(
    "api-signature",
    "algorithm",
    "SHA-256"
  )
  const [keyEncoding, setKeyEncoding] = useToolState<KeyEncoding>(
    "api-signature",
    "keyEncoding",
    "utf8"
  )
  const [outputFormat, setOutputFormat] = useToolState<OutputFormat>(
    "api-signature",
    "outputFormat",
    "hex"
  )
  const [secretKey, setSecretKey] = useToolState(
    "api-signature",
    "secretKey",
    ""
  )
  const [message, setMessage] = useToolState("api-signature", "message", "")
  const [signature, setSignature] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [showKey, setShowKey] = useState(false)
  const [copied, setCopied] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const sign = useCallback(async () => {
    if (!secretKey || !message) {
      setSignature("")
      setError(null)
      return
    }
    try {
      const result = await generateHmac(
        secretKey,
        message,
        algorithm,
        keyEncoding,
        outputFormat
      )
      setSignature(result)
      setError(null)
    } catch (e) {
      setError((e as Error).message)
      setSignature("")
    }
  }, [secretKey, message, algorithm, keyEncoding, outputFormat])

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(sign, 300)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [sign])

  const copy = async () => {
    await navigator.clipboard.writeText(signature)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const clear = () => {
    setSecretKey("")
    setMessage("")
    setSignature("")
    setError(null)
  }

  return (
    <div className="space-y-5 px-4 lg:px-6">
      {/* Controls */}
      <div className="flex flex-wrap items-end gap-4">
        <div className="flex flex-col gap-1.5">
          <Label>Algorithm</Label>
          <Select
            value={algorithm}
            onValueChange={(v) => setAlgorithm(v as Algorithm)}
          >
            <SelectTrigger className="w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ALGORITHMS.map((a) => (
                <SelectItem key={a.value} value={a.value}>
                  {a.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label>Key Encoding</Label>
          <Select
            value={keyEncoding}
            onValueChange={(v) => setKeyEncoding(v as KeyEncoding)}
          >
            <SelectTrigger className="w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {KEY_ENCODINGS.map((k) => (
                <SelectItem key={k.value} value={k.value}>
                  {k.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label>Output Format</Label>
          <Select
            value={outputFormat}
            onValueChange={(v) => setOutputFormat(v as OutputFormat)}
          >
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {OUTPUT_FORMATS.map((f) => (
                <SelectItem key={f.value} value={f.value}>
                  {f.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button
          size="sm"
          variant="ghost"
          onClick={clear}
          className="mb-0.5 text-xs"
        >
          {t.clear}
        </Button>
      </div>

      <Separator />

      {/* Secret Key */}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="secret-key">Secret Key</Label>
        <div className="relative">
          <Input
            id="secret-key"
            type={showKey ? "text" : "password"}
            value={secretKey}
            onChange={(e) => setSecretKey(e.target.value)}
            placeholder="your-secret-key"
            className="pr-10 font-mono"
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
          />
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-1/2 right-1 size-7 -translate-y-1/2 text-muted-foreground"
            onClick={() => setShowKey(!showKey)}
            type="button"
          >
            {showKey ? (
              <EyeOff className="size-3.5" />
            ) : (
              <Eye className="size-3.5" />
            )}
          </Button>
        </div>
      </div>

      {/* Message + Signature */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Message */}
        <div className="flex flex-col gap-1.5">
          <Label>Message / Payload</Label>
          <textarea
            className="h-[300px] w-full resize-none rounded-md border bg-background p-3 font-mono text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
            placeholder={'{\n  "user_id": 123,\n  "timestamp": 1700000000\n}'}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            spellCheck={false}
          />
        </div>

        {/* Signature */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <Label>Signature</Label>
            <Button
              size="sm"
              variant="ghost"
              onClick={copy}
              disabled={!signature}
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
          {error ? (
            <div className="flex h-[300px] items-start overflow-auto rounded-md border border-destructive bg-destructive/10 p-3 font-mono text-sm text-destructive">
              {error}
            </div>
          ) : (
            <textarea
              readOnly
              className="h-[300px] w-full resize-none rounded-md border bg-muted p-3 font-mono text-sm break-all outline-none"
              value={signature}
              placeholder="Signature akan muncul otomatis setelah key dan message diisi..."
              spellCheck={false}
            />
          )}
        </div>
      </div>

      {/* Usage hint */}
      {signature && (
        <div className="rounded-md border bg-muted/40 p-3 text-xs text-muted-foreground">
          <span className="font-medium text-foreground">Header:</span>{" "}
          <code className="font-mono">
            X-Signature: {algorithm.replace("-", "").toLowerCase()}=
            {signature.substring(0, 20)}…
          </code>
          <span className="ml-4 font-medium text-foreground">
            GitHub style:
          </span>{" "}
          <code className="font-mono">
            sha256={signature.substring(0, 20)}…
          </code>
        </div>
      )}
    </div>
  )
}
