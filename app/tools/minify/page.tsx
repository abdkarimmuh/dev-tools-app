"use client"

import { useState } from "react"
import { Minimize2, Check, Copy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type Language = "javascript" | "json" | "html" | "css" | "scss" | "sass"

const LANGUAGES: { value: Language; label: string }[] = [
  { value: "javascript", label: "JavaScript" },
  { value: "json", label: "JSON" },
  { value: "html", label: "HTML" },
  { value: "css", label: "CSS" },
  { value: "scss", label: "SCSS" },
  { value: "sass", label: "SASS" },
]

function minifyJson(code: string): string {
  return JSON.stringify(JSON.parse(code))
}

function minifyCss(code: string): string {
  return code
    .replace(/\/\*[\s\S]*?\*\//g, "")   // hapus /* */ komentar
    .replace(/\s*([{};:,>~+])\s*/g, "$1") // hapus spasi di sekitar simbol
    .replace(/\s+/g, " ")                  // kolaps whitespace
    .replace(/;\}/g, "}")                  // hapus semicolon terakhir sebelum }
    .trim()
}

function minifySass(code: string): string {
  return code
    .replace(/\/\/[^\n]*/g, "")           // hapus // komentar
    .replace(/\/\*[\s\S]*?\*\//g, "")     // hapus /* */ komentar
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .join("\n")
}

function minifyHtml(code: string): string {
  return code
    .replace(/<!--[\s\S]*?-->/g, "")      // hapus komentar HTML
    .replace(/\s+/g, " ")                  // kolaps whitespace
    .replace(/>\s+</g, "><")              // hapus spasi antar tag
    .replace(/\s+>/g, ">")               // hapus spasi sebelum >
    .replace(/<\s+/g, "<")               // hapus spasi setelah <
    .trim()
}

function minifyJs(code: string): string {
  return code
    .replace(/\/\*[\s\S]*?\*\//g, "")     // hapus /* */ komentar
    .replace(/\/\/[^\n]*/g, "")            // hapus // komentar
    .replace(/[ \t]+/g, " ")              // kolaps spasi horizontal
    .replace(/\n\s*\n/g, "\n")            // hapus baris kosong
    .replace(/\n /g, "\n")               // hapus indentasi
    .replace(/ \n/g, "\n")              // hapus trailing space
    .trim()
}

function minify(code: string, language: Language): string {
  switch (language) {
    case "json":       return minifyJson(code)
    case "css":
    case "scss":       return minifyCss(code)
    case "sass":       return minifySass(code)
    case "html":       return minifyHtml(code)
    case "javascript": return minifyJs(code)
  }
}

function formatBytes(str: string): string {
  const bytes = new TextEncoder().encode(str).length
  return bytes < 1024 ? `${bytes} B` : `${(bytes / 1024).toFixed(1)} KB`
}

export default function MinifyPage() {
  const [language, setLanguage] = useState<Language>("javascript")
  const [input, setInput] = useState("")
  const [output, setOutput] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const run = () => {
    if (!input.trim()) return
    setError(null)
    try {
      setOutput(minify(input, language))
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

  const inputSize = input ? formatBytes(input) : null
  const outputSize = output ? formatBytes(output) : null
  const saved =
    input && output
      ? Math.round(
          (1 - new TextEncoder().encode(output).length / new TextEncoder().encode(input).length) * 100
        )
      : null

  return (
    <div className="flex flex-col gap-4 px-4 lg:px-6">
      <div className="flex flex-wrap items-end gap-3">
        <div className="flex flex-col gap-1.5">
          <Label>Bahasa</Label>
          <Select
            value={language}
            onValueChange={(v) => {
              setLanguage(v as Language)
              setOutput("")
              setError(null)
            }}
          >
            <SelectTrigger className="w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LANGUAGES.map((l) => (
                <SelectItem key={l.value} value={l.value}>
                  {l.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button onClick={run} disabled={!input.trim()} className="gap-2">
          <Minimize2 className="size-4" />
          Minify
        </Button>
        <Button variant="ghost" onClick={clear}>
          Clear
        </Button>
        {saved !== null && saved > 0 && (
          <span className="ml-auto text-sm text-green-600 dark:text-green-400">
            {inputSize} → {outputSize} ({saved}% lebih kecil)
          </span>
        )}
      </div>

      {language === "javascript" && (
        <p className="text-xs text-muted-foreground">
          Minify JS ini menghapus komentar dan whitespace. Untuk produksi, gunakan Terser atau esbuild.
        </p>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium">Input</span>
          <textarea
            className="h-[520px] w-full resize-none rounded-md border bg-background p-3 font-mono text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
            placeholder={`Paste kode ${LANGUAGES.find((l) => l.value === language)?.label} di sini...`}
            value={input}
            onChange={(e) => {
              setInput(e.target.value)
              setOutput("")
              setError(null)
            }}
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
              className="h-7 gap-1 text-xs"
            >
              {copied ? <Check className="size-3" /> : <Copy className="size-3" />}
              {copied ? "Copied!" : "Copy"}
            </Button>
          </div>
          {error ? (
            <div className="flex h-[520px] items-start overflow-auto rounded-md border border-destructive bg-destructive/10 p-3 font-mono text-sm text-destructive whitespace-pre-wrap">
              {error}
            </div>
          ) : (
            <textarea
              readOnly
              className="h-[520px] w-full resize-none rounded-md border bg-muted p-3 font-mono text-sm outline-none"
              value={output}
              placeholder="Hasil minify akan muncul di sini..."
              spellCheck={false}
            />
          )}
        </div>
      </div>
    </div>
  )
}
