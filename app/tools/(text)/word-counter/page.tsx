"use client";

import { useMemo } from "react";

import { Textarea } from "@/components/ui/textarea";
import { useLanguage } from "@/contexts/language-context";
import { useToolState } from "@/hooks/use-tool-state";
import { handleTextareaTab } from "@/lib/utils";

function countWords(text: string): number {
  return text.trim() === "" ? 0 : text.trim().split(/\s+/).length;
}

function countSentences(text: string): number {
  return text.trim() === "" ? 0 : (text.match(/[.!?]+/g) ?? []).length;
}

function countParagraphs(text: string): number {
  return text.trim() === ""
    ? 0
    : text
        .trim()
        .split(/\n\s*\n/)
        .filter(Boolean).length;
}

const WORDS_PER_MINUTE = 200;

function readingTime(words: number, minUnit: string, secUnit: string): string {
  const totalSeconds = Math.round((words / WORDS_PER_MINUTE) * 60);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  if (minutes === 0) return `${seconds} ${secUnit}`;
  if (seconds === 0) return `${minutes} ${minUnit}`;
  return `${minutes} ${minUnit} ${seconds} ${secUnit}`;
}

interface StatCardProps {
  label: string;
  value: string | number;
}

function StatCard({ label, value }: StatCardProps) {
  return (
    <div className="bg-muted rounded-md border px-4 py-3">
      <p className="font-mono text-2xl font-bold">{value}</p>
      <p className="text-muted-foreground mt-0.5 text-xs">{label}</p>
    </div>
  );
}

export default function WordCounterPage() {
  const { t } = useLanguage();
  const [text, setText] = useToolState("word-counter", "text", "");

  const stats = useMemo(() => {
    const words = countWords(text);
    const chars = text.length;
    const charsNoSpaces = text.replace(/\s/g, "").length;
    const sentences = countSentences(text);
    const paragraphs = countParagraphs(text);
    const lines = text === "" ? 0 : text.split("\n").length;
    return {
      words,
      chars,
      charsNoSpaces,
      sentences,
      paragraphs,
      lines,
      readingTime: readingTime(
        words,
        t.wordCounterMinUnit,
        t.wordCounterSecUnit
      )
    };
  }, [text, t.wordCounterMinUnit, t.wordCounterSecUnit]);

  return (
    <div className="flex h-full flex-col gap-4 px-4 lg:px-6">
      <div className="grid shrink-0 grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-7">
        <StatCard label={t.wordCounterWords} value={stats.words} />
        <StatCard label={t.wordCounterCharacters} value={stats.chars} />
        <StatCard label={t.wordCounterNoSpaces} value={stats.charsNoSpaces} />
        <StatCard label={t.wordCounterSentences} value={stats.sentences} />
        <StatCard label={t.wordCounterParagraphs} value={stats.paragraphs} />
        <StatCard label={t.wordCounterLines} value={stats.lines} />
        <StatCard label={t.wordCounterReadingTime} value={stats.readingTime} />
      </div>

      <Textarea
        className="min-h-0 flex-1 resize-none text-sm"
        placeholder={t.wordCounterPlaceholder}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => handleTextareaTab(e, text, setText)}
        spellCheck={true}
      />
    </div>
  );
}
