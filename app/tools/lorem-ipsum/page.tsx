"use client"

import { useState } from "react"
import { IconCheck, IconCopy, IconRefresh } from "@tabler/icons-react"
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

const WORDS = [
  "lorem","ipsum","dolor","sit","amet","consectetur","adipiscing","elit",
  "sed","do","eiusmod","tempor","incididunt","ut","labore","et","dolore",
  "magna","aliqua","enim","ad","minim","veniam","quis","nostrud","exercitation",
  "ullamco","laboris","nisi","aliquip","ex","ea","commodo","consequat","duis",
  "aute","irure","in","reprehenderit","voluptate","velit","esse","cillum",
  "eu","fugiat","nulla","pariatur","excepteur","sint","occaecat","cupidatat",
  "non","proident","sunt","culpa","qui","officia","deserunt","mollit","anim",
  "id","est","laborum","pellentesque","habitant","morbi","tristique","senectus",
  "netus","malesuada","fames","turpis","egestas","volutpat","lacus","laoreet",
  "non","curabitur","gravida","arcu","ac","tortor","dignissim","convallis",
  "aenean","et","tortor","at","risus","viverra","adipiscing","at","in",
  "tellus","integer","feugiat","scelerisque","varius","morbi","enim","nunc",
  "faucibus","a","pellentesque","sit","amet","porttitor","eget","dolor"
]

function randomWord(): string {
  return WORDS[Math.floor(Math.random() * WORDS.length)]
}

function generateWords(count: number): string {
  return Array.from({ length: count }, randomWord).join(" ")
}

function generateSentence(): string {
  const len = 8 + Math.floor(Math.random() * 10)
  const words = Array.from({ length: len }, randomWord)
  words[0] = words[0].charAt(0).toUpperCase() + words[0].slice(1)
  return words.join(" ") + "."
}

function generateParagraph(): string {
  const count = 4 + Math.floor(Math.random() * 4)
  return Array.from({ length: count }, generateSentence).join(" ")
}

type Unit = "words" | "sentences" | "paragraphs"

export default function LoremIpsumPage() {
  const [unit, setUnit] = useState<Unit>("paragraphs")
  const [count, setCount] = useState(3)
  const [output, setOutput] = useState("")
  const [copied, setCopied] = useState(false)

  const generate = () => {
    let result = ""
    if (unit === "words") {
      result = generateWords(count)
    } else if (unit === "sentences") {
      result = Array.from({ length: count }, generateSentence).join(" ")
    } else {
      result = Array.from({ length: count }, generateParagraph).join("\n\n")
    }
    setOutput(result)
  }

  const copy = async () => {
    await navigator.clipboard.writeText(output)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const handleCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value) || 1
    setCount(Math.min(100, Math.max(1, val)))
  }

  return (
    <div className="flex flex-col gap-6 px-4 lg:px-6">
      <div className="flex flex-wrap items-end gap-3">
        <div className="flex flex-col gap-1.5">
          <Label>Jumlah</Label>
          <Input
            type="number"
            min={1}
            max={100}
            value={count}
            onChange={handleCountChange}
            className="w-28"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Satuan</Label>
          <Select value={unit} onValueChange={(v) => setUnit(v as Unit)}>
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="words">Kata</SelectItem>
              <SelectItem value="sentences">Kalimat</SelectItem>
              <SelectItem value="paragraphs">Paragraf</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={generate} className="gap-2">
          <IconRefresh className="size-4" />
          Generate
        </Button>
      </div>

      {output ? (
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              {output.split(/\s+/).filter(Boolean).length} kata
            </span>
            <Button
              size="sm"
              variant="ghost"
              onClick={copy}
              className="h-7 gap-1 text-xs"
            >
              {copied ? <IconCheck className="size-3" /> : <IconCopy className="size-3" />}
              {copied ? "Copied!" : "Copy"}
            </Button>
          </div>
          <div className="min-h-64 rounded-md border bg-muted p-4 text-sm leading-relaxed whitespace-pre-wrap">
            {output}
          </div>
        </div>
      ) : (
        <div className="flex h-40 items-center justify-center rounded-md border border-dashed text-sm text-muted-foreground">
          Klik Generate untuk membuat teks Lorem Ipsum
        </div>
      )}
    </div>
  )
}
