"use client"

import { Check, Copy } from "lucide-react"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useLanguage } from "@/contexts/language-context"
import { useToolState } from "@/hooks/use-tool-state"

const COMMON_PX = [
  8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 40, 48, 56, 64, 72, 80, 96,
]

function round(n: number, decimals = 4): number {
  return Math.round(n * 10 ** decimals) / 10 ** decimals
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }
  return (
    <Button size="sm" variant="ghost" onClick={copy} className="h-6 w-6 p-0">
      {copied ? <Check className="size-3" /> : <Copy className="size-3" />}
    </Button>
  )
}

export default function PxRemPage() {
  const { t } = useLanguage()
  const [base, setBase] = useToolState("px-rem", "base", 16)
  const [pxInput, setPxInput] = useToolState("px-rem", "px", "")
  const [remInput, setRemInput] = useToolState("px-rem", "rem", "")

  const pxToRem = (px: string) => {
    const val = parseFloat(px)
    if (isNaN(val)) return ""
    return String(round(val / base))
  }

  const remToPx = (rem: string) => {
    const val = parseFloat(rem)
    if (isNaN(val)) return ""
    return String(round(val * base))
  }

  const handlePxChange = (v: string) => {
    setPxInput(v)
    setRemInput(pxToRem(v))
  }

  const handleRemChange = (v: string) => {
    setRemInput(v)
    setPxInput(remToPx(v))
  }

  const handleBaseChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value) || 16
    setBase(Math.max(1, val))
    if (pxInput)
      setRemInput(String(round(parseFloat(pxInput) / Math.max(1, val))))
  }

  return (
    <div className="flex max-w-2xl flex-col gap-8 px-4 lg:px-6">
      <div className="flex items-end gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="base">Base Font Size (px)</Label>
          <Input
            id="base"
            type="number"
            min={1}
            value={base}
            onChange={handleBaseChange}
            className="w-28"
          />
        </div>
        <p className="mb-2 text-sm text-muted-foreground">1rem = {base}px</p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label>PX</Label>
          <div className="flex gap-2">
            <Input
              type="number"
              placeholder="16"
              value={pxInput}
              onChange={(e) => handlePxChange(e.target.value)}
              className="font-mono"
            />
            <span className="flex items-center text-sm text-muted-foreground">
              px
            </span>
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>REM</Label>
          <div className="flex gap-2">
            <Input
              type="number"
              placeholder="1"
              value={remInput}
              onChange={(e) => handleRemChange(e.target.value)}
              className="font-mono"
            />
            <span className="flex items-center text-sm text-muted-foreground">
              rem
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <h3 className="text-sm font-medium">
          {t.pxRemReferenceTable} (base {base}px)
        </h3>
        <div className="overflow-hidden rounded-md border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50 text-left text-xs text-muted-foreground">
                <th className="px-4 py-2">PX</th>
                <th className="px-4 py-2">REM</th>
                <th className="w-10 px-4 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {COMMON_PX.map((px) => {
                const rem = round(px / base)
                const remStr = `${rem}rem`
                return (
                  <tr
                    key={px}
                    className="border-b last:border-b-0 hover:bg-muted/30"
                  >
                    <td className="px-4 py-2 font-mono">{px}px</td>
                    <td className="px-4 py-2 font-mono">{remStr}</td>
                    <td className="px-2 py-2">
                      <CopyButton text={remStr} />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
