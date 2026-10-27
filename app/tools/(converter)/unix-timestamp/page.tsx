"use client";

import { Calendar, Check, Copy, RefreshCw } from "lucide-react";
import { useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLanguage } from "@/contexts/language-context";
import { useToolState } from "@/hooks/use-tool-state";

function formatDate(d: Date, tz: string): string {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-US", {
      timeZone: tz,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hourCycle: "h23"
    })
      .formatToParts(d)
      .map((p) => [p.type, p.value])
  );
  return `${parts.year}-${parts.month}-${parts.day} ${parts.hour}:${parts.minute}:${parts.second} (${tz})`;
}

const pad = (n: number) => String(n).padStart(2, "0");

// Locale-independent "YYYY-MM-DD HH:mm:ss" in local time
function toLocalIso(d: Date): string {
  return (
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ` +
    `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
  );
}

const LOCAL_DATE_RE =
  /^(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{2}):(\d{2})(?::(\d{2}))?)?$/;

// Parses "YYYY-MM-DD[ HH:mm[:ss]]" as local time; falls back to Date parsing
// for full ISO 8601 strings with an offset (e.g. "2024-01-01T00:00:00Z")
function parseLocalDate(input: string): Date | null {
  const m = input.trim().match(LOCAL_DATE_RE);
  if (!m) {
    if (!/^\d{4}-\d{2}-\d{2}T.+(Z|[+-]\d{2}:?\d{2})$/i.test(input.trim()))
      return null;
    const d = new Date(input.trim());
    return isNaN(d.getTime()) ? null : d;
  }
  const [y, mo, da, h, mi, s] = m.slice(1).map((v) => Number(v ?? 0));
  const d = new Date(y, mo - 1, da, h, mi, s);
  const roundTrips =
    d.getFullYear() === y &&
    d.getMonth() === mo - 1 &&
    d.getDate() === da &&
    d.getHours() === h &&
    d.getMinutes() === mi &&
    d.getSeconds() === s;
  return roundTrips ? d : null;
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
    const d = parseLocalDate(dateInput);
    return d ? Math.floor(d.getTime() / 1000) : null;
  })();

  const pickerRef = useRef<HTMLInputElement>(null);
  const openPicker = () => {
    const el = pickerRef.current;
    if (!el) return;
    const current = parseLocalDate(dateInput);
    el.value = current ? toLocalIso(current).replace(" ", "T") : "";
    try {
      el.showPicker();
    } catch {
      el.focus();
    }
  };

  const tsError = tsInput && !tsDate ? t.unixInvalidTimestamp : null;
  const dateError = dateInput && dateTs === null ? t.unixInvalidDate : null;

  const localTz = Intl.DateTimeFormat().resolvedOptions().timeZone;

  return (
    <div className="flex max-w-xl flex-col gap-8 px-4 lg:px-6">
      <div className="bg-muted flex items-center gap-3 rounded-md border px-4 py-3">
        <span className="text-muted-foreground text-sm">
          {t.unixCurrentLabel}
        </span>
        <span
          className="font-mono text-sm font-medium"
          suppressHydrationWarning
        >
          {now}
        </span>
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
          {tsError && <p className="text-destructive text-xs">{tsError}</p>}
        </div>

        {tsDate && (
          <div className="bg-muted flex flex-col gap-2 rounded-md border p-4">
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
                    <span className="text-muted-foreground text-xs">
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
                <span className="text-muted-foreground text-xs">
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
          <div className="relative flex gap-2">
            <Input
              className="font-mono"
              placeholder={t.unixDatePlaceholder}
              value={dateInput}
              onChange={(e) => setDateInput(e.target.value)}
              spellCheck={false}
            />
            <Button
              variant="outline"
              size="icon"
              onClick={openPicker}
              aria-label={t.unixPickDate}
              title={t.unixPickDate}
            >
              <Calendar className="size-4" />
            </Button>
            <Button
              variant="outline"
              onClick={() => setDateInput(toLocalIso(new Date()))}
            >
              {t.unixNow}
            </Button>
            {/* Native picker only supplies the popup; the visible field stays
                locale-independent instead of following the browser's locale */}
            <input
              ref={pickerRef}
              type="datetime-local"
              step={1}
              tabIndex={-1}
              aria-hidden
              className="pointer-events-none absolute right-0 bottom-0 h-0 w-0 opacity-0"
              onChange={(e) => {
                const d = parseLocalDate(e.target.value);
                if (d) setDateInput(toLocalIso(d));
              }}
            />
          </div>
          {dateError && <p className="text-destructive text-xs">{dateError}</p>}
        </div>

        {dateTs !== null && (
          <div className="bg-muted flex flex-col gap-2 rounded-md border p-4">
            <div className="flex items-center justify-between gap-2">
              <div>
                <span className="text-muted-foreground text-xs">
                  {t.unixSecondsLabel}{" "}
                </span>
                <span className="font-mono text-sm">{dateTs}</span>
              </div>
              <CopyButton text={String(dateTs)} />
            </div>
            <div className="flex items-center justify-between gap-2">
              <div>
                <span className="text-muted-foreground text-xs">
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
