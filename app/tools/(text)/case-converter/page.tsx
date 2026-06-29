"use client"

import { Check, Copy } from "lucide-react"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { useLanguage } from "@/contexts/language-context"
import { useStorage } from "@/hooks/use-storage"

function toWords(str: string): string[] {
  return str
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2")
    .replace(/[-_]+/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
}

const conversions = [
  {
    label: "camelCase",
    convert: (str: string) => {
      const words = toWords(str)
      return words
        .map((w, i) =>
          i === 0
            ? w.toLowerCase()
            : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()
        )
        .join("")
    },
  },
  {
    label: "PascalCase",
    convert: (str: string) =>
      toWords(str)
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(""),
  },
  {
    label: "snake_case",
    convert: (str: string) =>
      toWords(str)
        .map((w) => w.toLowerCase())
        .join("_"),
  },
  {
    label: "kebab-case",
    convert: (str: string) =>
      toWords(str)
        .map((w) => w.toLowerCase())
        .join("-"),
  },
  {
    label: "SCREAMING_SNAKE",
    convert: (str: string) =>
      toWords(str)
        .map((w) => w.toUpperCase())
        .join("_"),
  },
  {
    label: "Title Case",
    convert: (str: string) =>
      toWords(str)
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(" "),
  },
  {
    label: "lowercase",
    convert: (str: string) => str.toLowerCase(),
  },
  {
    label: "UPPERCASE",
    convert: (str: string) => str.toUpperCase(),
  },
]

function CopyButton({
  text,
  copyLabel,
  copiedLabel,
}: {
  text: string
  copyLabel: string
  copiedLabel: string
}) {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }
  return (
    <Button
      size="sm"
      variant="ghost"
      onClick={copy}
      className="h-7 shrink-0 gap-1 text-xs"
    >
      {copied ? <Check className="size-3" /> : <Copy className="size-3" />}
      {copied ? copiedLabel : copyLabel}
    </Button>
  )
}

export default function CaseConverterPage() {
  const { t } = useLanguage()
  const [input, setInput] = useStorage("case-converter:input", "")

  return (
    <div className="flex max-w-3xl flex-col gap-6 px-4 lg:px-6">
      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium">Input</span>
        <textarea
          className="h-24 w-full resize-none rounded-md border bg-background p-3 font-mono text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
          placeholder="hello world example text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          spellCheck={false}
        />
      </div>

      {input ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {conversions.map(({ label, convert }) => {
            const result = convert(input)
            return (
              <div
                key={label}
                className="flex items-center justify-between gap-2 rounded-md border bg-muted px-3 py-2"
              >
                <div className="flex min-w-0 flex-col gap-0.5">
                  <span className="text-xs text-muted-foreground">{label}</span>
                  <span className="truncate font-mono text-sm">{result}</span>
                </div>
                <CopyButton
                  text={result}
                  copyLabel={t.copy}
                  copiedLabel={t.copied}
                />
              </div>
            )
          })}
        </div>
      ) : (
        <div className="flex h-40 items-center justify-center rounded-md border border-dashed text-sm text-muted-foreground">
          {t.caseEmptyState}
        </div>
      )}
    </div>
  )
}
