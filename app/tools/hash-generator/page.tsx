"use client"

import { useState } from "react"
import { Check, Copy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type Algorithm = "SHA-1" | "SHA-256" | "SHA-384" | "SHA-512"

const ALGORITHMS: Algorithm[] = ["SHA-1", "SHA-256", "SHA-384", "SHA-512"]

async function computeHash(algorithm: Algorithm, text: string): Promise<string> {
  const buffer = new TextEncoder().encode(text)
  const hashBuffer = await crypto.subtle.digest(algorithm, buffer)
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
}

export default function HashGeneratorPage() {
  const [input, setInput] = useState("")
  const [algorithm, setAlgorithm] = useState<Algorithm>("SHA-256")
  const [output, setOutput] = useState("")
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  const generate = async () => {
    if (!input) return
    setLoading(true)
    try {
      const hash = await computeHash(algorithm, input)
      setOutput(hash)
    } finally {
      setLoading(false)
    }
  }

  const copy = async () => {
    await navigator.clipboard.writeText(output)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="flex flex-col gap-6 px-4 lg:px-6 max-w-3xl">
      <div className="flex flex-col gap-2">
        <Label>Input</Label>
        <textarea
          className="h-40 w-full resize-none rounded-md border bg-background p-3 font-mono text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
          placeholder="Masukkan teks untuk di-hash..."
          value={input}
          onChange={(e) => {
            setInput(e.target.value)
            setOutput("")
          }}
          spellCheck={false}
        />
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <div className="flex flex-col gap-1.5">
          <Label>Algoritma</Label>
          <Select
            value={algorithm}
            onValueChange={(v) => {
              setAlgorithm(v as Algorithm)
              setOutput("")
            }}
          >
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ALGORITHMS.map((alg) => (
                <SelectItem key={alg} value={alg}>
                  {alg}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button onClick={generate} disabled={!input || loading}>
          {loading ? "Menghitung..." : "Generate Hash"}
        </Button>
      </div>

      {output && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <Label>{algorithm} Hash</Label>
            <Button
              size="sm"
              variant="ghost"
              onClick={copy}
              className="h-7 gap-1 text-xs"
            >
              {copied ? <Check className="size-3" /> : <Copy className="size-3" />}
              {copied ? "Copied!" : "Copy"}
            </Button>
          </div>
          <div className="rounded-md border bg-muted p-3 font-mono text-sm break-all">
            {output}
          </div>
          <p className="text-xs text-muted-foreground">
            {output.length / 2} bytes ({output.length * 4} bits)
          </p>
        </div>
      )}
    </div>
  )
}
