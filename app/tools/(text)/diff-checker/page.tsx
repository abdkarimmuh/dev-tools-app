"use client"

import { useCallback, useEffect, useRef, useState } from "react"

import { Button } from "@/components/ui/button"
import { useLanguage } from "@/contexts/language-context"
import { useToolState } from "@/hooks/use-tool-state"
import { cn } from "@/lib/utils"

type DiffLine = {
  type: "same" | "removed" | "added"
  line: string
  lineA?: number
  lineB?: number
}

type CharPart = {
  text: string
  changed: boolean
}

type SideBySideRow = {
  leftNum: number | null
  leftContent: string | null
  leftType: "same" | "removed" | "empty"
  leftParts: CharPart[] | null
  rightNum: number | null
  rightContent: string | null
  rightType: "same" | "added" | "empty"
  rightParts: CharPart[] | null
}

function normalizeWS(line: string) {
  return line.replace(/\s+/g, " ").trim()
}

function computeDiff(
  a: string,
  b: string,
  ignoreWhitespace: boolean
): DiffLine[] {
  const aLines = a.split("\n")
  const bLines = b.split("\n")
  const m = aLines.length
  const n = bLines.length
  const eq = (x: string, y: string) =>
    ignoreWhitespace ? normalizeWS(x) === normalizeWS(y) : x === y

  const dp: number[][] = Array.from({ length: m + 1 }, () =>
    new Array(n + 1).fill(0)
  )
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = eq(aLines[i - 1], bLines[j - 1])
        ? dp[i - 1][j - 1] + 1
        : Math.max(dp[i - 1][j], dp[i][j - 1])
    }
  }

  const result: DiffLine[] = []
  let i = m
  let j = n
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && eq(aLines[i - 1], bLines[j - 1])) {
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

function computeCharDiff(
  a: string,
  b: string
): { left: CharPart[]; right: CharPart[] } {
  const aC = [...a]
  const bC = [...b]
  const m = aC.length
  const n = bC.length

  const dp: number[][] = Array.from({ length: m + 1 }, () =>
    new Array(n + 1).fill(0)
  )
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] =
        aC[i - 1] === bC[j - 1]
          ? dp[i - 1][j - 1] + 1
          : Math.max(dp[i - 1][j], dp[i][j - 1])
    }
  }

  type Op = { type: "same" | "removed" | "added"; ch: string }
  const ops: Op[] = []
  let i = m
  let j = n
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && aC[i - 1] === bC[j - 1]) {
      ops.unshift({ type: "same", ch: aC[i - 1] })
      i--
      j--
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      ops.unshift({ type: "added", ch: bC[j - 1] })
      j--
    } else {
      ops.unshift({ type: "removed", ch: aC[i - 1] })
      i--
    }
  }

  const left: CharPart[] = []
  const right: CharPart[] = []

  const push = (arr: CharPart[], ch: string, changed: boolean) => {
    const last = arr[arr.length - 1]
    if (last && last.changed === changed) {
      last.text += ch
    } else {
      arr.push({ text: ch, changed })
    }
  }

  for (const op of ops) {
    if (op.type === "same") {
      push(left, op.ch, false)
      push(right, op.ch, false)
    } else if (op.type === "removed") {
      push(left, op.ch, true)
    } else {
      push(right, op.ch, true)
    }
  }

  return { left, right }
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
        leftParts: null,
        rightNum: entry.lineB ?? null,
        rightContent: entry.line,
        rightType: "same",
        rightParts: null,
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
        let leftParts: CharPart[] | null = null
        let rightParts: CharPart[] | null = null
        if (rem && add) {
          const cd = computeCharDiff(rem.line, add.line)
          leftParts = cd.left
          rightParts = cd.right
        }
        rows.push({
          leftNum: rem?.lineA ?? null,
          leftContent: rem?.line ?? null,
          leftType: rem ? "removed" : "empty",
          leftParts,
          rightNum: add?.lineB ?? null,
          rightContent: add?.line ?? null,
          rightType: add ? "added" : "empty",
          rightParts,
        })
      }
    }
  }

  return rows
}

function InlineDiff({
  parts,
  side,
}: {
  parts: CharPart[]
  side: "left" | "right"
}) {
  return (
    <>
      {parts.map((p, idx) =>
        p.changed ? (
          <mark
            key={idx}
            className={cn(
              "rounded-sm",
              side === "left"
                ? "bg-red-300 text-red-900 dark:bg-red-700/60 dark:text-red-100"
                : "bg-green-300 text-green-900 dark:bg-green-700/60 dark:text-green-100"
            )}
          >
            {p.text}
          </mark>
        ) : (
          <span key={idx}>{p.text}</span>
        )
      )}
    </>
  )
}

