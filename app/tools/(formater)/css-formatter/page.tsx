"use client";

import { Check, Copy } from "lucide-react";
import dynamic from "next/dynamic";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { useLanguage } from "@/contexts/language-context";
import { useToolState } from "@/hooks/use-tool-state";

const CodeEditor = dynamic(
  () => import("@/components/code-editor").then((m) => m.CodeEditor),
  { ssr: false }
);

type Syntax = "css" | "scss" | "sass";

const SYNTAXES: { value: Syntax; label: string }[] = [
  { value: "css", label: "CSS" },
  { value: "scss", label: "SCSS" },
  { value: "sass", label: "SASS" }
];

async function formatCode(code: string, syntax: Syntax): Promise<string> {
  const [prettier, postcssPlugin] = await Promise.all([
    import("prettier/standalone"),
    import("prettier/plugins/postcss")
  ]);
  return prettier.format(code, {
    parser: syntax,
    plugins: [postcssPlugin] as any[],
    printWidth: 80,
    tabWidth: 2,
    useTabs: false
  } as Parameters<typeof prettier.format>[1]);
}

function minifyCode(code: string, syntax: Syntax): string {
  if (syntax === "sass") {
    return code
      .replace(/\/\/[^\n]*/g, "")
      .replace(/\/\*[\s\S]*?\*\//g, "")
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .join("\n");
  }
  return code
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\/\/[^\n]*/g, "")
    .replace(/\s*([{};:,>~+])\s*/g, "$1")
    .replace(/\s+/g, " ")
    .replace(/;\}/g, "}")
    .trim();
}

const PLACEHOLDERS: Record<Syntax, keyof ReturnType<typeof useLanguage>["t"]> =
  {
    css: "cssInputPlaceholder",
    scss: "scssInputPlaceholder",
    sass: "sassInputPlaceholder"
  };

export default function CssFormatterPage() {
  const { t } = useLanguage();
  const [syntax, setSyntax] = useToolState<Syntax>(
    "css-formatter",
    "syntax",
    "css"
  );
  const [value, setValue] = useToolState("css-formatter", "input", "");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

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
      setValue(minifyCode(value, syntax));
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
          <Label htmlFor="css-syntax">Syntax</Label>
          <Select
            value={syntax}
            onValueChange={(v) => {
              setSyntax(v as Syntax);
              setError(null);
            }}
          >
            <SelectTrigger id="css-syntax" className="w-32">
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
        <div className="flex">
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
        language="css"
        placeholder={t[PLACEHOLDERS[syntax]]}
        value={value}
        onChange={(v) => {
          setValue(v);
          setError(null);
        }}
      />
    </div>
  );
}
