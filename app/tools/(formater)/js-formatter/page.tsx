"use client"

import { Check, Copy } from "lucide-react"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { useLanguage } from "@/contexts/language-context"

type Syntax = "js" | "ts"

const SYNTAXES: { label: string; value: Syntax }[] = [
  { label: "Javascript", value: "js" },
  { label: "Typescript", value: "ts" },
]

async function formatCode(code: string, syntax: Syntax): Promise<string> {
  const [prettier, babelPlugin, estreePlugin, typescriptPlugin] =
    await Promise.all([
      import("prettier/standalone"),
      import("prettier/plugins/babel"),
      import("prettier/plugins/estree"),
      import("prettier/plugins/typescript"),
    ])

  return prettier.format(code, {
    parser: syntax === "ts" ? "typescript" : "babel",
    plugins:
      syntax === "ts"
        ? ([typescriptPlugin, estreePlugin] as any[])
        : ([babelPlugin, estreePlugin] as any[]),
    printWidth: 80,
    tabWidth: 2,
    useTabs: false,
    semi: true,
    singleQuote: false,
    trailingComma: "es5",
  } as Parameters<typeof prettier.format>[1])
}

function minifyCode(code: string): string {
  return code
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\/\/[^\n]*/g, "")
    .replace(/[ \t]+/g, " ")
    .replace(/\n\s*\n/g, "\n")
    .replace(/\n /g, "\n")
    .replace(/ \n/g, "\n")
    .trim()
}

export default function JsFormatterPage() {
  const { t } = useLanguage()
  const [syntax, setSyntax] = useState<Syntax>("js")
  const [input, setInput] = useState("")
  const [output, setOutput] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  const placeholders: Record<Syntax, string> = {
    js: t.jsInputPlaceholder,
    ts: t.tsInputPlaceholder,
  }

  const format = async () => {
    if (!input.trim()) return
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
  }

  const minify = () => {
    if (!input.trim()) return
    setError(null)
    try {
      setOutput(minifyCode(input))
    } catch (e) {
      setError((e as Error).message)
      setOutput("")
    }
  }

  const validate = async () => {
    if (!input.trim()) return
    setLoading(true)
    setError(null)
    try {
      await formatCode(input, syntax)
      setOutput(`Valid ${syntax === "ts" ? "TypeScript" : "JavaScript"}`)
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
    <div className="px-4 lg:px-6">
      <div className="mb-3 flex w-fit items-center gap-1 rounded-md border">
        {SYNTAXES.map((s) => (
          <button
            key={s.value}
            onClick={() => {
              setSyntax(s.value)
              setOutput("")
              setError(null)
            }}
            className={`rounded px-3 py-1 text-sm font-medium transition-colors ${
              syntax === s.value
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Input</span>
            <Button size="sm" variant="ghost" onClick={clear} className="h-7 text-xs">
              {t.clear}
            </Button>
          </div>
          <textarea
            className="h-[520px] w-full resize-none rounded-md border bg-background p-3 font-mono text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
            placeholder={placeholders[syntax]}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            spellCheck={false}
          />
          <div className="flex gap-2">
            <Button size="sm" onClick={format} disabled={!input || loading}>
              {loading ? t.formatting : t.format}
            </Button>
            <Button size="sm" variant="outline" onClick={minify} disabled={!input || loading}>
              {t.minify}
            </Button>
            <Button size="sm" variant="outline" onClick={validate} disabled={!input || loading}>
              {t.validate}
            </Button>
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
              {copied ? t.copied : t.copy}
            </Button>
          </div>
          {error ? (
            <div className="flex h-[520px] items-start overflow-auto rounded-md border border-destructive bg-destructive/10 p-3 font-mono text-sm whitespace-pre-wrap text-destructive">
              {error}
            </div>
          ) : (
            <textarea
              readOnly
              className="h-[520px] w-full resize-none rounded-md border bg-muted p-3 font-mono text-sm outline-none"
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
