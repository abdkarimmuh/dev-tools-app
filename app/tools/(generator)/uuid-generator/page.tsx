"use client"

import { Check, Copy, RefreshCw } from "lucide-react"
import { useState } from "react"

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

type UuidVersion = "v1" | "v4" | "v7"

// UUID v1: time-based + random node
function generateV1(): string {
  const bytes = new Uint8Array(16)
  crypto.getRandomValues(bytes)

  const EPOCH_OFFSET = 122192928000000000n
  const timestamp = BigInt(Date.now()) * 10000n + EPOCH_OFFSET

  const tLow = timestamp & 0xffffffffn
  const tMid = (timestamp >> 32n) & 0xffffn
  const tHi = (timestamp >> 48n) & 0x0fffn

  bytes[0] = Number((tLow >> 24n) & 0xffn)
  bytes[1] = Number((tLow >> 16n) & 0xffn)
  bytes[2] = Number((tLow >> 8n) & 0xffn)
  bytes[3] = Number(tLow & 0xffn)
  bytes[4] = Number((tMid >> 8n) & 0xffn)
  bytes[5] = Number(tMid & 0xffn)
  bytes[6] = (Number(tHi >> 8n) & 0x0f) | 0x10 // version 1
  bytes[7] = Number(tHi & 0xffn)
  bytes[8] = (bytes[8] & 0x3f) | 0x80 // variant 10xx

  const hex = Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`
}

// UUID v4: fully random
function generateV4(): string {
  return crypto.randomUUID()
}

// UUID v7: time-ordered random
function generateV7(): string {
  const bytes = new Uint8Array(16)
  crypto.getRandomValues(bytes)

  const ms = BigInt(Date.now())
  bytes[0] = Number((ms >> 40n) & 0xffn)
  bytes[1] = Number((ms >> 32n) & 0xffn)
  bytes[2] = Number((ms >> 24n) & 0xffn)
  bytes[3] = Number((ms >> 16n) & 0xffn)
  bytes[4] = Number((ms >> 8n) & 0xffn)
  bytes[5] = Number(ms & 0xffn)
  bytes[6] = (bytes[6] & 0x0f) | 0x70 // version 7
  bytes[8] = (bytes[8] & 0x3f) | 0x80 // variant 10xx

  const hex = Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`
}

const VERSION_LABELS: Record<UuidVersion, string> = {
  v1: "v1 — Time-based",
  v4: "v4 — Random",
  v7: "v7 — Time-ordered",
}

const generators: Record<UuidVersion, () => string> = {
  v1: generateV1,
  v4: generateV4,
  v7: generateV7,
}

export default function UuidGeneratorPage() {
  const [version, setVersion] = useState<UuidVersion>("v4")
  const [count, setCount] = useState(1)
  const [uuids, setUuids] = useState<string[]>([])
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)
  const [copiedAll, setCopiedAll] = useState(false)

  const generate = () => {
    setUuids(Array.from({ length: count }, generators[version]))
  }

  const copyOne = async (uuid: string, index: number) => {
    await navigator.clipboard.writeText(uuid)
    setCopiedIndex(index)
    setTimeout(() => setCopiedIndex(null), 1500)
  }

  const copyAll = async () => {
    await navigator.clipboard.writeText(uuids.join("\n"))
    setCopiedAll(true)
    setTimeout(() => setCopiedAll(false), 1500)
  }

  const handleCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value) || 1
    setCount(Math.min(100, Math.max(1, val)))
  }

  return (
    <div className="flex flex-col gap-6 px-4 lg:px-6">
      <div className="flex flex-wrap items-end gap-3">
        <div className="flex flex-col gap-1.5">
          <Label>Versi</Label>
          <Select
            value={version}
            onValueChange={(v) => setVersion(v as UuidVersion)}
          >
            <SelectTrigger className="w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="v1">v1 — Time-based</SelectItem>
              <SelectItem value="v4">v4 — Random</SelectItem>
              <SelectItem value="v7">v7 — Time-ordered</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="count">Jumlah</Label>
          <Input
            id="count"
            type="number"
            min={1}
            max={100}
            value={count}
            onChange={handleCountChange}
            className="w-28"
          />
        </div>
        <Button onClick={generate} className="gap-2">
          <RefreshCw className="size-4" />
          Generate
        </Button>
        {uuids.length > 0 && (
          <Button variant="outline" onClick={copyAll} className="gap-2">
            {copiedAll ? (
              <Check className="size-4" />
            ) : (
              <Copy className="size-4" />
            )}
            {copiedAll ? "Copied!" : "Copy All"}
          </Button>
        )}
      </div>

      {uuids.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="text-xs text-muted-foreground">
            {VERSION_LABELS[version]}
          </p>
          {uuids.map((uuid, i) => (
            <div
              key={i}
              className="flex items-center justify-between rounded-md border bg-muted px-3 py-2"
            >
              <span className="font-mono text-sm">{uuid}</span>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => copyOne(uuid, i)}
                className="ml-4 h-7 gap-1 text-xs"
              >
                {copiedIndex === i ? (
                  <Check className="size-3" />
                ) : (
                  <Copy className="size-3" />
                )}
                {copiedIndex === i ? "Copied!" : "Copy"}
              </Button>
            </div>
          ))}
        </div>
      )}

      {uuids.length === 0 && (
        <div className="flex h-40 items-center justify-center rounded-md border border-dashed text-sm text-muted-foreground">
          Klik Generate untuk membuat UUID
        </div>
      )}
    </div>
  )
}
