"use client"

import { useState } from "react"
import { Check, Copy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

// --- Conversion utils ---

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const clean = hex.replace("#", "")
  const full = clean.length === 3
    ? clean.split("").map((c) => c + c).join("")
    : clean
  if (!/^[0-9a-f]{6}$/i.test(full)) return null
  return {
    r: parseInt(full.slice(0, 2), 16),
    g: parseInt(full.slice(2, 4), 16),
    b: parseInt(full.slice(4, 6), 16),
  }
}

function rgbToHex(r: number, g: number, b: number): string {
  return "#" + [r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("")
}

function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  const rn = r / 255, gn = g / 255, bn = b / 255
  const max = Math.max(rn, gn, bn), min = Math.min(rn, gn, bn)
  const l = (max + min) / 2
  if (max === min) return { h: 0, s: 0, l: Math.round(l * 100) }

  const d = max - min
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
  let h = 0
  switch (max) {
    case rn: h = ((gn - bn) / d + (gn < bn ? 6 : 0)) / 6; break
    case gn: h = ((bn - rn) / d + 2) / 6; break
    case bn: h = ((rn - gn) / d + 4) / 6; break
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) }
}

function hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number } {
  const sn = s / 100, ln = l / 100
  const k = (n: number) => (n + h / 30) % 12
  const a = sn * Math.min(ln, 1 - ln)
  const f = (n: number) => ln - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)))
  return {
    r: Math.round(f(0) * 255),
    g: Math.round(f(8) * 255),
    b: Math.round(f(4) * 255),
  }
}

interface Color {
  hex: string
  r: number
  g: number
  b: number
  h: number
  s: number
  l: number
}

function fromHex(hex: string): Color | null {
  const rgb = hexToRgb(hex)
  if (!rgb) return null
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b)
  return { hex: rgbToHex(rgb.r, rgb.g, rgb.b), ...rgb, ...hsl }
}

function fromRgb(r: number, g: number, b: number): Color {
  const hsl = rgbToHsl(r, g, b)
  return { hex: rgbToHex(r, g, b), r, g, b, ...hsl }
}

function fromHsl(h: number, s: number, l: number): Color {
  const rgb = hslToRgb(h, s, l)
  return { hex: rgbToHex(rgb.r, rgb.g, rgb.b), ...rgb, h, s, l }
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }
  return (
    <Button size="sm" variant="ghost" onClick={copy} className="h-7 gap-1 px-2 text-xs">
      {copied ? <Check className="size-3" /> : <Copy className="size-3" />}
    </Button>
  )
}

