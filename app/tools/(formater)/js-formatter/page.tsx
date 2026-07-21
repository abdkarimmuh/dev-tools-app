"use client";

import { Check, Copy } from "lucide-react";
import dynamic from "next/dynamic";
import { useState } from "react";

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
import { useLanguage } from "@/contexts/language-context";
import { useStorage } from "@/hooks/use-storage";
import { useToolState } from "@/hooks/use-tool-state";

const CodeEditor = dynamic(
  () => import("@/components/code-editor").then((m) => m.CodeEditor),
  { ssr: false }
);

type Syntax = "js" | "ts";

const SYNTAXES: { value: Syntax; label: string }[] = [
  { value: "js", label: "JavaScript" },
  { value: "ts", label: "TypeScript" }
];

async function formatCode(code: string, syntax: Syntax): Promise<string> {
  const [prettier, estreePlugin, langPlugin] = await Promise.all([
    import("prettier/standalone"),
    import("prettier/plugins/estree"),
    syntax === "ts"
      ? import("prettier/plugins/typescript")
      : import("prettier/plugins/babel")
  ]);
  return prettier.format(code, {
    parser: syntax === "ts" ? "typescript" : "babel",
    plugins: [langPlugin, estreePlugin] as any[],
    printWidth: 80,
    tabWidth: 2,
    useTabs: false,
    semi: true,
    singleQuote: false,
    trailingComma: "es5"
  } as Parameters<typeof prettier.format>[1]);
}

function minifyCode(code: string): string {
  return code
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\/\/[^\n]*/g, "")
    .replace(/[ \t]+/g, " ")
    .replace(/\n\s*\n/g, "\n")
    .replace(/\n /g, "\n")
    .replace(/ \n/g, "\n")
    .trim();
}

const PLACEHOLDERS: Record<Syntax, keyof ReturnType<typeof useLanguage>["t"]> =
  {
    js: "jsInputPlaceholder",
    ts: "tsInputPlaceholder"
  };

export default function JsFormatterPage() {
  const { t } = useLanguage();
  const [syntax, setSyntax] = useToolState<Syntax>(
    "js-formatter",
    "syntax",
    "js"
  );
  const [value, setValue] = useToolState("js-formatter", "input", "");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [wordWrap, setWordWrap] = useStorage(
    "code-editor-word-wrap",
    false,
    "local"
  );

  const format = async () => {
    setLoading(true);
    setError(null);
    try {
      setValue(await formatCode(value, syntax));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const minify = () => {
    try {
      setValue(minifyCode(value));
      setError(null);
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const clear = () => {
    setValue("");
    setError(null);
  };
  const copy = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="flex h-full flex-col gap-4 px-4 lg:px-6">
      <div className="flex shrink-0 items-center justify-between">
        <div className="flex items-center gap-3">
          <Label htmlFor="js-syntax">Syntax</Label>
          <Select
            value={syntax}
            onValueChange={(v) => {
              setSyntax(v as Syntax);
              setError(null);
            }}
          >
            <SelectTrigger id="js-syntax" className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SYNTAXES.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button size="lg" onClick={format} disabled={!value || loading}>
            {loading ? t.formatting : t.format}
          </Button>
          <Button
            size="lg"
            onClick={minify}
            disabled={!value || loading}
            variant="secondary"
          >
            {t.minify}
          </Button>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Checkbox
              id="js-formatter-word-wrap"
              checked={wordWrap}
              onCheckedChange={(c) => setWordWrap(c === true)}
            />
            <Label
              htmlFor="js-formatter-word-wrap"
              className="text-xs font-normal"
            >
              {t.wrapLines}
            </Label>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={copy}
            disabled={!value}
            className="gap-1 text-xs"
          >
            {copied ? (
              <Check className="size-3" />
            ) : (
              <Copy className="size-3" />
            )}
            {copied ? t.copied : t.copy}
          </Button>
          <Button size="sm" variant="ghost" onClick={clear} className="text-xs">
            {t.clear}
          </Button>
        </div>
      </div>

      {error && (
        <div className="border-destructive bg-destructive/10 text-destructive shrink-0 rounded-md border p-3 font-mono text-sm whitespace-pre-wrap">
          {error}
        </div>
      )}

      <CodeEditor
        className="min-h-0 flex-1"
        language={syntax === "ts" ? "typescript" : "javascript"}
        placeholder={t[PLACEHOLDERS[syntax]]}
        value={value}
        wordWrap={wordWrap}
        onChange={(v) => {
          setValue(v);
          setError(null);
        }}
      />
    </div>
  );
}
