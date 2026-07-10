"use client";

import { ArrowLeftRight, Check, Copy } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/language-context";
import { useToolState } from "@/hooks/use-tool-state";
import { handleTextareaTab } from "@/lib/utils";

type Direction = "json-to-xml" | "xml-to-json";

function jsonToXml(obj: unknown, tagName = "root", indent = 0): string {
  const pad = "  ".repeat(indent);
  if (obj === null || obj === undefined) return `${pad}<${tagName} />`;
  if (typeof obj !== "object")
    return `${pad}<${tagName}>${String(obj)}</${tagName}>`;
  if (Array.isArray(obj)) {
    return obj.map((item) => jsonToXml(item, tagName, indent)).join("\n");
  }
  const children = Object.entries(obj as Record<string, unknown>)
    .map(([key, val]) => jsonToXml(val, key, indent + 1))
    .join("\n");
  return `${pad}<${tagName}>\n${children}\n${pad}</${tagName}>`;
}

function xmlNodeToJson(node: Element): unknown {
  if (node.childNodes.length === 0) return node.textContent ?? "";
  const textOnly = Array.from(node.childNodes).every(
    (n) => n.nodeType === Node.TEXT_NODE
  );
  if (textOnly) return node.textContent?.trim() ?? "";
  const result: Record<string, unknown> = {};
  for (const child of Array.from(node.childNodes)) {
    if (child.nodeType !== Node.ELEMENT_NODE) continue;
    const el = child as Element;
    const val = xmlNodeToJson(el);
    if (el.tagName in result) {
      if (!Array.isArray(result[el.tagName]))
        result[el.tagName] = [result[el.tagName]];
      (result[el.tagName] as unknown[]).push(val);
    } else {
      result[el.tagName] = val;
    }
  }
  return result;
}

export default function JsonXmlPage() {
  const { t } = useLanguage();
  const [input, setInput] = useToolState("json-xml", "input", "");
  const [direction, setDirection] = useToolState<Direction>(
    "json-xml",
    "direction",
    "json-to-xml"
  );
  const [output, setOutput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const convert = useCallback(
    (src: string, dir: Direction) => {
      if (!src) {
        setOutput("");
        setError(null);
        return;
      }
      try {
        if (dir === "json-to-xml") {
          const parsed = JSON.parse(src);
          setOutput(
            '<?xml version="1.0" encoding="UTF-8"?>\n' + jsonToXml(parsed)
          );
        } else {
          const parser = new DOMParser();
          const doc = parser.parseFromString(src, "text/xml");
          const err = doc.querySelector("parsererror");
          if (err)
            throw new Error(
              err.textContent?.split("\n")[1]?.trim() ?? t.xmlParseError
            );
          setOutput(
            JSON.stringify(
              {
                [doc.documentElement.tagName]: xmlNodeToJson(
                  doc.documentElement
                )
              },
              null,
              2
            )
          );
        }
        setError(null);
      } catch (e) {
        setError((e as Error).message);
        setOutput("");
      }
    },
    [t.xmlParseError]
  );

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => convert(input, direction), 500);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [input, direction, convert]);

  const swap = () => {
    const next: Direction =
      direction === "json-to-xml" ? "xml-to-json" : "json-to-xml";
    setInput(output);
    setDirection(next);
  };

  const copy = async () => {
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="flex h-full flex-col gap-4 px-4 lg:px-6">
      <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 lg:grid-cols-[1fr_auto_1fr]">
        <div className="flex min-h-0 flex-col gap-2">
          <div className="flex shrink-0 items-center justify-between">
            <span className="text-sm font-medium">
              {direction === "json-to-xml" ? "JSON" : "XML"}
            </span>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setInput("");
                setOutput("");
                setError(null);
              }}
              className="text-xs"
            >
              {t.clear}
            </Button>
          </div>
          <textarea
            className="min-h-0 w-full flex-1 resize-none rounded-md border bg-background p-3 font-mono text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
            placeholder={
              direction === "json-to-xml"
                ? '{"person":{"name":"Alice","age":30}}'
                : "<root><name>Alice</name><age>30</age></root>"
            }
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => handleTextareaTab(e, input, setInput)}
            spellCheck={false}
          />
        </div>

        <div className="flex shrink-0 items-center justify-center lg:h-full">
          <Button
            size="icon"
            variant="outline"
            onClick={swap}
            className="rounded-full"
            title={direction === "json-to-xml" ? "JSON → XML" : "XML → JSON"}
          >
            <ArrowLeftRight className="size-4" />
          </Button>
        </div>

        <div className="flex min-h-0 flex-col gap-2">
          <div className="flex shrink-0 items-center justify-between">
            <span className="text-sm font-medium">
              {direction === "json-to-xml" ? "XML" : "JSON"}
            </span>
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
              {copied ? t.copied : t.copy}
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
              placeholder={t.outputPlaceholder}
              spellCheck={false}
            />
          )}
        </div>
      </div>
    </div>
  );
}
