"use client"

import { Check, Copy } from "lucide-react"
import { useEffect, useRef, useState } from "react"

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

type Syntax = "css" | "scss" | "sass"

const SYNTAXES: { value: Syntax; label: string }[] = [
  { value: "css", label: "CSS" },
  { value: "scss", label: "SCSS" },
  { value: "sass", label: "SASS" },
]

async function formatCode(code: string, syntax: Syntax): Promise<string> {
  const [prettier, postcssPlugin] = await Promise.all([
    import("prettier/standalone"),
    import("prettier/plugins/postcss"),
  ])
  return prettier.format(code, {
    parser: syntax,
    plugins: [postcssPlugin] as any[],
    printWidth: 80,
    tabWidth: 2,
    useTabs: false,
  } as Parameters<typeof prettier.format>[1])
}

function minifyCode(code: string, syntax: Syntax): string {
  if (syntax === "sass") {
    return code
      .replace(/\/\/[^\n]*/g, "")
      .replace(/\/\*[\s\S]*?\*\//g, "")
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .join("\n")
  }
  return code
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\/\/[^\n]*/g, "")
    .replace(/\s*([{};:,>~+])\s*/g, "$1")
    .replace(/\s+/g, " ")
    .replace(/;\}/g, "}")
    .trim()
}

const PLACEHOLDERS: Record<Syntax, keyof ReturnType<typeof useLanguage>["t"]> = {
  css: "cssInputPlaceholder",
  scss: "scssInputPlaceholder",
  sass: "sassInputPlaceholder",
}

export default function CssFormatterPage() {
  const { t } = useLanguage()
  const [syntax, setSyntax] = useToolState<Syntax>("css-formatter", "syntax", "css")
  const [input, setInput] = useToolState("css-formatter", "input", "")
  const [output, setOutput] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      if (!input.trim()) { setOutput(""); setError(null); return }
      setLoading(true)
      setError(null)
      try {
        setOutput(await formatCode(input, syntax))
      } catch (e) {
        setError((e as Error).message)
        setOutput("")
      } finally {
        setLoading(false)
      }
    }, 500)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [input, syntax])

  const minify = () => {
    if (!input.trim()) return
    try { setOutput(minifyCode(input, syntax)); setError(null) }
    catch (e) { setError((e as Error).message); setOutput("") }
  }

  const format = () => { if (!output) return; setInput(output); setError(null) }
  const clear = () => { setInput(""); setOutput(""); setError(null) }
  const copy = async () => {
    await navigator.clipboard.writeText(output)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="px-4 lg:px-6">
      <div className="mb-4 flex items-center gap-3">
        <Label htmlFor="css-syntax">Syntax</Label>
        <Select
          value={syntax}
          onValueChange={(v) => { setSyntax(v as Syntax); setOutput(""); setError(null) }}
        >
          <SelectTrigger id="css-syntax" className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SYNTAXES.map((s) => (
              <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Input</span>
            <Button size="sm" variant="ghost" onClick={clear} className="text-xs">{t.clear}</Button>
          </div>
          <textarea
            className="h-[520px] w-full resize-none rounded-md border bg-background p-3 font-mono text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
            placeholder={t[PLACEHOLDERS[syntax]]}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            spellCheck={false}
          />
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Output</span>
            <Button size="sm" variant="ghost" onClick={copy} disabled={!output} className="gap-1 text-xs">
              {copied ? <Check className="size-3" /> : <Copy className="size-3" />}
              {copied ? t.copied : t.copy}
            </Button>
          </div>
          {error ? (
            <div className="flex h-[520px] items-start overflow-auto rounded-md border border-destructive bg-destructive/10 p-3 font-mono text-sm whitespace-pre-wrap text-destructive">{error}</div>
          ) : (
            <textarea readOnly className="h-[520px] w-full resize-none rounded-md border bg-muted p-3 font-mono text-sm outline-none" value={output} placeholder={t.outputPlaceholder} spellCheck={false} />
          )}
        </div>
      </div>
      <div className="mt-4 flex gap-4">
        <Button size="lg" onClick={format} disabled={!input || loading}>{loading ? t.formatting : t.format}</Button>
        <Button size="lg" onClick={minify} disabled={!output || loading} variant="secondary">{t.minify}</Button>
      </div>
    </div>
  )
}