export default function DiffCheckerPage() {
  const { t } = useLanguage()
  const [textA, setTextA] = useToolState("diff-checker", "textA", "")
  const [textB, setTextB] = useToolState("diff-checker", "textB", "")
  const [rows, setRows] = useState<SideBySideRow[] | null>(null)
  const [ignoreWhitespace, setIgnoreWhitespace] = useToolState(
    "diff-checker",
    "ignoreWS",
    false
  )

  const [splitPercent, setSplitPercent] = useState(50)
  const containerRef = useRef<HTMLDivElement>(null)
  const isDragging = useRef(false)

  const handleDividerMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    isDragging.current = true
    document.body.style.cursor = "col-resize"
    document.body.style.userSelect = "none"
  }, [])

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging.current || !containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const percent = Math.min(Math.max((x / rect.width) * 100, 20), 80)
    setSplitPercent(percent)
  }, [])

  const handleMouseUp = useCallback(() => {
    if (!isDragging.current) return
    isDragging.current = false
    document.body.style.cursor = ""
    document.body.style.userSelect = ""
  }, [])

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove)
    window.addEventListener("mouseup", handleMouseUp)
    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("mouseup", handleMouseUp)
    }
  }, [handleMouseMove, handleMouseUp])

  const swapTexts = () => {
    const tmp = textA
    setTextA(textB)
    setTextB(tmp)
    setRows(null)
  }

  const compare = () => {
    const diff = computeDiff(textA, textB, ignoreWhitespace)
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
      {/* Split pane input */}
      <div
        ref={containerRef}
        className="relative flex h-52 w-full overflow-hidden rounded-md border select-none"
      >
        {/* Left pane */}
        <div className="flex flex-col" style={{ width: `${splitPercent}%` }}>
          <div className="border-b bg-muted/50 px-3 py-1.5 text-xs font-medium text-muted-foreground">
            Original
          </div>
          <textarea
            className="h-full w-full resize-none bg-background p-3 font-mono text-sm outline-none"
            placeholder={t.diffFirstPlaceholder}
            value={textA}
            onChange={(e) => {
              setTextA(e.target.value)
              setRows(null)
            }}
            spellCheck={false}
          />
        </div>

        {/* Divider */}
        <div
          className="group relative z-10 flex w-3 flex-shrink-0 cursor-col-resize items-center justify-center bg-border transition-colors hover:bg-primary/20 active:bg-primary/30"
          onMouseDown={handleDividerMouseDown}
        >
          {/* Swap button */}
          <button
            className="absolute z-20 flex h-8 w-8 items-center justify-center rounded-full border bg-background shadow-md transition-all hover:scale-110 hover:bg-muted active:scale-95"
            onMouseDown={(e) => e.stopPropagation()}
            onClick={swapTexts}
            title="Swap sides"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M8 3 4 7l4 4" />
              <path d="M4 7h16" />
              <path d="m16 21 4-4-4-4" />
              <path d="M20 17H4" />
            </svg>
          </button>

          {/* Drag handle dots */}
          <div className="flex flex-col gap-1 opacity-40 transition-opacity group-hover:opacity-80">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-1 w-1 rounded-full bg-foreground" />
            ))}
          </div>
        </div>

        {/* Right pane */}
        <div className="flex flex-1 flex-col">
          <div className="border-b bg-muted/50 px-3 py-1.5 text-xs font-medium text-muted-foreground">
            Changed
          </div>
          <textarea
            className="h-full w-full resize-none bg-background p-3 font-mono text-sm outline-none"
            placeholder={t.diffSecondPlaceholder}
            value={textB}
            onChange={(e) => {
              setTextB(e.target.value)
              setRows(null)
            }}
            spellCheck={false}
          />
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3">
        <Button onClick={compare} disabled={!textA && !textB}>
          Compare
        </Button>
        <Button variant="ghost" onClick={clear}>
          {t.clear}
        </Button>

        <label className="ml-1 flex cursor-pointer items-center gap-2 text-sm select-none">
          <input
            type="checkbox"
            className="h-4 w-4 rounded accent-primary"
            checked={ignoreWhitespace}
            onChange={(e) => {
              setIgnoreWhitespace(e.target.checked)
              setRows(null)
            }}
          />
          Hide whitespace
        </label>

        {rows && (
          <div className="ml-auto flex items-center gap-3 text-sm">
            <span className="text-green-600 dark:text-green-400">
              +{added} added
            </span>
            <span className="text-red-600 dark:text-red-400">
              -{removed} removed
            </span>
          </div>
        )}
      </div>

      {/* Diff result */}
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
                        "w-10 border-r px-2 py-1 text-right text-xs text-muted-foreground select-none",
                        row.leftType === "removed" &&
                          "bg-red-50 dark:bg-red-950/30"
                      )}
                    >
                      {row.leftNum ?? ""}
                    </td>
                    <td
                      className={cn(
                        "w-[42%] border-r py-1 pr-4 pl-2 whitespace-pre",
                        row.leftType === "removed" &&
                          "bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-300",
                        row.leftType === "same" && "text-foreground",
                        row.leftType === "empty" && "bg-muted/30"
                      )}
                    >
                      {row.leftParts ? (
                        <InlineDiff parts={row.leftParts} side="left" />
                      ) : (
                        (row.leftContent ?? "")
                      )}
                    </td>
                    <td
                      className={cn(
                        "w-10 border-r px-2 py-1 text-right text-xs text-muted-foreground select-none",
                        row.rightType === "added" &&
                          "bg-green-50 dark:bg-green-950/30"
                      )}
                    >
                      {row.rightNum ?? ""}
                    </td>
                    <td
                      className={cn(
                        "w-[42%] py-1 pr-4 pl-2 whitespace-pre",
                        row.rightType === "added" &&
                          "bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-300",
                        row.rightType === "same" && "text-foreground",
                        row.rightType === "empty" && "bg-muted/30"
                      )}
                    >
                      {row.rightParts ? (
                        <InlineDiff parts={row.rightParts} side="right" />
                      ) : (
                        (row.rightContent ?? "")
                      )}
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
