"use client";

import { Check, Copy } from "lucide-react";
import dynamic from "next/dynamic";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useLanguage } from "@/contexts/language-context";
import { useStorage } from "@/hooks/use-storage";
import { useToolState } from "@/hooks/use-tool-state";

const CodeEditor = dynamic(
  () => import("@/components/code-editor").then((m) => m.CodeEditor),
  { ssr: false }
);

function formatXml(xml: string, errorMessage: string, indent = 2): string {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xml.trim(), "text/xml");
  const errorNode = doc.querySelector("parsererror");
  if (errorNode) {
    const msg = errorNode.textContent?.split("\n")[1] ?? errorMessage;
    throw new Error(msg.trim());
  }
  const lines: string[] = [];
  const pad = " ".repeat(indent);

  function walk(node: Node, depth: number) {
    const indentStr = pad.repeat(depth);
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent?.trim() ?? "";
      if (text) lines.push(indentStr + text);
      return;
    }
    if (node.nodeType === Node.COMMENT_NODE) {
      lines.push(`${indentStr}<!--${node.textContent}-->`);
      return;
    }
    if (node.nodeType === Node.PROCESSING_INSTRUCTION_NODE) {
      const pi = node as ProcessingInstruction;
      lines.push(`${indentStr}<?${pi.target} ${pi.data}?>`);
      return;
    }
    if (node.nodeType !== Node.ELEMENT_NODE) return;
    const el = node as Element;
    const attrs = Array.from(el.attributes)
      .map((a) => ` ${a.name}="${a.value}"`)
      .join("");
    const children = Array.from(el.childNodes);
    const textOnly =
      children.length === 1 && children[0].nodeType === Node.TEXT_NODE;
    if (textOnly) {
      const text = children[0].textContent?.trim() ?? "";
      if (text) {
        lines.push(
          `${indentStr}<${el.tagName}${attrs}>${text}</${el.tagName}>`
        );
      } else {
        lines.push(`${indentStr}<${el.tagName}${attrs} />`);
      }
      return;
    }
    if (children.length === 0) {
      lines.push(`${indentStr}<${el.tagName}${attrs} />`);
      return;
    }
    lines.push(`${indentStr}<${el.tagName}${attrs}>`);
    for (const child of children) walk(child, depth + 1);
    lines.push(`${indentStr}</${el.tagName}>`);
  }

  const xmlDoc = doc as unknown as {
    xmlVersion?: string;
    xmlEncoding?: string;
  };
  const dec = xmlDoc.xmlVersion
    ? `<?xml version="${xmlDoc.xmlVersion}" encoding="${xmlDoc.xmlEncoding || "UTF-8"}"?>`
    : null;
  if (dec) lines.push(dec);
  walk(doc.documentElement, 0);
  return lines.join("\n");
}

function minifyXml(xml: string, errorMessage: string): string {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xml.trim(), "text/xml");
  const errorNode = doc.querySelector("parsererror");
  if (errorNode) throw new Error(errorMessage);
  return new XMLSerializer().serializeToString(doc);
}

export default function XmlFormatterPage() {
  const { t } = useLanguage();
  const [value, setValue] = useToolState("xml-formatter", "input", "");
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [wordWrap, setWordWrap] = useStorage(
    "code-editor-word-wrap",
    false,
    "local"
  );

  const format = () => {
    try {
      setValue(formatXml(value, t.xmlParseError));
      setError(null);
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const minify = () => {
    try {
      setValue(minifyXml(value, t.xmlParseError));
      setError(null);
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const clear = () => {
    setValue("");
    setError(null);
  };

  const copy = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="flex h-full flex-col gap-4 px-4 lg:px-6">
      <div className="flex shrink-0 items-center justify-between">
        <div className="flex gap-4">
          <Button size="lg" onClick={format} disabled={!value}>
            {t.format}
          </Button>
          <Button
            size="lg"
            onClick={minify}
            disabled={!value}
            variant="secondary"
          >
            {t.minify}
          </Button>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Checkbox
              id="xml-formatter-word-wrap"
              checked={wordWrap}
              onCheckedChange={(c) => setWordWrap(c === true)}
            />
            <Label
              htmlFor="xml-formatter-word-wrap"
              className="text-xs font-normal"
            >
              {t.wrapLines}
            </Label>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={copy}
            disabled={!value}
            className="gap-1 text-xs"
          >
            {copied ? (
              <Check className="size-3" />
            ) : (
              <Copy className="size-3" />
            )}
            {copied ? t.copied : t.copy}
          </Button>
          <Button size="sm" variant="ghost" onClick={clear} className="text-xs">
            {t.clear}
          </Button>
        </div>
      </div>

      {error && (
        <div className="border-destructive bg-destructive/10 text-destructive shrink-0 rounded-md border p-3 font-mono text-sm">
          {error}
        </div>
      )}

      <CodeEditor
        className="min-h-0 flex-1"
        language="xml"
        placeholder="<root><item>value</item></root>"
        value={value}
        wordWrap={wordWrap}
        onChange={(v) => {
          setValue(v);
          setError(null);
        }}
      />
    </div>
  );
}
