"use client"

import { useState } from "react"
import { IconCheck, IconCopy, IconRefresh } from "@tabler/icons-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const CHARSETS = {
  upper: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  lower: "abcdefghijklmnopqrstuvwxyz",
  numbers: "0123456789",
  symbols: "!@#$%^&*()_+-=[]{}|;:,.<>?",
}

function generatePassword(
  length: number,
  opts: { upper: boolean; lower: boolean; numbers: boolean; symbols: boolean }
): string {
  const charset = [
    opts.upper ? CHARSETS.upper : "",
    opts.lower ? CHARSETS.lower : "",
    opts.numbers ? CHARSETS.numbers : "",
    opts.symbols ? CHARSETS.symbols : "",
  ].join("")

  if (!charset) return ""

  const array = new Uint32Array(length)
  crypto.getRandomValues(array)
  return Array.from(array, (n) => charset[n % charset.length]).join("")
}

function getStrength(password: string): { label: string; color: string; width: string } {
  if (!password) return { label: "", color: "", width: "0%" }
  const has = {
    upper: /[A-Z]/.test(password),
    lower: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    symbol: /[^a-zA-Z0-9]/.test(password),
  }
  const score = Object.values(has).filter(Boolean).length + (password.length >= 16 ? 1 : 0)

  if (score <= 2) return { label: "Lemah", color: "bg-red-500", width: "25%" }
  if (score === 3) return { label: "Sedang", color: "bg-yellow-500", width: "50%" }
  if (score === 4) return { label: "Kuat", color: "bg-blue-500", width: "75%" }
  return { label: "Sangat Kuat", color: "bg-green-500", width: "100%" }
}

export default function PasswordGeneratorPage() {
  const [length, setLength] = useState(16)
  const [opts, setOpts] = useState({
    upper: true,
    lower: true,
    numbers: true,
    symbols: false,
  })
  const [password, setPassword] = useState("")
  const [copied, setCopied] = useState(false)

  const generate = () => {
    setPassword(generatePassword(length, opts))
  }

  const copy = async () => {
    await navigator.clipboard.writeText(password)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const handleLengthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value) || 8
    setLength(Math.min(128, Math.max(4, val)))
  }

  const strength = getStrength(password)

  const noneSelected = !opts.upper && !opts.lower && !opts.numbers && !opts.symbols

  return (
    <div className="flex flex-col gap-6 px-4 lg:px-6 max-w-lg">
      <div className="flex flex-col gap-4 rounded-md border p-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="length">Panjang Password: {length}</Label>
          <input
            id="length"
            type="range"
            min={4}
            max={128}
            value={length}
            onChange={(e) => setLength(parseInt(e.target.value))}
            className="w-full accent-primary"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>4</span>
            <span>128</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {(
            [
              { key: "upper", label: "Huruf Besar (A-Z)" },
              { key: "lower", label: "Huruf Kecil (a-z)" },
              { key: "numbers", label: "Angka (0-9)" },
              { key: "symbols", label: "Simbol (!@#$...)" },
            ] as const
          ).map(({ key, label }) => (
            <div key={key} className="flex items-center gap-2">
              <Checkbox
                id={key}
                checked={opts[key]}
                onCheckedChange={(checked) =>
                  setOpts((prev) => ({ ...prev, [key]: !!checked }))
                }
              />
              <Label htmlFor={key} className="cursor-pointer text-sm font-normal">
                {label}
              </Label>
            </div>
          ))}
        </div>

        {noneSelected && (
          <p className="text-xs text-destructive">Pilih minimal satu jenis karakter.</p>
        )}

        <Button onClick={generate} disabled={noneSelected} className="gap-2">
          <IconRefresh className="size-4" />
          Generate Password
        </Button>
      </div>

      {password && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2 rounded-md border bg-muted px-3 py-3">
            <span className="flex-1 break-all font-mono text-sm">{password}</span>
            <Button size="sm" variant="ghost" onClick={copy} className="h-7 shrink-0 gap-1 text-xs">
              {copied ? <IconCheck className="size-3" /> : <IconCopy className="size-3" />}
              {copied ? "Copied!" : "Copy"}
            </Button>
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Kekuatan</span>
              <span className="font-medium">{strength.label}</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <div
                className={`h-full rounded-full transition-all duration-300 ${strength.color}`}
                style={{ width: strength.width }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