export default function ColorConverterPage() {
  const [color, setColor] = useState<Color | null>(null)
  const [hexInput, setHexInput] = useState("")
  const [rgbInput, setRgbInput] = useState({ r: "", g: "", b: "" })
  const [hslInput, setHslInput] = useState({ h: "", s: "", l: "" })
  const [activeInput, setActiveInput] = useState<"hex" | "rgb" | "hsl" | null>(null)

  const applyHex = (value: string) => {
    setHexInput(value)
    const parsed = fromHex(value)
    if (parsed) {
      setColor(parsed)
      if (activeInput === "hex") {
        setRgbInput({ r: String(parsed.r), g: String(parsed.g), b: String(parsed.b) })
        setHslInput({ h: String(parsed.h), s: String(parsed.s), l: String(parsed.l) })
      }
    }
  }

  const applyRgb = () => {
    const r = parseInt(rgbInput.r), g = parseInt(rgbInput.g), b = parseInt(rgbInput.b)
    if ([r, g, b].some((v) => isNaN(v) || v < 0 || v > 255)) return
    const parsed = fromRgb(r, g, b)
    setColor(parsed)
    setHexInput(parsed.hex)
    setHslInput({ h: String(parsed.h), s: String(parsed.s), l: String(parsed.l) })
  }

  const applyHsl = () => {
    const h = parseInt(hslInput.h), s = parseInt(hslInput.s), l = parseInt(hslInput.l)
    if (isNaN(h) || h < 0 || h > 360) return
    if (isNaN(s) || s < 0 || s > 100) return
    if (isNaN(l) || l < 0 || l > 100) return
    const parsed = fromHsl(h, s, l)
    setColor(parsed)
    setHexInput(parsed.hex)
    setRgbInput({ r: String(parsed.r), g: String(parsed.g), b: String(parsed.b) })
  }

  return (
    <div className="flex flex-col gap-6 px-4 lg:px-6 max-w-lg">
      {color && (
        <div
          className="h-20 w-full rounded-md border shadow-sm"
          style={{ backgroundColor: color.hex }}
        />
      )}

      {/* HEX */}
      <div className="flex flex-col gap-1.5">
        <Label>HEX</Label>
        <div className="flex gap-2">
          <Input
            className="font-mono"
            placeholder="#3b82f6"
            value={hexInput}
            onFocus={() => setActiveInput("hex")}
            onChange={(e) => applyHex(e.target.value)}
          />
          {color && <CopyButton text={color.hex} />}
        </div>
      </div>

      {/* RGB */}
      <div className="flex flex-col gap-1.5">
        <Label>RGB</Label>
        <div className="flex items-center gap-2">
          {(["r", "g", "b"] as const).map((ch) => (
            <div key={ch} className="flex flex-1 flex-col gap-1">
              <span className="text-center text-xs text-muted-foreground uppercase">{ch}</span>
              <Input
                type="number"
                min={0}
                max={255}
                className="font-mono text-center"
                value={rgbInput[ch]}
                onFocus={() => setActiveInput("rgb")}
                onChange={(e) => setRgbInput((p) => ({ ...p, [ch]: e.target.value }))}
                onBlur={applyRgb}
              />
            </div>
          ))}
          {color && <CopyButton text={`rgb(${color.r}, ${color.g}, ${color.b})`} />}
        </div>
        {color && (
          <p className="font-mono text-xs text-muted-foreground">
            rgb({color.r}, {color.g}, {color.b})
          </p>
        )}
      </div>

      {/* HSL */}
      <div className="flex flex-col gap-1.5">
        <Label>HSL</Label>
        <div className="flex items-center gap-2">
          {(
            [
              { key: "h", label: "H", max: 360 },
              { key: "s", label: "S", max: 100 },
              { key: "l", label: "L", max: 100 },
            ] as const
          ).map(({ key, label, max }) => (
            <div key={key} className="flex flex-1 flex-col gap-1">
              <span className="text-center text-xs text-muted-foreground">{label}</span>
              <Input
                type="number"
                min={0}
                max={max}
                className="font-mono text-center"
                value={hslInput[key]}
                onFocus={() => setActiveInput("hsl")}
                onChange={(e) => setHslInput((p) => ({ ...p, [key]: e.target.value }))}
                onBlur={applyHsl}
              />
            </div>
          ))}
          {color && <CopyButton text={`hsl(${color.h}, ${color.s}%, ${color.l}%)`} />}
        </div>
        {color && (
          <p className="font-mono text-xs text-muted-foreground">
            hsl({color.h}, {color.s}%, {color.l}%)
          </p>
        )}
      </div>

      {/* Native color picker */}
      <div className="flex items-center gap-3">
        <Label>Color Picker</Label>
        <input
          type="color"
          value={color?.hex ?? "#000000"}
          onChange={(e) => {
            setActiveInput("hex")
            applyHex(e.target.value)
            const parsed = fromHex(e.target.value)
            if (parsed) {
              setRgbInput({ r: String(parsed.r), g: String(parsed.g), b: String(parsed.b) })
              setHslInput({ h: String(parsed.h), s: String(parsed.s), l: String(parsed.l) })
            }
          }}
          className="h-9 w-16 cursor-pointer rounded-md border bg-transparent p-1"
        />
        <span className="text-xs text-muted-foreground">Klik untuk pilih warna</span>
      </div>
    </div>
  )
}
