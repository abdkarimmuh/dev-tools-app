"use client"

import { Check, Copy } from "lucide-react"
import { useState } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/contexts/language-context"

function base64UrlDecode(str: string): string {
  const base64 = str.replace(/-/g, "+").replace(/_/g, "/")
  const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4)
  return atob(padded)
}

interface JwtParts {
  header: Record<string, unknown>
  payload: Record<string, unknown>
  signature: string
}

function decodeJwt(token: string, invalidMsg: string): JwtParts {
  const parts = token.trim().split(".")
  if (parts.length !== 3) {
    throw new Error(invalidMsg)
  }
  const header = JSON.parse(base64UrlDecode(parts[0]))
  const payload = JSON.parse(base64UrlDecode(parts[1]))
  return { header, payload, signature: parts[2] }
}

function isExpired(payload: Record<string, unknown>): boolean {
  if (typeof payload.exp !== "number") return false
  return Date.now() / 1000 > payload.exp
}

function formatTimestamp(val: unknown): string {
  if (typeof val !== "number") return String(val)
  return `${val} (${new Date(val * 1000).toLocaleString()})`
}

interface CopyButtonProps {
  text: string
  copy: string
  copied: string
}

function CopyButton({ text, copy: copyLabel, copied: copiedLabel }: CopyButtonProps) {
  const [isCopied, setIsCopied] = useState(false)
  const handleCopy = async () => {
    await navigator.clipboard.writeText(text)
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), 1500)
  }
  return (
    <Button size="sm" variant="ghost" onClick={handleCopy} className="h-7 gap-1 text-xs">
      {isCopied ? <Check className="size-3" /> : <Copy className="size-3" />}
      {isCopied ? copiedLabel : copyLabel}
    </Button>
  )
}

function JsonBlock({
  label,
  data,
  badge,
  copyLabel,
  copiedLabel,
}: {
  label: string
  data: unknown
  badge?: React.ReactNode
  copyLabel: string
  copiedLabel: string
}) {
  const json = JSON.stringify(data, null, 2)
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{label}</span>
          {badge}
        </div>
        <CopyButton text={json} copy={copyLabel} copied={copiedLabel} />
      </div>
      <pre className="overflow-auto rounded-md border bg-muted p-3 font-mono text-sm">
        {json}
      </pre>
    </div>
  )
}

export default function JwtDecoderPage() {
  const { t } = useLanguage()
  const [token, setToken] = useState("")
  const [decoded, setDecoded] = useState<JwtParts | null>(null)
  const [error, setError] = useState<string | null>(null)

  const decode = () => {
    try {
      setDecoded(decodeJwt(token, t.jwtInvalidError))
      setError(null)
    } catch (e) {
      setError((e as Error).message)
      setDecoded(null)
    }
  }

  const clear = () => {
    setToken("")
    setDecoded(null)
    setError(null)
  }

  const expired = decoded ? isExpired(decoded.payload) : false

  const displayPayload = decoded
    ? Object.fromEntries(
        Object.entries(decoded.payload).map(([k, v]) =>
          ["exp", "iat", "nbf"].includes(k) ? [k, formatTimestamp(v)] : [k, v]
        )
      )
    : null

  return (
    <div className="flex flex-col gap-4 px-4 lg:px-6">
      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium">JWT Token</span>
        <textarea
          className="h-32 w-full resize-none rounded-md border bg-background p-3 font-mono text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
          placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
          value={token}
          onChange={(e) => {
            setToken(e.target.value)
            setDecoded(null)
            setError(null)
          }}
          spellCheck={false}
        />
        <div className="flex gap-2">
          <Button onClick={decode} disabled={!token}>
            {t.decode}
          </Button>
          <Button variant="ghost" onClick={clear}>
            {t.clear}
          </Button>
          {decoded && (
            <Badge variant={expired ? "destructive" : "secondary"} className="ml-auto">
              {expired ? t.jwtExpired : t.jwtValid}
            </Badge>
          )}
        </div>
      </div>

      {error && (
        <div className="rounded-md border border-destructive bg-destructive/10 p-3 font-mono text-sm text-destructive">
          {error}
        </div>
      )}

      {decoded && (
        <div className="flex flex-col gap-4">
          <JsonBlock label="Header" data={decoded.header} copyLabel={t.copy} copiedLabel={t.copied} />
          <JsonBlock label="Payload" data={displayPayload} copyLabel={t.copy} copiedLabel={t.copied} />
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Signature</span>
              <CopyButton text={decoded.signature} copy={t.copy} copied={t.copied} />
            </div>
            <div className="overflow-auto rounded-md border bg-muted p-3 font-mono text-sm break-all">
              {decoded.signature}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
