"use client"

import { Check, Copy } from "lucide-react"
import { useEffect, useRef, useState } from "react"

import { Button } from "@/components/ui/button"
import { useToolState } from "@/hooks/use-tool-state"
import { handleTextareaTab } from "@/lib/utils"

function formatXml(xml: string, indent = 2): string {
  const parser = new DOMParser()
  const doc = parser.parseFromString(xml.trim(), "text/xml")
  const errorNode = doc.querySelector("parsererror")
  if (errorNode) {
    const msg = errorNode.textContent?.split("\n")[1] ?? "XML parse error"
    throw new Error(msg.trim())
  }
  const lines: string[] = []
  const pad = " ".repeat(indent)

  function walk(node: Node, depth: number) {
    const indentStr = pad.repeat(depth)
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent?.trim() ?? ""
      if (text) lines.push(indentStr + text)
      return
    }
    if (node.nodeType === Node.COMMENT_NODE) {
      lines.push(`${indentStr}<!--${node.textContent}-->`)
      return
    }
    if (node.nodeType === Node.PROCESSING_INSTRUCTION_NODE) {
      const pi = node as ProcessingInstruction
      lines.push(`${indentStr}<?${pi.target} ${pi.data}?>`)
      return
    }
    if (node.nodeType !== Node.ELEMENT_NODE) return
    const el = node as Element
    const attrs = Array.from(el.attributes)
      .map((a) => ` ${a.name}="${a.value}"`)
      .join("")
    const children = Array.from(el.childNodes)
    const textOnly =
      children.length === 1 && children[0].nodeType === Node.TEXT_NODE
    if (textOnly) {
      const text = children[0].textContent?.trim() ?? ""
      if (text) {
        lines.push(`${indentStr}<${el.tagName}${attrs}>${text}</${el.tagName}>`)
      } else {
        lines.push(`${indentStr}<${el.tagName}${attrs} />`)
      }
      return
    }
    if (children.length === 0) {
      lines.push(`${indentStr}<${el.tagName}${attrs} />`)
      return
    }
    lines.push(`${indentStr}<${el.tagName}${attrs}>`)
    for (const child of children) walk(child, depth + 1)
    lines.push(`${indentStr}</${el.tagName}>`)
  }

  const xmlDoc = doc as unknown as { xmlVersion?: string; xmlEncoding?: string }
  const dec = xmlDoc.xmlVersion
    ? `<?xml version="${xmlDoc.xmlVersion}" encoding="${xmlDoc.xmlEncoding || "UTF-8"}"?>`
    : null
  if (dec) lines.push(dec)
  walk(doc.documentElement, 0)
  return lines.join("\n")
}

function minifyXml(xml: string): string {
  const parser = new DOMParser()
  const doc = parser.parseFromString(xml.trim(), "text/xml")
  const errorNode = doc.querySelector("parsererror")
  if (errorNode) throw new Error("XML parse error")
  return new XMLSerializer().serializeToString(doc)
}

export default function XmlFormatterPage() {
  const [input, setInput] = useToolState("xml-formatter", "input", "")
  const [output, setOutput] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      if (!input) {
        setOutput("")
        setError(null)
        return
      }
      try {
        setOutput(formatXml(input))
        setError(null)
      } catch (e) {
        setError((e as Error).message)
        setOutput("")
      }
    }, 500)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [input])

  const minify = () => {
    try {
      setOutput(minifyXml(input))
      setError(null)
    } catch (e) {
      setError((e as Error).message)
      setOutput("")
    }
  }

  const copy = async () => {
    await navigator.clipboard.writeText(output)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="flex h-full flex-col gap-4 px-4 lg:px-6">
      <div className="flex shrink-0 justify-end gap-4">
        <Button
          size="lg"
          onClick={() => {
            try {
              setOutput(formatXml(input))
              setError(null)
            } catch (e) {
              setError((e as Error).message)
            }
          }}
          disabled={!input}
        >
          Format
        </Button>
        <Button
          size="lg"
          onClick={minify}
          disabled={!input}
          variant="secondary"
        >
          Minify
        </Button>
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="flex min-h-0 flex-col gap-2">
          <div className="flex shrink-0 items-center justify-between">
            <span className="text-sm font-medium">Input</span>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setInput("")
                setOutput("")
                setError(null)
              }}
              className="text-xs"
            >
              Clear
            </Button>
          </div>
          <textarea
            className="min-h-0 w-full flex-1 resize-none rounded-md border bg-background p-3 font-mono text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
            placeholder="<root><item>value</item></root>"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => handleTextareaTab(e, input, setInput)}
            spellCheck={false}
          />
        </div>

        <div className="flex min-h-0 flex-col gap-2">
          <div className="flex shrink-0 items-center justify-between">
            <span className="text-sm font-medium">Output</span>
            <Button
              size="sm"
              variant="ghost"
              onClick={copy}
              disabled={!output}
              className="gap-1 text-xs"
            >
              {copied ? (
                <Check className="size-3" />
              ) : (
                <Copy className="size-3" />
              )}
              {copied ? "Copied!" : "Copy"}
            </Button>
          </div>
          {error ? (
            <div className="min-h-0 flex-1 overflow-auto rounded-md border border-destructive bg-destructive/10 p-3 font-mono text-sm text-destructive">
              {error}
            </div>
          ) : (
            <textarea
              readOnly
              className="min-h-0 w-full flex-1 resize-none rounded-md border bg-muted p-3 font-mono text-sm outline-none"
              value={output}
              placeholder="Output will appear here..."
              spellCheck={false}
            />
          )}
        </div>
      </div>
    </div>
  )
}
