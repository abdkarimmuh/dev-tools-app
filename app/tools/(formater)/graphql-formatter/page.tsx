"use client";

import { parse, print } from "graphql";
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

export default function GraphqlFormatterPage() {
  const { t } = useLanguage();
  const [value, setValue] = useToolState("graphql-formatter", "input", "");
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const format = () => {
    try {
      setValue(print(parse(value)));
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
        language="graphql"
        placeholder="query { user(id: 1) { id name email posts { title } } }"
        value={value}
        onChange={(v) => {
          setValue(v);
          setError(null);
        }}
      />
    </div>
  );
}
