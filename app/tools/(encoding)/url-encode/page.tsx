"use client"

import { Check, Copy } from "lucide-react"
import { useState } from "react"

import { Button } from "@/components/ui/button"

export default function UrlEncodePage() {
  const [input, setInput] = useState("")
  const [output, setOutput] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const encode = () => {
    try {
      setOutput(encodeURIComponent(input))
      setError(null)
    } catch {
      setError("Gagal mengencoding URL.")
    }
  }

  const decode = () => {
    try {
      setOutput(decodeURIComponent(input))
      setError(null)
    } catch {
      setError("Input bukan URL encoded yang valid.")
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
    <div className="px-4 lg:px-6">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Input</span>
            <Button size="sm" variant="ghost" onClick={clear} className="h-7 text-xs">
              Clear
            </Button>
          </div>
          <textarea
            className="h-[520px] w-full resize-none rounded-md border bg-background p-3 font-mono text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
            placeholder="Masukkan teks atau URL encoded string..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            spellCheck={false}
          />
          <div className="flex gap-2">
            <Button size="sm" onClick={encode} disabled={!input}>
              Encode
            </Button>
            <Button size="sm" variant="outline" onClick={decode} disabled={!input}>
              Decode
            </Button>
            {output && (
              <Button size="sm" variant="ghost" onClick={swap} className="ml-auto">
                Swap ↕
              </Button>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Output</span>
            <Button
              size="sm"
              variant="ghost"
              onClick={copy}
              disabled={!output}
              className="h-7 gap-1 text-xs"
            >
              {copied ? <Check className="size-3" /> : <Copy className="size-3" />}
              {copied ? "Copied!" : "Copy"}
            </Button>
          </div>
          {error ? (
            <div className="flex h-[520px] items-start overflow-auto rounded-md border border-destructive bg-destructive/10 p-3 font-mono text-sm text-destructive">
              {error}
            </div>
          ) : (
            <textarea
              readOnly
              className="h-[520px] w-full resize-none rounded-md border bg-muted p-3 font-mono text-sm outline-none"
              value={output}
              placeholder="Output akan muncul di sini..."
              spellCheck={false}
            />
          )}
        </div>
      </div>
    </div>
  )
}
