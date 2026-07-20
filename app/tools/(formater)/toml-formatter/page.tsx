"use client";

import { Check, Copy } from "lucide-react";
import dynamic from "next/dynamic";
import { useState } from "react";
import * as TOML from "smol-toml";

import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/language-context";
import { useToolState } from "@/hooks/use-tool-state";

const CodeEditor = dynamic(
  () => import("@/components/code-editor").then((m) => m.CodeEditor),
  { ssr: false }
);

export default function TomlFormatterPage() {
  const { t } = useLanguage();
  const [value, setValue] = useToolState("toml-formatter", "input", "");
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const format = () => {
    try {
      const parsed = TOML.parse(value);
      setValue(TOML.stringify(parsed));
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
        <Button size="lg" onClick={format} disabled={!value}>
          {t.format}
        </Button>
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
        language="toml"
        placeholder={
          '[package]\nname = "my-app"\nversion = "1.0.0"\n\n[dependencies]\nreact = "^18.0.0"'
        }
        value={value}
        onChange={(v) => {
          setValue(v);
          setError(null);
        }}
      />
    </div>
  );
}
