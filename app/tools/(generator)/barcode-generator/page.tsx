"use client"

import JsBarcode from "jsbarcode"
import { Download } from "lucide-react"
import { useRef, useState } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useLanguage } from "@/contexts/language-context"
import { useToolState } from "@/hooks/use-tool-state"

type BarcodeFormat =
  | "CODE128"
  | "EAN13"
  | "EAN8"
  | "UPC"
  | "CODE39"
  | "ITF14"
  | "MSI"
  | "pharmacode"

const FORMATS: { value: BarcodeFormat; label: string; hint: string }[] = [
  { value: "CODE128", label: "CODE128", hint: "Any text/numbers" },
  { value: "EAN13", label: "EAN-13", hint: "12 digits" },
  { value: "EAN8", label: "EAN-8", hint: "7 digits" },
  { value: "UPC", label: "UPC-A", hint: "11 digits" },
  { value: "CODE39", label: "CODE39", hint: "0-9 A-Z - . $ / + %" },
  { value: "ITF14", label: "ITF-14", hint: "13 digits" },
  { value: "MSI", label: "MSI", hint: "Numbers only" },
  { value: "pharmacode", label: "Pharmacode", hint: "3–131070" },
]

export default function BarcodeGeneratorPage() {
  const { t } = useLanguage()
  const [value, setValue] = useToolState("barcode-generator", "value", "")
  const [format, setFormat] = useToolState<BarcodeFormat>(
    "barcode-generator",
    "format",
    "CODE128"
  )
  const svgRef = useRef<SVGSVGElement>(null)
  const [hasOutput, setHasOutput] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const currentFormat = FORMATS.find((f) => f.value === format)!

  const generate = () => {
    if (!value.trim() || !svgRef.current) return
    try {
      JsBarcode(svgRef.current, value, {
        format,
        lineColor: "currentColor",
        background: "transparent",
        displayValue: true,
        fontSize: 14,
        margin: 10,
      })
      setHasOutput(true)
      setError(null)
    } catch (e) {
      setError((e as Error).message)
      setHasOutput(false)
    }
  }

  const download = () => {
    if (!svgRef.current) return
    const svgData = new XMLSerializer().serializeToString(svgRef.current)
    const blob = new Blob([svgData], { type: "image/svg+xml" })
    const link = document.createElement("a")
    link.download = "barcode.svg"
    link.href = URL.createObjectURL(blob)
    link.click()
    URL.revokeObjectURL(link.href)
  }

  const clear = () => {
    setValue("")
    setHasOutput(false)
    setError(null)
  }

  return (
    <div className="flex flex-col gap-6 px-4 lg:px-6">
      <div className="flex max-w-xl flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label>{t.barcodeFormat}</Label>
          <Select
            value={format}
            onValueChange={(v) => {
              setFormat(v as BarcodeFormat)
              setHasOutput(false)
              setError(null)
            }}
          >
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {FORMATS.map((f) => (
                <SelectItem key={f.value} value={f.value}>
                  {f.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label>
            {t.barcodeValue}
            <span className="ml-2 text-xs text-muted-foreground">
              ({currentFormat.hint})
            </span>
          </Label>
          <Input
            placeholder={t.barcodeInputPlaceholder}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && generate()}
          />
        </div>

        <div className="flex gap-3">
          <Button size="lg" onClick={generate} disabled={!value.trim()}>
            {t.generate}
          </Button>
          <Button size="lg" variant="ghost" onClick={clear}>
            {t.clear}
          </Button>
        </div>
      </div>

      {error && (
        <div className="max-w-xl rounded-md border border-destructive bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="flex flex-col gap-3">
        <div className={`w-fit rounded-md border p-4 ${hasOutput ? "" : "hidden"}`}>
          <svg ref={svgRef} />
        </div>
        {hasOutput && (
          <Button variant="secondary" className="w-fit" onClick={download}>
            <Download className="mr-2 size-4" />
            {t.barcodeDownload}
          </Button>
        )}
      </div>
    </div>
  )
}
