"use client"

import { useState } from "react"
import { IconCheck, IconCopy, IconBrush } from "@tabler/icons-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type Language = "javascript" | "json" | "html" | "css" | "scss"

const LANGUAGES: { value: Language; label: string }[] = [
  { value: "javascript", label: "JavaScript" },
  { value: "json", label: "JSON" },
  { value: "html", label: "HTML" },
  { value: "css", label: "CSS" },
  { value: "scss", label: "SCSS / SASS" },
]

async function beautifyCode(code: string, language: Language): Promise<string> {
  const [prettier, babelPlugin, estreePlugin, htmlPlugin, postcssPlugin] =
    await Promise.all([
      import("prettier/standalone"),
      import("prettier/plugins/babel"),
      import("prettier/plugins/estree"),
      import("prettier/plugins/html"),
      import("prettier/plugins/postcss"),
    ])

  const parserMap: Record<Language, string> = {
    javascript: "babel",
    json: "json",
    html: "html",
    css: "css",
    scss: "scss",
  }

  const pluginMap: Record<Language, unknown[]> = {
    javascript: [babelPlugin, estreePlugin],
    json: [babelPlugin, estreePlugin],
    html: [htmlPlugin],
    css: [postcssPlugin],
    scss: [postcssPlugin],
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return prettier.format(code, {
    parser: parserMap[language],
    plugins: pluginMap[language] as any[],
    printWidth: 80,
    tabWidth: 2,
    useTabs: false,
    semi: true,
    singleQuote: false,
    trailingComma: "es5",
  } as Parameters<typeof prettier.format>[1])
}

export default function BeautifyPage() {
  const [language, setLanguage] = useState<Language>("javascript")
  const [input, setInput] = useState("")
  const [output, setOutput] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  const run = async () => {
    if (!input.trim()) return
    setLoading(true)
    setError(null)
    try {
      const result = await beautifyCode(input, language)
      setOutput(result)
    } catch (e) {
      setError((e as Error).message)
      setOutput("")
    } finally {
      setLoading(false)
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
        <Button onClick={run} disabled={!input.trim() || loading} className="gap-2">
          <IconBrush className="size-4" />
          {loading ? "Formatting..." : "Beautify"}
        </Button>
        <Button variant="ghost" onClick={clear}>
          Clear
        </Button>
      </div>

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
              {copied ? <IconCheck className="size-3" /> : <IconCopy className="size-3" />}
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
              placeholder="Hasil beautify akan muncul di sini..."
              spellCheck={false}
            />
          )}
        </div>
      </div>
    </div>
  )
}
