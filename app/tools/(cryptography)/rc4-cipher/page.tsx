"use client"

import CryptoJS from "crypto-js"
import { Check, Copy, Eye, EyeOff } from "lucide-react"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useLanguage } from "@/contexts/language-context"
import { useToolState } from "@/hooks/use-tool-state"

export default function Rc4CipherPage() {
  const { t } = useLanguage()
  const [input, setInput] = useToolState("rc4-cipher", "input", "")
  const [secretKey, setSecretKey] = useToolState("rc4-cipher", "key", "")
  const [output, setOutput] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [showKey, setShowKey] = useState(false)

  const encrypt = () => {
    if (!input || !secretKey) return
    try {
      setOutput(CryptoJS.RC4.encrypt(input, secretKey).toString())
      setError(null)
    } catch (e) {
      setError((e as Error).message)
      setOutput("")
    }
  }

  const decrypt = () => {
    if (!input || !secretKey) return
    try {
      const bytes = CryptoJS.RC4.decrypt(input, secretKey)
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
    <div className="flex flex-col gap-4 px-4 lg:px-6">
      <div className="flex max-w-xl flex-col gap-1.5">
        <Label htmlFor="rc4-key">{t.cryptoKey}</Label>
        <div className="relative">
          <Input
            id="rc4-key"
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

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
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
            className="h-[460px] w-full resize-none rounded-md border bg-background p-3 font-mono text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
            placeholder={t.rc4InputPlaceholder}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            spellCheck={false}
          />
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
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
            <div className="flex h-[460px] items-start overflow-auto rounded-md border border-destructive bg-destructive/10 p-3 font-mono text-sm text-destructive">
              {error}
            </div>
          ) : (
            <textarea
              readOnly
              className="h-[460px] w-full resize-none rounded-md border bg-muted p-3 font-mono text-sm outline-none"
              value={output}
              placeholder={t.outputPlaceholder}
              spellCheck={false}
            />
          )}
        </div>
      </div>

      <div className="flex gap-4">
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
  )
}
