"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { format } from "sql-formatter";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { type Dialect, DIALECTS } from "@/constants/formatters/sql-formatter";
import { useLanguage } from "@/contexts/language-context";
import { useToolState } from "@/hooks/use-tool-state";
import { handleTextareaTab } from "@/lib/utils";

function minifySql(sql: string): string {
  return sql
    .replace(/--[^\n]*/g, "")
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export default function SqlFormatterPage() {
  const { t } = useLanguage();
  const [dialect, setDialect] = useToolState<Dialect>(
    "sql-formatter",
    "dialect",
    "sql"
  );
  const [value, setValue] = useToolState("sql-formatter", "input", "");
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const formatSql = () => {
    try {
      setValue(
        format(value, { language: dialect, tabWidth: 2, keywordCase: "upper" })
      );
      setError(null);
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const minify = () => {
    setValue(minifySql(value));
    setError(null);
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
          <Label htmlFor="sql-dialect">Dialect</Label>
          <Select
            value={dialect}
            onValueChange={(v) => {
              setDialect(v as Dialect);
              setError(null);
            }}
          >
            <SelectTrigger id="sql-dialect" className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DIALECTS.map((d) => (
                <SelectItem key={d.value} value={d.value}>
                  {d.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button size="lg" onClick={formatSql} disabled={!value}>
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
        <div className="shrink-0 rounded-md border border-destructive bg-destructive/10 p-3 font-mono text-sm text-destructive">
          {error}
        </div>
      )}

      <textarea
        className="min-h-0 w-full flex-1 resize-none rounded-md border bg-background p-3 font-mono text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
        placeholder={t.sqlInputPlaceholder}
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
