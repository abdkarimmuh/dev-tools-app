"use client"

import CryptoJS from "crypto-js"
import { Check, Copy, Eye, EyeOff } from "lucide-react"
import { useState } from "react"

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
import { useLanguage } from "@/contexts/language-context"
import { useToolState } from "@/hooks/use-tool-state"

type DesAlgorithm = "DES" | "TripleDES"

const ALGORITHMS: { value: DesAlgorithm; label: string }[] = [
  { value: "DES", label: "DES" },
  { value: "TripleDES", label: "Triple DES (3DES)" },
]

export default function DesCipherPage() {
  const { t } = useLanguage()
  const [algorithm, setAlgorithm] = useToolState<DesAlgorithm>(
    "des-cipher",
    "algorithm",
    "DES"
  )
  const [input, setInput] = useToolState("des-cipher", "input", "")
  const [secretKey, setSecretKey] = useToolState("des-cipher", "key", "")
  const [output, setOutput] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [showKey, setShowKey] = useState(false)

  const cipher = algorithm === "DES" ? CryptoJS.DES : CryptoJS.TripleDES

  const encrypt = () => {
    if (!input || !secretKey) return
    try {
      setOutput(cipher.encrypt(input, secretKey).toString())
      setError(null)
    } catch (e) {
      setError((e as Error).message)
      setOutput("")
    }
  }

  const decrypt = () => {
    if (!input || !secretKey) return
    try {
      const bytes = cipher.decrypt(input, secretKey)
      const result = bytes.toString(CryptoJS.enc.Utf8)
      if (!result) throw new Error(t.cryptoDecryptError)
      setOutput(result)
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

  const copy = async () => {
    await navigator.clipboard.writeText(output)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="flex h-full flex-col gap-4 px-4 lg:px-6">
      <div className="flex shrink-0 items-end justify-between gap-4">
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex flex-col gap-1.5">
            <Label className="mb-1">Algorithm</Label>
            <Select
              value={algorithm}
              onValueChange={(v) => {
                setAlgorithm(v as DesAlgorithm)
                setOutput("")
                setError(null)
              }}
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
          <div className="flex min-w-48 flex-1 flex-col gap-1.5">
            <Label className="mb-1" htmlFor="des-key">
              {t.cryptoKey}
            </Label>
            <div className="relative">
              <Input
                id="des-key"
                type={showKey ? "text" : "password"}
                placeholder={t.cryptoKeyPlaceholder}
                value={secretKey}
                onChange={(e) => setSecretKey(e.target.value)}
                className="pr-10 font-mono"
              />
              <button
                type="button"
                onClick={() => setShowKey((v) => !v)}
                className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showKey ? (
                  <EyeOff className="size-4" />
                ) : (
                  <Eye className="size-4" />
                )}
              </button>
            </div>
          </div>
        </div>
        <div className="flex shrink-0 gap-3">
          <Button size="lg" onClick={encrypt} disabled={!input || !secretKey}>
            {t.cryptoEncrypt}
          </Button>
          <Button
            size="lg"
            variant="secondary"
            onClick={decrypt}
            disabled={!input || !secretKey}
          >
            {t.cryptoDecrypt}
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
            placeholder={t.desInputPlaceholder}
            value={input}
            onChange={(e) => setInput(e.target.value)}
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
              {copied ? t.copied : t.copy}
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
              placeholder={t.outputPlaceholder}
              spellCheck={false}
            />
          )}
        </div>
      </div>
    </div>
  )
}
