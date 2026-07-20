"use client";

import { Check, Copy, Plus, Trash2 } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLanguage } from "@/contexts/language-context";
import { useToolState } from "@/hooks/use-tool-state";

interface Shadow {
  id: string;
  x: number;
  y: number;
  blur: number;
  spread: number;
  color: string;
  inset: boolean;
}

function shadowToCss(s: Shadow): string {
  return `${s.inset ? "inset " : ""}${s.x}px ${s.y}px ${s.blur}px ${s.spread}px ${s.color}`;
}

function SliderField({
  label,
  value,
  min,
  max,
  onChange
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-mono">{value}px</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="accent-primary w-full"
      />
    </div>
  );
}

export default function BoxShadowGeneratorPage() {
  const { t } = useLanguage();
  const [shadows, setShadows] = useToolState<Shadow[]>(
    "box-shadow-gen",
    "shadows",
    [
      {
        id: "1",
        x: 0,
        y: 4,
        blur: 6,
        spread: -1,
        color: "rgba(0,0,0,0.1)",
        inset: false
      }
    ]
  );
  const [selected, setSelected] = useToolState(
    "box-shadow-gen",
    "selected",
    "1"
  );
  const [copied, setCopied] = useState(false);

  const cssValue = shadows.map(shadowToCss).join(", ");
  const css = `box-shadow: ${cssValue};`;

  const shadow = shadows.find((s) => s.id === selected) ?? shadows[0];

  const update = (key: keyof Shadow, value: number | string | boolean) => {
    setShadows(
      shadows.map((s) => (s.id === selected ? { ...s, [key]: value } : s))
    );
  };

  const addShadow = () => {
    const newShadow: Shadow = {
      id: String(Date.now()),
      x: 2,
      y: 4,
      blur: 8,
      spread: 0,
      color: "rgba(0,0,0,0.15)",
      inset: false
    };
    setShadows([...shadows, newShadow]);
    setSelected(newShadow.id);
  };

  const removeShadow = (id: string) => {
    const next = shadows.filter((s) => s.id !== id);
    if (next.length === 0) return;
    setShadows(next);
    if (selected === id) setSelected(next[0].id);
  };

  const copy = async () => {
    await navigator.clipboard.writeText(css);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="flex max-w-xl flex-col gap-6 px-4 lg:px-6">
      <div className="bg-muted flex h-40 items-center justify-center rounded-md border">
        <div
          className="bg-background h-20 w-32 rounded-md"
          style={{ boxShadow: cssValue || "none" }}
        />
      </div>

      <div className="bg-muted flex items-center gap-2 rounded-md border px-3 py-2">
        <code className="flex-1 font-mono text-sm break-all">{css}</code>
        <Button
          size="sm"
          variant="ghost"
          onClick={copy}
          className="shrink-0 gap-1 text-xs"
        >
          {copied ? <Check className="size-3" /> : <Copy className="size-3" />}
          {copied ? t.copied : t.copy}
        </Button>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <Label>{t.boxShadowLabel}</Label>
          <Button
            size="sm"
            variant="outline"
            onClick={addShadow}
            className="gap-1 text-xs"
          >
            <Plus className="size-3" />
            {t.boxShadowAdd}
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {shadows.map((s, i) => (
            <div key={s.id} className="flex items-center gap-1">
              <Button
                size="sm"
                variant={s.id === selected ? "default" : "outline"}
                onClick={() => setSelected(s.id)}
                className="h-7 text-xs"
              >
                {t.boxShadowItem} {i + 1}
              </Button>
              {shadows.length > 1 && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => removeShadow(s.id)}
                  className="text-muted-foreground hover:text-destructive h-7 w-7 p-0"
                >
                  <Trash2 className="size-3" />
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>

      {shadow && (
        <div className="flex flex-col gap-4 rounded-md border p-4">
          <SliderField
            label={t.boxShadowXOffset}
            value={shadow.x}
            min={-50}
            max={50}
            onChange={(v) => update("x", v)}
          />
          <SliderField
            label={t.boxShadowYOffset}
            value={shadow.y}
            min={-50}
            max={50}
            onChange={(v) => update("y", v)}
          />
          <SliderField
            label={t.boxShadowBlur}
            value={shadow.blur}
            min={0}
            max={100}
            onChange={(v) => update("blur", v)}
          />
          <SliderField
            label={t.boxShadowSpread}
            value={shadow.spread}
            min={-50}
            max={50}
            onChange={(v) => update("spread", v)}
          />

          <div className="flex items-center gap-3">
            <div className="flex flex-1 flex-col gap-1.5">
              <Label className="text-xs">{t.boxShadowColorLabel}</Label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={
                    shadow.color.startsWith("rgba") ? "#000000" : shadow.color
                  }
                  onChange={(e) => update("color", e.target.value)}
                  className="h-8 w-10 cursor-pointer rounded border bg-transparent p-0.5"
                />
                <Input
                  className="font-mono text-sm"
                  value={shadow.color}
                  onChange={(e) => update("color", e.target.value)}
                />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs">{t.boxShadowInsetLabel}</Label>
              <Button
                size="sm"
                variant={shadow.inset ? "default" : "outline"}
                onClick={() => update("inset", !shadow.inset)}
                className="h-8"
              >
                {shadow.inset ? t.boxShadowOn : t.boxShadowOff}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
