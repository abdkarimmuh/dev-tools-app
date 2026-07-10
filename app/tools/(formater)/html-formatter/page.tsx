"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/language-context";
import { useToolState } from "@/hooks/use-tool-state";
import { handleTextareaTab } from "@/lib/utils";

async function formatHtml(code: string): Promise<string> {
  const [prettier, htmlPlugin] = await Promise.all([
    import("prettier/standalone"),
    import("prettier/plugins/html")
  ]);

  return prettier.format(code, {
    parser: "html",
    plugins: [htmlPlugin] as any[],
    printWidth: 80,
    tabWidth: 2,
    useTabs: false
  } as Parameters<typeof prettier.format>[1]);
}

function minifyHtml(code: string): string {
  return code
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/\s+/g, " ")
    .replace(/>\s+</g, "><")
    .replace(/\s+>/g, ">")
    .replace(/<\s+/g, "<")
    .trim();
}

export default function HtmlFormatterPage() {
  const { t } = useLanguage();
  const [value, setValue] = useToolState("html-formatter", "input", "");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const format = async () => {
    setLoading(true);
    setError(null);
    try {
      setValue(await formatHtml(value));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const minify = () => {
    setError(null);
    try {
      setValue(minifyHtml(value));
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
        <div className="flex gap-4">
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
        <div className="shrink-0 rounded-md border border-destructive bg-destructive/10 p-3 font-mono text-sm whitespace-pre-wrap text-destructive">
          {error}
        </div>
      )}

      <textarea
        className="min-h-0 w-full flex-1 resize-none rounded-md border bg-background p-3 font-mono text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
        placeholder={t.htmlInputPlaceholder}
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          setError(null);
        }}
        onKeyDown={(e) => handleTextareaTab(e, value, setValue)}
        spellCheck={false}
      />
    </div>
  );
}
