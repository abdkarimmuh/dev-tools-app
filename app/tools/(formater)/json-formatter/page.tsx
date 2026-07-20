"use client";

import { Check, Copy } from "lucide-react";
import dynamic from "next/dynamic";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/language-context";
import { useToolState } from "@/hooks/use-tool-state";

const CodeEditor = dynamic(
  () => import("@/components/code-editor").then((m) => m.CodeEditor),
  { ssr: false }
);

export default function JsonFormatterPage() {
  const { t } = useLanguage();
  const [value, setValue] = useToolState("json-formatter", "input", "");
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const format = () => {
    try {
      const parsed = JSON.parse(value);
      setValue(JSON.stringify(parsed, null, 2));
      setError(null);
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const minify = () => {
    try {
      const parsed = JSON.parse(value);
      setValue(JSON.stringify(parsed));
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
        <div className="flex gap-4">
          <Button size="lg" onClick={format} disabled={!value}>
            {t.format}
          </Button>
          <Button
            size="lg"
            onClick={minify}
            disabled={!value}
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
        <div className="border-destructive bg-destructive/10 text-destructive shrink-0 rounded-md border p-3 font-mono text-sm">
          {error}
        </div>
      )}

      <CodeEditor
        className="min-h-0 flex-1"
        language="json"
        placeholder='{"key": "value"}'
        value={value}
        onChange={(v) => {
          setValue(v);
          setError(null);
        }}
      />
    </div>
  );
}
