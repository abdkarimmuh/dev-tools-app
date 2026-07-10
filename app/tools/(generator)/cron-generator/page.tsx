"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  type CronField,
  FIELDS,
  PRESETS
} from "@/constants/generators/cron-generator";
import { useLanguage } from "@/contexts/language-context";
import { useToolState } from "@/hooks/use-tool-state";
import type { Translations } from "@/lib/i18n";

interface CronUnits {
  invalid: string;
  everyMinute: string;
  runsAt: string;
  every: string;
  minute: string;
  hour: string;
  day: string;
  month: string;
  weekday: string;
}

function describeCron(expr: string, u: CronUnits): string {
  const parts = expr.trim().split(/\s+/);
  if (parts.length !== 5) return u.invalid;
  const [min, hour, day, month, weekday] = parts;

  const describeField = (
    val: string,
    unit: string,
    names?: string[]
  ): string => {
    if (val === "*") return `${u.every} ${unit}`;
    if (val.startsWith("*/")) return `${u.every} ${val.slice(2)} ${unit}`;
    if (val.includes("-")) {
      const [a, b] = val.split("-");
      const na = names ? (names[Number(a)] ?? a) : a;
      const nb = names ? (names[Number(b)] ?? b) : b;
      return `${unit} ${na}–${nb}`;
    }
    if (val.includes(",")) {
      const parts = val
        .split(",")
        .map((v) => (names ? (names[Number(v)] ?? v) : v));
      return `${unit} ${parts.join(", ")}`;
    }
    const name = names ? (names[Number(val)] ?? val) : val;
    return `${unit} ${name}`;
  };

  const parts_desc = [
    min === "*" ? null : describeField(min, u.minute),
    hour === "*" ? null : describeField(hour, u.hour),
    day === "*" ? null : describeField(day, u.day),
    month === "*"
      ? null
      : describeField(month, u.month, [
          "",
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "May",
          "Jun",
          "Jul",
          "Aug",
          "Sep",
          "Oct",
          "Nov",
          "Dec"
        ]),
    weekday === "*"
      ? null
      : describeField(weekday, u.weekday, [
          "Sun",
          "Mon",
          "Tue",
          "Wed",
          "Thu",
          "Fri",
          "Sat"
        ])
  ].filter(Boolean);

  if (parts_desc.length === 0) return u.everyMinute;
  return u.runsAt + " " + parts_desc.join(", ");
}

type FieldValues = Record<CronField["key"], string>;

function fieldsToExpr(fields: FieldValues): string {
  return `${fields.minute} ${fields.hour} ${fields.day} ${fields.month} ${fields.weekday}`;
}

function exprToFields(expr: string): FieldValues | null {
  const parts = expr.trim().split(/\s+/);
  if (parts.length !== 5) return null;
  return {
    minute: parts[0],
    hour: parts[1],
    day: parts[2],
    month: parts[3],
    weekday: parts[4]
  };
}

export default function CronGeneratorPage() {
  const { t } = useLanguage();
  const cronUnits: CronUnits = {
    invalid: t.cronInvalidExpr,
    everyMinute: t.cronEveryMinute,
    runsAt: t.cronRunsAt,
    every: t.cronEveryUnit,
    minute: t.cronUnitMinute,
    hour: t.cronUnitHour,
    day: t.cronUnitDay,
    month: t.cronUnitMonth,
    weekday: t.cronUnitWeekday
  };
  const FIELD_LABELS: Record<CronField["key"], string> = {
    minute: t.cronFieldMinute,
    hour: t.cronFieldHour,
    day: t.cronFieldDayOfMonth,
    month: t.cronFieldMonth,
    weekday: t.cronFieldDayOfWeek
  };
  const PRESET_LABELS: Record<string, keyof Translations> = {
    "* * * * *": "cronPresetEveryMinute",
    "0 * * * *": "cronPresetEveryHour",
    "0 0 * * *": "cronPresetDailyMidnight",
    "0 12 * * *": "cronPresetDailyNoon",
    "0 0 * * 0": "cronPresetWeeklySunday",
    "0 9 * * 1": "cronPresetMondayNine",
    "0 0 1 * *": "cronPresetFirstOfMonth",
    "*/15 * * * *": "cronPreset15Min",
    "0 */6 * * *": "cronPreset6Hours",
    "0 9 * * 1-5": "cronPresetWeekdaysNine"
  };
  const [fields, setFields] = useToolState<FieldValues>(
    "cron-generator",
    "fields",
    {
      minute: "*",
      hour: "*",
      day: "*",
      month: "*",
      weekday: "*"
    }
  );
  const [rawExpr, setRawExpr] = useToolState(
    "cron-generator",
    "rawExpr",
    "* * * * *"
  );
  const [copied, setCopied] = useState(false);

  const expr = fieldsToExpr(fields);

  const updateField = (key: CronField["key"], value: string) => {
    const next = { ...fields, [key]: value || "*" };
    setFields(next);
    setRawExpr(fieldsToExpr(next));
  };

  const applyRaw = (value: string) => {
    setRawExpr(value);
    const parsed = exprToFields(value);
    if (parsed) setFields(parsed);
  };

  const applyPreset = (value: string) => {
    applyRaw(value);
  };

  const copy = async () => {
    await navigator.clipboard.writeText(expr);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="flex max-w-2xl flex-col gap-6 px-4 lg:px-6">
      <div className="flex flex-col gap-2">
        <Label className="mb-1">{t.cronExpressionLabel}</Label>
        <div className="flex items-center gap-2">
          <Input
            className="font-mono text-base"
            value={rawExpr}
            onChange={(e) => applyRaw(e.target.value)}
            spellCheck={false}
          />
          <Button variant="outline" onClick={copy} className="shrink-0 gap-2">
            {copied ? (
              <Check className="size-4" />
            ) : (
              <Copy className="size-4" />
            )}
            {copied ? t.copied : t.copy}
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          {describeCron(expr, cronUnits)}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
        {FIELDS.map(({ key, min, max }) => (
          <div key={key} className="flex flex-col gap-1.5">
            <Label className="mb-1 text-xs">{FIELD_LABELS[key]}</Label>
            <Input
              className="text-center font-mono text-sm"
              value={fields[key]}
              onChange={(e) => updateField(key, e.target.value)}
              placeholder="*"
              spellCheck={false}
            />
            <p className="text-center text-xs text-muted-foreground">
              {min}–{max}
            </p>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-2">
        <Label className="mb-1">{t.cronPresetsLabel}</Label>
        <div className="flex flex-wrap gap-3">
          {PRESETS.map(({ label, value }) => (
            <Button
              key={value}
              size="sm"
              variant={expr === value ? "default" : "outline"}
              onClick={() => applyPreset(value)}
              className="text-xs"
            >
              {PRESET_LABELS[value] ? t[PRESET_LABELS[value]] : label}
            </Button>
          ))}
        </div>
      </div>

      <div className="rounded-md border bg-muted p-4">
        <p className="mb-2 text-xs text-muted-foreground">{t.format}</p>
        <div className="grid grid-cols-5 gap-1 text-center font-mono text-xs">
          {(
            ["minute", "hour", "day", "month", "weekday"] as CronField["key"][]
          ).map((f) => (
            <div key={f} className="flex flex-col gap-1">
              <span className="font-medium">{fields[f]}</span>
              <span className="text-muted-foreground capitalize">
                {cronUnits[f]}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
