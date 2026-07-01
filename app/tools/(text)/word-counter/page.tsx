"use client"

import { useMemo } from "react"

import { useToolState } from "@/hooks/use-tool-state"

function countWords(text: string): number {
  return text.trim() === "" ? 0 : text.trim().split(/\s+/).length
}

function countSentences(text: string): number {
  return text.trim() === "" ? 0 : (text.match(/[.!?]+/g) ?? []).length
}

function countParagraphs(text: string): number {
  return text.trim() === ""
    ? 0
    : text
        .trim()
        .split(/\n\s*\n/)
        .filter(Boolean).length
}

function readingTime(words: number): string {
  const minutes = words / 200
  if (minutes < 1) return "< 1 min"
  return `~${Math.ceil(minutes)} min`
}

interface StatCardProps {
  label: string
  value: string | number
}

function StatCard({ label, value }: StatCardProps) {
  return (
    <div className="rounded-md border bg-muted px-4 py-3">
      <p className="font-mono text-2xl font-bold">{value}</p>
      <p className="mt-0.5 text-xs text-muted-foreground">{label}</p>
    </div>
  )
}

export default function WordCounterPage() {
  const [text, setText] = useToolState("word-counter", "text", "")

  const stats = useMemo(() => {
    const words = countWords(text)
    const chars = text.length
    const charsNoSpaces = text.replace(/\s/g, "").length
    const sentences = countSentences(text)
    const paragraphs = countParagraphs(text)
    const lines = text === "" ? 0 : text.split("\n").length
    return {
      words,
      chars,
      charsNoSpaces,
      sentences,
      paragraphs,
      lines,
      readingTime: readingTime(words),
    }
  }, [text])

  return (
    <div className="flex h-full flex-col gap-4 px-4 lg:px-6">
      <div className="grid shrink-0 grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-7">
        <StatCard label="Words" value={stats.words} />
        <StatCard label="Characters" value={stats.chars} />
        <StatCard label="No Spaces" value={stats.charsNoSpaces} />
        <StatCard label="Sentences" value={stats.sentences} />
        <StatCard label="Paragraphs" value={stats.paragraphs} />
        <StatCard label="Lines" value={stats.lines} />
        <StatCard label="Reading Time" value={stats.readingTime} />
      </div>

      <textarea
        className="min-h-0 flex-1 resize-none rounded-md border bg-background p-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
        placeholder="Start typing or paste your text here..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        spellCheck={true}
      />
    </div>
  )
}
