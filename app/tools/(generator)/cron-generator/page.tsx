"use client"

import { Check, Copy } from "lucide-react"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  type CronField,
  FIELDS,
  PRESETS,
} from "@/constants/generators/cron-generator"
import { useToolState } from "@/hooks/use-tool-state"

function describeCron(expr: string): string {
  const parts = expr.trim().split(/\s+/)
  if (parts.length !== 5) return "Invalid cron expression"
  const [min, hour, day, month, weekday] = parts

  const describeField = (
    val: string,
    unit: string,
    names?: string[]
  ): string => {
    if (val === "*") return `every ${unit}`
    if (val.startsWith("*/")) return `every ${val.slice(2)} ${unit}s`
    if (val.includes("-")) {
      const [a, b] = val.split("-")
      const na = names ? (names[Number(a)] ?? a) : a
      const nb = names ? (names[Number(b)] ?? b) : b
      return `${unit} ${na}–${nb}`
    }
    if (val.includes(",")) {
      const parts = val
        .split(",")
        .map((v) => (names ? (names[Number(v)] ?? v) : v))
      return `${unit}s ${parts.join(", ")}`
    }
    const name = names ? (names[Number(val)] ?? val) : val
    return `${unit} ${name}`
  }

  const parts_desc = [
    min === "*" ? null : describeField(min, "minute"),
    hour === "*" ? null : describeField(hour, "hour"),
    day === "*" ? null : describeField(day, "day"),
    month === "*"
      ? null
      : describeField(month, "month", [
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
          "Dec",
        ]),
    weekday === "*"
      ? null
      : describeField(weekday, "weekday", [
          "Sun",
          "Mon",
          "Tue",
          "Wed",
          "Thu",
          "Fri",
          "Sat",
        ]),
  ].filter(Boolean)

  if (parts_desc.length === 0) return "Every minute"
  return "Runs at " + parts_desc.join(", ")
}

type FieldValues = Record<CronField["key"], string>

function fieldsToExpr(fields: FieldValues): string {
  return `${fields.minute} ${fields.hour} ${fields.day} ${fields.month} ${fields.weekday}`
}

function exprToFields(expr: string): FieldValues | null {
  const parts = expr.trim().split(/\s+/)
  if (parts.length !== 5) return null
  return {
    minute: parts[0],
    hour: parts[1],
    day: parts[2],
    month: parts[3],
    weekday: parts[4],
  }
}

export default function CronGeneratorPage() {
  const [fields, setFields] = useToolState<FieldValues>(
    "cron-generator",
    "fields",
    {
      minute: "*",
      hour: "*",
      day: "*",
      month: "*",
      weekday: "*",
    }
  )
  const [rawExpr, setRawExpr] = useToolState(
    "cron-generator",
    "rawExpr",
    "* * * * *"
  )
  const [copied, setCopied] = useState(false)

  const expr = fieldsToExpr(fields)

  const updateField = (key: CronField["key"], value: string) => {
    const next = { ...fields, [key]: value || "*" }
    setFields(next)
    setRawExpr(fieldsToExpr(next))
  }

  const applyRaw = (value: string) => {
    setRawExpr(value)
    const parsed = exprToFields(value)
    if (parsed) setFields(parsed)
  }

  const applyPreset = (value: string) => {
    applyRaw(value)
  }

  const copy = async () => {
    await navigator.clipboard.writeText(expr)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="flex max-w-2xl flex-col gap-6 px-4 lg:px-6">
      <div className="flex flex-col gap-2">
        <Label className="mb-1">Cron Expression</Label>
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
            {copied ? "Copied!" : "Copy"}
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">{describeCron(expr)}</p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
        {FIELDS.map(({ key, label, min, max }) => (
          <div key={key} className="flex flex-col gap-1.5">
            <Label className="mb-1 text-xs">{label}</Label>
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
        <Label className="mb-1">Presets</Label>
        <div className="flex flex-wrap gap-3">
          {PRESETS.map(({ label, value }) => (
            <Button
              key={value}
              size="sm"
              variant={expr === value ? "default" : "outline"}
              onClick={() => applyPreset(value)}
              className="text-xs"
            >
              {label}
            </Button>
          ))}
        </div>
      </div>

      <div className="rounded-md border bg-muted p-4">
        <p className="mb-2 text-xs text-muted-foreground">Format</p>
        <div className="grid grid-cols-5 gap-1 text-center font-mono text-xs">
          {["minute", "hour", "day", "month", "weekday"].map((f) => (
            <div key={f} className="flex flex-col gap-1">
              <span className="font-medium">
                {fields[f as CronField["key"]]}
              </span>
              <span className="text-muted-foreground capitalize">{f}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
