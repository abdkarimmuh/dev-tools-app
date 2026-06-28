"use client"

import { useState } from "react"

import { Button } from "@/components/ui/button"
import { useLanguage } from "@/contexts/language-context"
import { cn } from "@/lib/utils"

type DiffLine = {
  type: "same" | "removed" | "added"
  line: string
  lineA?: number
  lineB?: number
}

type SideBySideRow = {
  leftNum: number | null
  leftContent: string | null
  leftType: "same" | "removed" | "empty"
  rightNum: number | null
  rightContent: string | null
  rightType: "same" | "added" | "empty"
}

function computeDiff(a: string, b: string): DiffLine[] {
  const aLines = a.split("\n")
  const bLines = b.split("\n")
  const m = aLines.length
  const n = bLines.length

  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0))
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] =
        aLines[i - 1] === bLines[j - 1]
          ? dp[i - 1][j - 1] + 1
          : Math.max(dp[i - 1][j], dp[i][j - 1])
    }
  }

  const result: DiffLine[] = []
  let i = m
  let j = n
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && aLines[i - 1] === bLines[j - 1]) {
      result.unshift({ type: "same", line: aLines[i - 1], lineA: i, lineB: j })
      i--
      j--
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      result.unshift({ type: "added", line: bLines[j - 1], lineB: j })
      j--
    } else {
      result.unshift({ type: "removed", line: aLines[i - 1], lineA: i })
      i--
    }
  }

  return result
}

function toSideBySide(diff: DiffLine[]): SideBySideRow[] {
  const rows: SideBySideRow[] = []
  let i = 0

  while (i < diff.length) {
    const entry = diff[i]

    if (entry.type === "same") {
      rows.push({
        leftNum: entry.lineA ?? null,
        leftContent: entry.line,
        leftType: "same",
        rightNum: entry.lineB ?? null,
        rightContent: entry.line,
        rightType: "same",
      })
      i++
    } else {
      const removed: DiffLine[] = []
      const added: DiffLine[] = []
      while (i < diff.length && diff[i].type !== "same") {
        if (diff[i].type === "removed") removed.push(diff[i])
        else added.push(diff[i])
        i++
      }
      const len = Math.max(removed.length, added.length)
      for (let k = 0; k < len; k++) {
        const rem = removed[k] ?? null
        const add = added[k] ?? null
        rows.push({
          leftNum: rem?.lineA ?? null,
          leftContent: rem?.line ?? null,
          leftType: rem ? "removed" : "empty",
          rightNum: add?.lineB ?? null,
          rightContent: add?.line ?? null,
          rightType: add ? "added" : "empty",
        })
      }
    }
  }

  return rows
}

export default function DiffCheckerPage() {
  const { t } = useLanguage()
  const [textA, setTextA] = useState("")
  const [textB, setTextB] = useState("")
  const [rows, setRows] = useState<SideBySideRow[] | null>(null)

  const compare = () => {
    const diff = computeDiff(textA, textB)
    setRows(toSideBySide(diff))
  }

  const clear = () => {
    setTextA("")
    setTextB("")
    setRows(null)
  }

  const added = rows?.filter((r) => r.rightType === "added").length ?? 0
  const removed = rows?.filter((r) => r.leftType === "removed").length ?? 0

  return (
    <div className="flex flex-col gap-4 px-4 lg:px-6">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium">Original</span>
          <textarea
            className="h-52 w-full resize-none rounded-md border bg-background p-3 font-mono text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
            placeholder={t.diffFirstPlaceholder}
            value={textA}
            onChange={(e) => { setTextA(e.target.value); setRows(null) }}
            spellCheck={false}
          />
        </div>
        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium">Changed</span>
          <textarea
            className="h-52 w-full resize-none rounded-md border bg-background p-3 font-mono text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
            placeholder={t.diffSecondPlaceholder}
            value={textB}
            onChange={(e) => { setTextB(e.target.value); setRows(null) }}
            spellCheck={false}
          />
        </div>
      </div>

      <div className="flex gap-2">
        <Button onClick={compare} disabled={!textA && !textB}>
          Compare
        </Button>
        <Button variant="ghost" onClick={clear}>
          {t.clear}
        </Button>
        {rows && (
          <div className="ml-auto flex items-center gap-3 text-sm">
            <span className="text-green-600 dark:text-green-400">+{added} added</span>
            <span className="text-red-600 dark:text-red-400">-{removed} removed</span>
          </div>
        )}
      </div>

      {rows && (
        <div className="overflow-hidden rounded-md border">
          <div className="grid grid-cols-2 border-b bg-muted/50 text-xs font-medium text-muted-foreground">
            <div className="border-r px-10 py-2">Original</div>
            <div className="px-10 py-2">Changed</div>
          </div>

          <div className="overflow-auto">
            <table className="w-full font-mono text-sm">
              <tbody>
                {rows.map((row, idx) => (
                  <tr key={idx} className="border-b last:border-b-0">
                    <td
                      className={cn(
                        "w-10 select-none border-r px-2 py-1 text-right text-xs text-muted-foreground",
                        row.leftType === "removed" && "bg-red-50 dark:bg-red-950/30"
                      )}
                    >
                      {row.leftNum ?? ""}
                    </td>
                    <td
                      className={cn(
                        "w-[42%] border-r py-1 pl-2 pr-4 whitespace-pre",
                        row.leftType === "removed" && "bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-300",
                        row.leftType === "same" && "text-foreground",
                        row.leftType === "empty" && "bg-muted/30"
                      )}
                    >
                      {row.leftContent ?? ""}
                    </td>
                    <td
                      className={cn(
                        "w-10 select-none border-r px-2 py-1 text-right text-xs text-muted-foreground",
                        row.rightType === "added" && "bg-green-50 dark:bg-green-950/30"
                      )}
                    >
                      {row.rightNum ?? ""}
                    </td>
                    <td
                      className={cn(
                        "w-[42%] py-1 pl-2 pr-4 whitespace-pre",
                        row.rightType === "added" && "bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-300",
                        row.rightType === "same" && "text-foreground",
                        row.rightType === "empty" && "bg-muted/30"
                      )}
                    >
                      {row.rightContent ?? ""}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
