"use client";

import type { EditorView } from "@uiw/react-codemirror";
import DOMPurify from "dompurify";
import type { LucideIcon } from "lucide-react";
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
  Minus,
  Quote,
  Strikethrough
} from "lucide-react";
import { marked } from "marked";
import dynamic from "next/dynamic";
import { useMemo, useRef } from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from "@/components/ui/tooltip";
import { useLanguage } from "@/contexts/language-context";
import { useStorage } from "@/hooks/use-storage";
import { useToolState } from "@/hooks/use-tool-state";

const CodeEditor = dynamic(
  () => import("@/components/code-editor").then((m) => m.CodeEditor),
  { ssr: false }
);

marked.use({ gfm: true, breaks: true });

type ToolbarItem =
  | {
      label: string;
      icon: LucideIcon;
      action: (view: EditorView) => void;
    }
  | "separator";

function wrap(before: string, after: string, placeholder: string) {
  return (view: EditorView) => {
    const { from, to } = view.state.selection.main;
    const selected = view.state.sliceDoc(from, to) || placeholder;
    view.dispatch({
      changes: { from, to, insert: before + selected + after },
      selection: {
        anchor: from + before.length,
        head: from + before.length + selected.length
      }
    });
    view.focus();
  };
}

function linePrefix(prefix: string) {
  return (view: EditorView) => {
    const { from, to } = view.state.selection.main;
    const lineStart = view.state.doc.lineAt(from).from;
    const lineEnd = view.state.doc.lineAt(to).to;

    const lines = view.state.sliceDoc(lineStart, lineEnd).split("\n");
    const allHavePrefix = lines.every((l) => l.startsWith(prefix));

    const newLines = allHavePrefix
      ? lines.map((l) => l.slice(prefix.length))
      : lines.map((l) => prefix + l);
    const offset = allHavePrefix ? -prefix.length : prefix.length;

    view.dispatch({
      changes: { from: lineStart, to: lineEnd, insert: newLines.join("\n") },
      selection: {
        anchor: Math.max(lineStart, from + offset),
        head: Math.max(lineStart, to + offset * lines.length)
      }
    });
    view.focus();
  };
}

function codeBlock() {
  return (view: EditorView) => {
    const { from, to } = view.state.selection.main;
    const selected = view.state.sliceDoc(from, to) || "code";
    view.dispatch({
      changes: { from, to, insert: "```\n" + selected + "\n```" },
      selection: { anchor: from + 4, head: from + 4 + selected.length }
    });
    view.focus();
  };
}

function linkAction() {
  return (view: EditorView) => {
    const { from, to } = view.state.selection.main;
    const selected = view.state.sliceDoc(from, to);
    const insert = selected ? `[${selected}](url)` : "[link text](url)";
    const urlStart = from + insert.indexOf("(") + 1;
    view.dispatch({
      changes: { from, to, insert },
      selection: { anchor: urlStart, head: urlStart + 3 }
    });
    view.focus();
  };
}

function hrAction() {
  return (view: EditorView) => {
    const { from } = view.state.selection.main;
    const prevChar = from > 0 ? view.state.sliceDoc(from - 1, from) : "\n";
    const insert = (prevChar === "\n" ? "" : "\n") + "---\n";
    view.dispatch({
      changes: { from, to: from, insert },
      selection: { anchor: from + insert.length, head: from + insert.length }
    });
    view.focus();
  };
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
    action: wrap("~~", "~~", "strikethrough")
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
  { label: "Horizontal Rule", icon: Minus, action: hrAction() }
];

export default function MarkdownPreviewPage() {
  const { t } = useLanguage();
  const [input, setInput] = useToolState("markdown-preview", "input", "");
  const [wordWrap, setWordWrap] = useStorage(
    "code-editor-word-wrap",
    false,
    "local"
  );
  const viewRef = useRef<EditorView | null>(null);

  const html = useMemo(() => {
    if (!input.trim()) return "";
    if (typeof window === "undefined") return "";
    const raw = String(marked.parse(input));
    return DOMPurify.sanitize(raw);
  }, [input]);

  const applyAction = (action: ToolbarItem) => {
    if (action === "separator") return;
    const view = viewRef.current;
    if (!view) return;
    action.action(view);
  };

  const clear = () => setInput("");

  return (
    <div className="flex h-full flex-col gap-4 px-4 lg:px-6">
      {/* Toolbar */}
      <div className="flex shrink-0 flex-wrap items-center gap-0.5">
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
      </div>

      {/* Editor + Preview */}
      <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Write */}
        <div className="flex min-h-0 flex-col gap-2">
          <div className="flex shrink-0 items-center justify-between">
            <span className="text-sm font-medium">Write</span>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="markdown-preview-word-wrap"
                  checked={wordWrap}
                  onCheckedChange={(c) => setWordWrap(c === true)}
                />
                <Label
                  htmlFor="markdown-preview-word-wrap"
                  className="text-xs font-normal"
                >
                  {t.wrapLines}
                </Label>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={clear}
                className="text-xs"
              >
                {t.clear}
              </Button>
            </div>
          </div>
          <CodeEditor
            className="min-h-0 flex-1"
            language="markdown"
            placeholder={"# Hello"}
            value={input}
            wordWrap={wordWrap}
            onChange={setInput}
            onCreateEditor={(view) => {
              viewRef.current = view;
            }}
          />
        </div>

        {/* Preview */}
        <div className="flex min-h-0 flex-col gap-2">
          <div className="flex shrink-0 items-center justify-between">
            <span className="py-1.5 text-sm font-medium">Preview</span>
          </div>
          <div className="bg-muted min-h-0 flex-1 overflow-y-auto rounded-md border p-4">
            {html ? (
              <div
                className="prose prose-sm prose-neutral dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: html }}
              />
            ) : (
              <p className="text-muted-foreground text-sm">
                {t.outputPlaceholder}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
