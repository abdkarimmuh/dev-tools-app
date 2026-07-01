"use client"

import { Check, Copy } from "lucide-react"
import { useState } from "react"
import { format } from "sql-formatter"

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

type Dialect =
  | "sql"
  | "mysql"
  | "postgresql"
  | "transactsql"
  | "sqlite"
  | "plsql"

const DIALECTS: { value: Dialect; label: string }[] = [
  { value: "sql", label: "SQL" },
  { value: "mysql", label: "MySQL" },
  { value: "postgresql", label: "PostgreSQL" },
  { value: "transactsql", label: "T-SQL" },
  { value: "sqlite", label: "SQLite" },
  { value: "plsql", label: "PL/SQL" },
]

function minifySql(sql: string): string {
  return sql
    .replace(/--[^\n]*/g, "")
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\s+/g, " ")
    .trim()
}

export default function SqlFormatterPage() {
  const { t } = useLanguage()
  const [dialect, setDialect] = useToolState<Dialect>(
    "sql-formatter",
    "dialect",
    "sql"
  )
  const [input, setInput] = useToolState("sql-formatter", "input", "")
  const [output, setOutput] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const formatSql = () => {
    if (!input.trim()) return
    try {
      setOutput(
        format(input, { language: dialect, tabWidth: 2, keywordCase: "upper" })
      )
      setError(null)
    } catch (e) {
      setError((e as Error).message)
      setOutput("")
    }
  }

  const minify = () => {
    if (!input.trim()) return
    setOutput(minifySql(input))
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
    <div className="flex h-full flex-col gap-4 px-4 lg:px-6">
      <div className="flex shrink-0 items-center justify-between">
        <div className="flex items-center gap-3">
          <Label htmlFor="sql-dialect">Dialect</Label>
          <Select
            value={dialect}
            onValueChange={(v) => {
              setDialect(v as Dialect)
              setOutput("")
              setError(null)
            }}
          >
            <SelectTrigger id="sql-dialect" className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DIALECTS.map((d) => (
                <SelectItem key={d.value} value={d.value}>
                  {d.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-4">
          <Button size="lg" onClick={formatSql} disabled={!input}>
            {t.format}
          </Button>
          <Button
            size="lg"
            onClick={minify}
            disabled={!input}
            variant="secondary"
          >
            {t.minify}
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
            placeholder={t.sqlInputPlaceholder}
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
              <span>{error}</span>
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
