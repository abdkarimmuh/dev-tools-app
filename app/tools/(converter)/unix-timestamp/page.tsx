"use client";

import { Check, Copy, RefreshCw } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLanguage } from "@/contexts/language-context";
import { useToolState } from "@/hooks/use-tool-state";

function formatDate(d: Date, tz: string): string {
  return (
    d.toLocaleString("en-GB", {
      timeZone: tz,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false
    }) + ` (${tz})`
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <Button
      size="sm"
      variant="ghost"
      onClick={copy}
      className="h-8 px-2"
      disabled={!text}
    >
      {copied ? <Check className="size-3" /> : <Copy className="size-3" />}
    </Button>
  );
}

export default function UnixTimestampPage() {
  const { t } = useLanguage();
  const [tsInput, setTsInput] = useToolState("unix-timestamp", "tsInput", "");
  const [dateInput, setDateInput] = useToolState(
    "unix-timestamp",
    "dateInput",
    ""
  );
  const [now, setNow] = useState(() => Math.floor(Date.now() / 1000));

  const tsDate = (() => {
    if (!tsInput) return null;
    const n = Number(tsInput);
    if (isNaN(n)) return null;
    const ms = tsInput.length >= 13 ? n : n * 1000;
    const d = new Date(ms);
    return isNaN(d.getTime()) ? null : d;
  })();

  const dateTs = (() => {
    if (!dateInput) return null;
    const d = new Date(dateInput);
    return isNaN(d.getTime()) ? null : Math.floor(d.getTime() / 1000);
  })();

  const tsError = tsInput && !tsDate ? t.unixInvalidTimestamp : null;
  const dateError = dateInput && dateTs === null ? t.unixInvalidDate : null;

  const localTz = Intl.DateTimeFormat().resolvedOptions().timeZone;

  return (
    <div className="flex max-w-xl flex-col gap-8 px-4 lg:px-6">
      <div className="flex items-center gap-3 rounded-md border bg-muted px-4 py-3">
        <span className="text-sm text-muted-foreground">
          {t.unixCurrentLabel}
        </span>
        <span className="font-mono text-sm font-medium">{now}</span>
        <Button
          size="sm"
          variant="ghost"
          className="h-7 px-2"
          onClick={() => setNow(Math.floor(Date.now() / 1000))}
        >
          <RefreshCw className="size-3" />
        </Button>
        <CopyButton text={String(now)} />
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label className="mb-1">{t.unixToDateLabel}</Label>
          <Input
            className="font-mono"
            placeholder={t.unixTsPlaceholder}
            value={tsInput}
            onChange={(e) => setTsInput(e.target.value)}
          />
          {tsError && <p className="text-xs text-destructive">{tsError}</p>}
        </div>

        {tsDate && (
          <div className="flex flex-col gap-2 rounded-md border bg-muted p-4">
            {[
              { label: t.unixUtcLabel, tz: "UTC" },
              { label: t.unixLocalLabel, tz: localTz }
            ].map(({ label, tz }) => {
              const str = formatDate(tsDate, tz);
              return (
                <div
                  key={tz}
                  className="flex items-center justify-between gap-2"
                >
                  <div>
                    <span className="text-xs text-muted-foreground">
                      {label}:{" "}
                    </span>
                    <span className="font-mono text-sm">{str}</span>
                  </div>
                  <CopyButton text={str} />
                </div>
              );
            })}
            <div className="flex items-center justify-between gap-2">
              <div>
                <span className="text-xs text-muted-foreground">
                  {t.unixIso8601Label}{" "}
                </span>
                <span className="font-mono text-sm">
                  {tsDate.toISOString()}
                </span>
              </div>
              <CopyButton text={tsDate.toISOString()} />
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label className="mb-1">{t.unixDateToTsLabel}</Label>
          <Input
            type="datetime-local"
            className="font-mono"
            value={dateInput}
            onChange={(e) => setDateInput(e.target.value)}
          />
          {dateError && <p className="text-xs text-destructive">{dateError}</p>}
        </div>

        {dateTs !== null && (
          <div className="flex flex-col gap-2 rounded-md border bg-muted p-4">
            <div className="flex items-center justify-between gap-2">
              <div>
                <span className="text-xs text-muted-foreground">
                  {t.unixSecondsLabel}{" "}
                </span>
                <span className="font-mono text-sm">{dateTs}</span>
              </div>
              <CopyButton text={String(dateTs)} />
            </div>
            <div className="flex items-center justify-between gap-2">
              <div>
                <span className="text-xs text-muted-foreground">
                  {t.unixMillisecondsLabel}{" "}
                </span>
                <span className="font-mono text-sm">{dateTs * 1000}</span>
              </div>
              <CopyButton text={String(dateTs * 1000)} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
