"use client";

import { Check, Copy } from "lucide-react";
import dynamic from "next/dynamic";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {
  DEFAULT_TREE_INPUT,
  generateTree
} from "@/constants/generators/tree-generator";
import { useLanguage } from "@/contexts/language-context";
import { useStorage } from "@/hooks/use-storage";
import { useToolState } from "@/hooks/use-tool-state";
import { cn } from "@/lib/utils";

const CodeEditor = dynamic(
  () => import("@/components/code-editor").then((m) => m.CodeEditor),
  { ssr: false }
);

type Charset = "unicode" | "ascii";

export default function TreeGeneratorPage() {
  const { t } = useLanguage();
  const [input, setInput] = useToolState(
    "tree-generator",
    "input",
    DEFAULT_TREE_INPUT
  );
  const [charset, setCharset] = useToolState<Charset>(
    "tree-generator",
    "charset",
    "unicode"
  );
  const [trailingSlash, setTrailingSlash] = useToolState(
    "tree-generator",
    "trailingSlash",
    false
  );
  const [copied, setCopied] = useState(false);
  const [wordWrap, setWordWrap] = useStorage(
    "code-editor-word-wrap",
    false,
    "local"
  );

  const output = useMemo(
    () => generateTree(input, { charset, trailingSlash }),
    [input, charset, trailingSlash]
  );

  const clear = () => setInput("");

  const copy = async () => {
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="flex h-full flex-col gap-4 px-4 lg:px-6">
      <div className="flex flex-wrap items-end gap-3">
        <div className="flex flex-col gap-1.5">
          <Label className="mb-1">{t.treeCharsetLabel}</Label>
          <Select
            value={charset}
            onValueChange={(v) => setCharset(v as Charset)}
          >
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="unicode">{t.treeCharsetUnicode}</SelectItem>
              <SelectItem value="ascii">{t.treeCharsetAscii}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2 pb-2">
          <Checkbox
            id="tree-trailing-slash"
            checked={trailingSlash}
            onCheckedChange={(c) => setTrailingSlash(c === true)}
          />
          <Label htmlFor="tree-trailing-slash" className="text-sm font-normal">
            {t.treeTrailingSlash}
          </Label>
        </div>
        <div className="flex items-center gap-2 pb-2">
          <Checkbox
            id="tree-generator-word-wrap"
            checked={wordWrap}
            onCheckedChange={(c) => setWordWrap(c === true)}
          />
          <Label
            htmlFor="tree-generator-word-wrap"
            className="text-sm font-normal"
          >
            {t.wrapLines}
          </Label>
        </div>
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="flex min-h-0 flex-col gap-2">
          <div className="flex shrink-0 items-center justify-between">
            <span className="text-sm font-medium">{t.treeInputLabel}</span>
            <Button
              size="sm"
              variant="ghost"
              onClick={clear}
              className="text-xs"
            >
              {t.clear}
            </Button>
          </div>
          <CodeEditor
            className="min-h-0 flex-1"
            language="text"
            value={input}
            onChange={setInput}
            placeholder={t.treeInputPlaceholder}
            wordWrap={wordWrap}
          />
        </div>

        <div className="flex min-h-0 flex-col gap-2">
          <div className="flex shrink-0 items-center justify-between">
            <span className="py-1.5 text-sm font-medium">
              {t.treeOutputLabel}
            </span>
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
          <div className="bg-muted min-h-0 flex-1 overflow-auto rounded-md border p-4">
            {output ? (
              <pre
                className={cn(
                  "font-mono text-sm",
                  wordWrap ? "whitespace-pre-wrap" : "whitespace-pre"
                )}
              >
                {output}
              </pre>
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
