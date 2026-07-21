"use client";

import * as yaml from "js-yaml";
import { Check, Copy } from "lucide-react";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { useLanguage } from "@/contexts/language-context";
import { useStorage } from "@/hooks/use-storage";
import { useToolState } from "@/hooks/use-tool-state";

const CodeEditor = dynamic(
  () => import("@/components/code-editor").then((m) => m.CodeEditor),
  { ssr: false }
);

type TargetFormat = "csv" | "xml" | "yaml";
type Direction = "json-to-target" | "target-to-json";

const FORMATS: { value: TargetFormat; label: string }[] = [
  { value: "csv", label: "CSV" },
  { value: "xml", label: "XML" },
  { value: "yaml", label: "YAML" }
];

const JSON_PLACEHOLDERS: Record<TargetFormat, string> = {
  csv: '[{"name":"Alice","age":30},{"name":"Bob","age":25}]',
  xml: '{"person":{"name":"Alice","age":30}}',
  yaml: '{"name": "John", "age": 30}'
};

const TARGET_PLACEHOLDERS: Record<TargetFormat, string> = {
  csv: "name,age\nAlice,30\nBob,25",
  xml: "<root><name>Alice</name><age>30</age></root>",
  yaml: "name: John\nage: 30"
};

function jsonToCsv(jsonStr: string, arrayError: string): string {
  const data = JSON.parse(jsonStr);
  if (!Array.isArray(data)) throw new Error(arrayError);
  if (data.length === 0) return "";
  const headers = Array.from(new Set(data.flatMap((row) => Object.keys(row))));
  const escape = (v: unknown) => {
    const str = v === null || v === undefined ? "" : String(v);
    return str.includes(",") || str.includes('"') || str.includes("\n")
      ? `"${str.replace(/"/g, '""')}"`
      : str;
  };
  const rows = data.map((row: Record<string, unknown>) =>
    headers.map((h) => escape(row[h])).join(",")
  );
  return [headers.join(","), ...rows].join("\n");
}

function csvToJson(csvStr: string, headerError: string): string {
  const lines = csvStr.trim().split("\n");
  if (lines.length < 2) throw new Error(headerError);

  function parseLine(line: string): string[] {
    const result: string[] = [];
    let current = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++;
        } else inQuotes = !inQuotes;
      } else if (ch === "," && !inQuotes) {
        result.push(current);
        current = "";
      } else {
        current += ch;
      }
    }
    result.push(current);
    return result;
  }

  const headers = parseLine(lines[0]);
  const rows = lines
    .slice(1)
    .filter(Boolean)
    .map((line) => {
      const values = parseLine(line);
      return Object.fromEntries(headers.map((h, i) => [h, values[i] ?? ""]));
    });
  return JSON.stringify(rows, null, 2);
}

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

function xmlToJsonString(xmlStr: string, parseError: string): string {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlStr, "text/xml");
  const err = doc.querySelector("parsererror");
  if (err)
    throw new Error(err.textContent?.split("\n")[1]?.trim() ?? parseError);
  return JSON.stringify(
    { [doc.documentElement.tagName]: xmlNodeToJson(doc.documentElement) },
    null,
    2
  );
}

export default function JsonConverterPage() {
  const { t } = useLanguage();
  const [input, setInput] = useToolState("json-converter", "input", "");
  const [format, setFormat] = useToolState<TargetFormat>(
    "json-converter",
    "format",
    "csv"
  );
  const [direction, setDirection] = useToolState<Direction>(
    "json-converter",
    "direction",
    "json-to-target"
  );
  const [output, setOutput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [wordWrap, setWordWrap] = useStorage(
    "code-editor-word-wrap",
    false,
    "local"
  );
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const convert = useCallback(
    (src: string, dir: Direction, fmt: TargetFormat) => {
      if (!src) {
        setOutput("");
        setError(null);
        return;
      }
      try {
        if (dir === "json-to-target") {
          switch (fmt) {
            case "csv":
              setOutput(jsonToCsv(src, t.csvArrayError));
              break;
            case "xml":
              setOutput(
                '<?xml version="1.0" encoding="UTF-8"?>\n' +
                  jsonToXml(JSON.parse(src))
              );
              break;
            case "yaml":
              setOutput(
                yaml.dump(JSON.parse(src), { indent: 2, lineWidth: -1 })
              );
              break;
          }
        } else {
          switch (fmt) {
            case "csv":
              setOutput(csvToJson(src, t.csvHeaderError));
              break;
            case "xml":
              setOutput(xmlToJsonString(src, t.xmlParseError));
              break;
            case "yaml":
              setOutput(JSON.stringify(yaml.load(src), null, 2));
              break;
          }
        }
        setError(null);
      } catch (e) {
        setError((e as Error).message);
        setOutput("");
      }
    },
    [t.csvArrayError, t.csvHeaderError, t.xmlParseError]
  );

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(
      () => convert(input, direction, format),
      500
    );
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [input, direction, format, convert]);

  const swap = () => {
    const next: Direction =
      direction === "json-to-target" ? "target-to-json" : "json-to-target";
    setInput(output);
    setDirection(next);
  };

  const copy = async () => {
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const targetLabel = format.toUpperCase();
  const inputLabel = direction === "json-to-target" ? "JSON" : targetLabel;
  const outputLabel = direction === "json-to-target" ? targetLabel : "JSON";
  const inputLanguage =
    direction === "json-to-target"
      ? "json"
      : format === "csv"
        ? "text"
        : format;
  const outputLanguage =
    direction === "json-to-target"
      ? format === "csv"
        ? "text"
        : format
      : "json";
  const inputPlaceholder =
    direction === "json-to-target"
      ? JSON_PLACEHOLDERS[format]
      : TARGET_PLACEHOLDERS[format];

  return (
    <div className="flex h-full flex-col gap-4 px-4 lg:px-6">
      <div className="flex shrink-0 items-center gap-3">
        <Label htmlFor="json-converter-format">
          {t.jsonConverterFormatLabel}
        </Label>
        <Select
          value={format}
          onValueChange={(v) => setFormat(v as TargetFormat)}
        >
          <SelectTrigger id="json-converter-format" className="w-32">
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
        <Button size="lg" onClick={swap}>
          {t.swap}
        </Button>
        <div className="flex items-center gap-2">
          <Checkbox
            id="json-converter-word-wrap"
            checked={wordWrap}
            onCheckedChange={(c) => setWordWrap(c === true)}
          />
          <Label
            htmlFor="json-converter-word-wrap"
            className="text-xs font-normal"
          >
            {t.wrapLines}
          </Label>
        </div>
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="flex min-h-0 flex-col gap-2">
          <div className="flex shrink-0 items-center justify-between">
            <span className="text-sm font-medium">{inputLabel}</span>
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
          <CodeEditor
            className="min-h-0 flex-1"
            language={inputLanguage}
            placeholder={inputPlaceholder}
            value={input}
            wordWrap={wordWrap}
            onChange={setInput}
          />
        </div>

        <div className="flex min-h-0 flex-col gap-2">
          <div className="flex shrink-0 items-center justify-between">
            <span className="text-sm font-medium">{outputLabel}</span>
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
            <div className="border-destructive bg-destructive/10 text-destructive min-h-0 flex-1 overflow-auto rounded-md border p-3 font-mono text-sm">
              {error}
            </div>
          ) : (
            <CodeEditor
              readOnly
              className="min-h-0 flex-1"
              language={outputLanguage}
              value={output}
              placeholder={t.outputPlaceholder}
              wordWrap={wordWrap}
            />
          )}
        </div>
      </div>
    </div>
  );
}
