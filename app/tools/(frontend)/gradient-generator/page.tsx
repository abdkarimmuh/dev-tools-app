"use client";

import { Check, Copy, Plus, Trash2 } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { useToolState } from "@/hooks/use-tool-state";

interface ColorStop {
  id: string;
  color: string;
  position: number;
}

type GradientType = "linear" | "radial" | "conic";

function buildCss(
  type: GradientType,
  angle: number,
  stops: ColorStop[]
): string {
  const sorted = [...stops].sort((a, b) => a.position - b.position);
  const stopsStr = sorted.map((s) => `${s.color} ${s.position}%`).join(", ");
  if (type === "linear") return `linear-gradient(${angle}deg, ${stopsStr})`;
  if (type === "radial") return `radial-gradient(circle, ${stopsStr})`;
  return `conic-gradient(from ${angle}deg, ${stopsStr})`;
}

export default function GradientGeneratorPage() {
  const [type, setType] = useToolState<GradientType>(
    "gradient-gen",
    "type",
    "linear"
  );
  const [angle, setAngle] = useToolState("gradient-gen", "angle", 90);
  const [stops, setStops] = useToolState<ColorStop[]>("gradient-gen", "stops", [
    { id: "1", color: "#6366f1", position: 0 },
    { id: "2", color: "#ec4899", position: 100 }
  ]);
  const [copied, setCopied] = useState(false);

  const gradient = buildCss(type, angle, stops);
  const css = `background: ${gradient};`;

  const addStop = () => {
    const mid = Math.round(
      (stops[0]?.position ?? 0 + (stops[stops.length - 1]?.position ?? 100)) / 2
    );
    setStops([
      ...stops,
      { id: String(Date.now()), color: "#a855f7", position: mid }
    ]);
  };

  const updateStop = (
    id: string,
    key: keyof ColorStop,
    value: string | number
  ) => {
    setStops(stops.map((s) => (s.id === id ? { ...s, [key]: value } : s)));
  };

  const removeStop = (id: string) => {
    if (stops.length <= 2) return;
    setStops(stops.filter((s) => s.id !== id));
  };

  const copy = async () => {
    await navigator.clipboard.writeText(css);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="flex max-w-xl flex-col gap-6 px-4 lg:px-6">
      <div
        className="h-40 w-full rounded-md border shadow-sm"
        style={{ background: gradient }}
      />

      <div className="flex items-center gap-2 rounded-md border bg-muted px-3 py-2">
        <code className="flex-1 font-mono text-sm break-all">{css}</code>
        <Button
          size="sm"
          variant="ghost"
          onClick={copy}
          className="shrink-0 gap-1 text-xs"
        >
          {copied ? <Check className="size-3" /> : <Copy className="size-3" />}
          {copied ? "Copied!" : "Copy"}
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center gap-3">
          <Label htmlFor="gradient-type">Type</Label>
          <Select
            value={type}
            onValueChange={(v) => setType(v as GradientType)}
          >
            <SelectTrigger id="gradient-type">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="linear">Linear</SelectItem>
              <SelectItem value="radial">Radial</SelectItem>
              <SelectItem value="conic">Conic</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {type !== "radial" && (
          <div className="flex flex-col gap-1.5">
            <Label>Angle: {angle}°</Label>
            <input
              type="range"
              min={0}
              max={360}
              value={angle}
              onChange={(e) => setAngle(Number(e.target.value))}
              className="w-full accent-primary"
            />
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <Label>Color Stops</Label>
          <Button
            size="sm"
            variant="outline"
            onClick={addStop}
            className="gap-1 text-xs"
          >
            <Plus className="size-3" />
            Add Stop
          </Button>
        </div>
        {[...stops]
          .sort((a, b) => a.position - b.position)
          .map((stop) => (
            <div key={stop.id} className="flex items-center gap-3">
              <input
                type="color"
                value={stop.color}
                onChange={(e) => updateStop(stop.id, "color", e.target.value)}
                className="h-9 w-10 cursor-pointer rounded border bg-transparent p-0.5"
              />
              <Input
                className="w-24 font-mono text-sm"
                value={stop.color}
                onChange={(e) => updateStop(stop.id, "color", e.target.value)}
              />
              <div className="flex flex-1 items-center gap-2">
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={stop.position}
                  onChange={(e) =>
                    updateStop(stop.id, "position", Number(e.target.value))
                  }
                  className="flex-1 accent-primary"
                />
                <span className="w-10 text-right font-mono text-xs text-muted-foreground">
                  {stop.position}%
                </span>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => removeStop(stop.id)}
                disabled={stops.length <= 2}
                className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="size-3" />
              </Button>
            </div>
          ))}
      </div>
    </div>
  );
}
