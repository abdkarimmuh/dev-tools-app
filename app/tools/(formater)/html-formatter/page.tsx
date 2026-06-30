"use client"

import { Check, Copy } from "lucide-react"
import { useEffect, useRef, useState } from "react"

import { Button } from "@/components/ui/button"
import { useLanguage } from "@/contexts/language-context"
import { useStorage } from "@/hooks/use-storage"

async function formatHtml(code: string): Promise<string> {
  const [prettier, htmlPlugin] = await Promise.all([
    import("prettier/standalone"),
    import("prettier/plugins/html"),
  ])

  return prettier.format(code, {
    parser: "html",
    plugins: [htmlPlugin] as any[],
    printWidth: 80,
    tabWidth: 2,
    useTabs: false,
  } as Parameters<typeof prettier.format>[1])
}

function minifyHtml(code: string): string {
  return code
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/\s+/g, " ")
    .replace(/>\s+</g, "><")
    .replace(/\s+>/g, ">")
    .replace(/<\s+/g, "<")
    .trim()
}

export default function HtmlFormatterPage() {
  const { t } = useLanguage()
  const [input, setInput] = useStorage("html-formatter:input", "")
  const [output, setOutput] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      if (!input.trim()) {
        setOutput("")
        setError(null)
        return
      }
      setLoading(true)
      setError(null)
      try {
        setOutput(await formatHtml(input))
      } catch (e) {
        setError((e as Error).message)
        setOutput("")
      } finally {
        setLoading(false)
      }
    }, 500)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [input])

  const minify = () => {
    if (!input.trim()) return
    setError(null)
    try {
      setOutput(minifyHtml(input))
    } catch (e) {
      setError((e as Error).message)
      setOutput("")
    }
  }

  const format = () => {
    if (!output) return
    setInput(output)
    setError(null)
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
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Input</span>
            <Button
              size="sm"
              variant="ghost"
              onClick={clear}
              className="h-7 text-xs"
            >
              {t.clear}
            </Button>
          </div>
          <textarea
            className="h-[520px] w-full resize-none rounded-md border bg-background p-3 font-mono text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
            placeholder={t.htmlInputPlaceholder}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            spellCheck={false}
          />
          <div className="flex gap-2">
            <Button size="sm" onClick={format} disabled={!input || loading}>
              {t.format}
            </Button>
             <Button size="sm" onClick={minify} disabled={!output || loading} variant="secondary">
              {t.minify}
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
              {copied ? (
                <Check className="size-3" />
              ) : (
                <Copy className="size-3" />
              )}
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
