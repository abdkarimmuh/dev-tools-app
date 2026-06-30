"use client"

import {
  Bold,
  Code,
  Code2,
  Heading1,
  Heading2,
  Heading3,
  Italic,
  Link,
  List,
  ListOrdered,
  type LucideIcon,
  Minus,
  Quote,
  Strikethrough,
} from "lucide-react"
import { marked } from "marked"
import { useMemo, useRef } from "react"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useLanguage } from "@/contexts/language-context"
import { useToolState } from "@/hooks/use-tool-state"

marked.use({ gfm: true, breaks: true })

type ToolbarItem =
  | {
      label: string
      icon: LucideIcon
      action: (
        ta: HTMLTextAreaElement,
        val: string
      ) => { value: string; start: number; end: number }
    }
  | "separator"

function wrap(before: string, after: string, placeholder: string) {
  return (ta: HTMLTextAreaElement, val: string) => {
    const s = ta.selectionStart
    const e = ta.selectionEnd
    const selected = val.substring(s, e) || placeholder
    const value =
      val.substring(0, s) + before + selected + after + val.substring(e)
    return {
      value,
      start: s + before.length,
      end: s + before.length + selected.length,
    }
  }
}

function linePrefix(prefix: string) {
  return (ta: HTMLTextAreaElement, val: string) => {
    const s = ta.selectionStart
    const e = ta.selectionEnd

    const lineStart = val.lastIndexOf("\n", s - 1) + 1
    const lineEnd =
      val.indexOf("\n", e) === -1 ? val.length : val.indexOf("\n", e)

    const lines = val.substring(lineStart, lineEnd).split("\n")
    const allHavePrefix = lines.every((l) => l.startsWith(prefix))

    const newLines = allHavePrefix
      ? lines.map((l) => l.slice(prefix.length))
      : lines.map((l) => prefix + l)
    const newBlock = newLines.join("\n")

    const value =
      val.substring(0, lineStart) + newBlock + val.substring(lineEnd)
    const offset = allHavePrefix ? -prefix.length : prefix.length
    return {
      value,
      start: Math.max(lineStart, s + offset),
      end: Math.max(lineStart, e + offset * lines.length),
    }
  }
}

function codeBlock() {
  return (ta: HTMLTextAreaElement, val: string) => {
    const s = ta.selectionStart
    const e = ta.selectionEnd
    const selected = val.substring(s, e) || "code"
    const inserted = "```\n" + selected + "\n```"
    const value = val.substring(0, s) + inserted + val.substring(e)
    return { value, start: s + 4, end: s + 4 + selected.length }
  }
}

function linkAction() {
  return (ta: HTMLTextAreaElement, val: string) => {
    const s = ta.selectionStart
    const e = ta.selectionEnd
    const selected = val.substring(s, e)
    const inserted = selected ? `[${selected}](url)` : "[link text](url)"
    const value = val.substring(0, s) + inserted + val.substring(e)
    const urlStart = s + inserted.indexOf("(") + 1
    const urlEnd = urlStart + 3
    return { value, start: urlStart, end: urlEnd }
  }
}

function hrAction() {
  return (ta: HTMLTextAreaElement, val: string) => {
    const s = ta.selectionStart
    const nl = val[s - 1] === "\n" ? "" : "\n"
    const inserted = nl + "---\n"
    const value = val.substring(0, s) + inserted + val.substring(s)
    return { value, start: s + inserted.length, end: s + inserted.length }
  }
}

const TOOLBAR: ToolbarItem[] = [
  { label: "Heading 1", icon: Heading1, action: linePrefix("# ") },
  { label: "Heading 2", icon: Heading2, action: linePrefix("## ") },
  { label: "Heading 3", icon: Heading3, action: linePrefix("### ") },
  "separator",
  { label: "Bold", icon: Bold, action: wrap("**", "**", "bold text") },
  { label: "Italic", icon: Italic, action: wrap("*", "*", "italic text") },
  {
    label: "Strikethrough",
    icon: Strikethrough,
    action: wrap("~~", "~~", "strikethrough"),
  },
  "separator",
  { label: "Blockquote", icon: Quote, action: linePrefix("> ") },
  { label: "Inline Code", icon: Code, action: wrap("`", "`", "code") },
  { label: "Code Block", icon: Code2, action: codeBlock() },
  "separator",
  { label: "Unordered List", icon: List, action: linePrefix("- ") },
  { label: "Ordered List", icon: ListOrdered, action: linePrefix("1. ") },
  "separator",
  { label: "Link", icon: Link, action: linkAction() },
  { label: "Horizontal Rule", icon: Minus, action: hrAction() },
]

export default function MarkdownPreviewPage() {
  const { t } = useLanguage()
  const [input, setInput] = useToolState("markdown-preview", "input", "")
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const html = useMemo(() => {
    if (!input.trim()) return ""
    return String(marked.parse(input))
  }, [input])

  const applyAction = (action: ToolbarItem) => {
    if (action === "separator") return
    const ta = textareaRef.current
    if (!ta) return

    const { value, start, end } = action.action(ta, input)
    setInput(value)

    requestAnimationFrame(() => {
      ta.focus()
      ta.setSelectionRange(start, end)
    })
  }

  const clear = () => setInput("")

  return (
    <div className="px-4 lg:px-6">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 rounded-t-md border border-b-0 bg-muted/40 px-2 py-1.5">
        {TOOLBAR.map((item, i) =>
          item === "separator" ? (
            <Separator key={i} orientation="vertical" className="mx-1 h-5" />
          ) : (
            <Tooltip key={item.label}>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7 shrink-0"
                  onClick={() => applyAction(item)}
                  type="button"
                >
                  <item.icon className="size-3.5" />
                  <span className="sr-only">{item.label}</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">{item.label}</TooltipContent>
            </Tooltip>
          )
        )}
        <div className="ml-auto">
          <Button size="sm" variant="ghost" onClick={clear} className="text-xs">
            {t.clear}
          </Button>
        </div>
      </div>

      {/* Editor + Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-2">
        {/* Editor */}
        <div className="flex flex-col">
          <div className="border-b bg-muted/20 px-3 py-1.5">
            <span className="text-xs font-medium text-muted-foreground">
              Write
            </span>
          </div>
          <textarea
            ref={textareaRef}
            className="h-[540px] w-full resize-none rounded-bl-md border border-r-0 bg-background p-3 font-mono text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring lg:rounded-br-none lg:rounded-bl-md"
            placeholder={
              "# Hello\n\nStart writing **markdown** here...\n\n- Item 1\n- Item 2\n\n> Blockquote\n\n```js\nconsole.log('hello')\n```"
            }
            value={input}
            onChange={(e) => setInput(e.target.value)}
            spellCheck={false}
          />
        </div>

        {/* Preview */}
        <div className="flex flex-col">
          <div className="border-b bg-muted/20 px-3 py-1.5">
            <span className="text-xs font-medium text-muted-foreground">
              Preview
            </span>
          </div>
          <div className="h-[540px] overflow-y-auto rounded-br-md border border-l-0 p-4 lg:rounded-br-md lg:rounded-bl-none">
            {html ? (
              <div
                className="prose prose-neutral dark:prose-invert prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: html }}
              />
            ) : (
              <p className="text-sm text-muted-foreground">
                {t.outputPlaceholder}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
