"use client";

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

type TypeLang = "go" | "typescript";
type Direction = "json-to-type" | "type-to-json";

const LANGS: { value: TypeLang; label: string }[] = [
  { value: "go", label: "Go Struct" },
  { value: "typescript", label: "TypeScript Interface" }
];

const MAX_DEPTH = 6;

const JSON_PLACEHOLDER =
  '{"name":"Alice","address":{"city":"NYC","zip":"10001"}}';

const TYPE_PLACEHOLDERS: Record<TypeLang, string> = {
  go: 'type Root struct {\n\tName    string  `json:"name"`\n\tAddress Address `json:"address"`\n}\n\ntype Address struct {\n\tCity string `json:"city"`\n\tZip  string `json:"zip"`\n}',
  typescript:
    "interface Root {\n  name: string;\n  address: Address;\n}\n\ninterface Address {\n  city: string;\n  zip: string;\n}"
};

function pascalCase(key: string): string {
  const cased = key
    .replace(/[^a-zA-Z0-9]+(.)/g, (_, c: string) => c.toUpperCase())
    .replace(/^[a-z]/, (c) => c.toUpperCase());
  return cased || "Field";
}

function tsPropKey(key: string): string {
  return /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(key) ? key : JSON.stringify(key);
}

function rootObjectOf(
  value: unknown,
  objectError: string
): Record<string, unknown> {
  const root = Array.isArray(value) ? value[0] : value;
  if (typeof root !== "object" || root === null) throw new Error(objectError);
  return root as Record<string, unknown>;
}

// --- JSON -> Go struct ---

function jsonToGo(value: unknown, objectError: string): string {
  const blocks: string[] = [];

  function fieldType(v: unknown, fieldKey: string): string {
    if (v === null || v === undefined) return "interface{}";
    if (typeof v === "string") return "string";
    if (typeof v === "boolean") return "bool";
    if (typeof v === "number") return Number.isInteger(v) ? "int" : "float64";
    if (Array.isArray(v)) {
      if (v.length === 0) return "[]interface{}";
      return "[]" + fieldType(v[0], fieldKey);
    }
    if (typeof v === "object") {
      const name = pascalCase(fieldKey);
      buildStruct(name, v as Record<string, unknown>);
      return name;
    }
    return "interface{}";
  }

  function buildStruct(name: string, obj: Record<string, unknown>) {
    const lines = Object.entries(obj).map(
      ([k, v]) => `\t${pascalCase(k)} ${fieldType(v, k)} \`json:"${k}"\``
    );
    blocks.push(`type ${name} struct {\n${lines.join("\n")}\n}`);
  }

  buildStruct("Root", rootObjectOf(value, objectError));
  return blocks.join("\n\n");
}

// --- JSON -> TypeScript interface ---

function jsonToTs(value: unknown, objectError: string): string {
  const blocks: string[] = [];

  function fieldType(v: unknown, fieldKey: string): string {
    if (v === null || v === undefined) return "any";
    if (typeof v === "string") return "string";
    if (typeof v === "boolean") return "boolean";
    if (typeof v === "number") return "number";
    if (Array.isArray(v)) {
      if (v.length === 0) return "any[]";
      return `${fieldType(v[0], fieldKey)}[]`;
    }
    if (typeof v === "object") {
      const name = pascalCase(fieldKey);
      buildInterface(name, v as Record<string, unknown>);
      return name;
    }
    return "any";
  }

  function buildInterface(name: string, obj: Record<string, unknown>) {
    const lines = Object.entries(obj).map(
      ([k, v]) => `  ${tsPropKey(k)}: ${fieldType(v, k)};`
    );
    blocks.push(`interface ${name} {\n${lines.join("\n")}\n}`);
  }

  buildInterface("Root", rootObjectOf(value, objectError));
  return blocks.join("\n\n");
}

// --- Go struct -> dummy JSON ---

interface GoField {
  key: string;
  goType: string;
}

function parseGoStructs(
  src: string,
  parseError: string
): Map<string, GoField[]> {
  const structs = new Map<string, GoField[]>();
  const blockRe = /type\s+(\w+)\s+struct\s*{([^}]*)}/g;
  let match: RegExpExecArray | null;
  while ((match = blockRe.exec(src))) {
    const [, name, body] = match;
    const fields: GoField[] = [];
    for (const rawLine of body.split("\n")) {
      const line = rawLine.replace(/\/\/.*$/, "").trim();
      if (!line) continue;
      const fieldMatch = line.match(/^(\w+)\s+([^\s`]+)\s*(`[^`]*`)?/);
      if (!fieldMatch) continue;
      const [, fieldName, rawType, tag] = fieldMatch;
      let jsonKey = fieldName;
      if (tag) {
        const tagMatch = tag.match(/json:"([^"]*)"/);
        if (tagMatch) {
          const parts = tagMatch[1].split(",");
          if (parts[0] === "-") continue;
          if (parts[0]) jsonKey = parts[0];
        }
      }
      fields.push({ key: jsonKey, goType: rawType });
    }
    structs.set(name, fields);
  }
  if (structs.size === 0) throw new Error(parseError);
  return structs;
}

function goValueFor(
  rawType: string,
  structs: Map<string, GoField[]>,
  depth: number
): unknown {
  let type = rawType.trim();
  while (type.startsWith("*")) type = type.slice(1);

  if (type.startsWith("[]")) {
    const inner = type.slice(2);
    return [
      goValueFor(inner, structs, depth),
      goValueFor(inner, structs, depth)
    ];
  }
  if (type.startsWith("map[")) {
    const closeIdx = type.indexOf("]");
    const valueType = type.slice(closeIdx + 1);
    return { key: goValueFor(valueType, structs, depth) };
  }
  if (type === "time.Time") return new Date().toISOString();

  switch (type) {
    case "string":
      return "string";
    case "bool":
      return true;
    case "int":
    case "int8":
    case "int16":
    case "int32":
    case "int64":
    case "uint":
    case "uint8":
    case "uint16":
    case "uint32":
    case "uint64":
    case "float32":
    case "float64":
      return 0;
  }

  if (structs.has(type)) {
    if (depth >= MAX_DEPTH) return null;
    return buildDummyGoObject(type, structs, depth + 1);
  }
  return null;
}

function buildDummyGoObject(
  name: string,
  structs: Map<string, GoField[]>,
  depth: number
): Record<string, unknown> {
  const fields = structs.get(name);
  if (!fields) return {};
  return Object.fromEntries(
    fields.map((f) => [f.key, goValueFor(f.goType, structs, depth)])
  );
}

function goStructToJson(src: string, parseError: string): string {
  const structs = parseGoStructs(src, parseError);
  const rootName = [...structs.keys()][0];
  return JSON.stringify(buildDummyGoObject(rootName, structs, 0), null, 2);
}

// --- TypeScript interface -> dummy JSON ---

interface TsProp {
  key: string;
  tsType: string;
}

function parseTsInterfaces(
  src: string,
  parseError: string
): Map<string, TsProp[]> {
  const interfaces = new Map<string, TsProp[]>();
  const blockRe = /interface\s+(\w+)\s*{([^}]*)}/g;
  let match: RegExpExecArray | null;
  while ((match = blockRe.exec(src))) {
    const [, name, body] = match;
    const props: TsProp[] = [];
    for (const rawLine of body.split("\n")) {
      const line = rawLine
        .replace(/\/\/.*$/, "")
        .trim()
        .replace(/[;,]$/, "");
      if (!line) continue;
      const propMatch = line.match(/^(\w+)\??\s*:\s*(.+)$/);
      if (!propMatch) continue;
      const [, key, tsType] = propMatch;
      props.push({ key, tsType: tsType.trim() });
    }
    interfaces.set(name, props);
  }
  if (interfaces.size === 0) throw new Error(parseError);
  return interfaces;
}

function tsValueFor(
  rawType: string,
  interfaces: Map<string, TsProp[]>,
  depth: number
): unknown {
  let type = rawType.trim();

  if (type.includes("|")) {
    const members = type
      .split("|")
      .map((s) => s.trim())
      .filter((s) => s !== "null" && s !== "undefined");
    type = members[0] ?? "any";
  }

  const bracketArray = type.match(/^(.+)\[\]$/);
  const genericArray = type.match(/^Array<(.+)>$/);
  const arrayInner = bracketArray?.[1] ?? genericArray?.[1];
  if (arrayInner) {
    return [
      tsValueFor(arrayInner, interfaces, depth),
      tsValueFor(arrayInner, interfaces, depth)
    ];
  }

  const recordMatch = type.match(/^Record<\s*string\s*,\s*(.+)>$/);
  if (recordMatch) {
    return { key: tsValueFor(recordMatch[1], interfaces, depth) };
  }

  switch (type) {
    case "string":
      return "string";
    case "number":
      return 0;
    case "boolean":
      return true;
    case "Date":
      return new Date().toISOString();
    case "any":
    case "unknown":
    case "null":
    case "undefined":
      return null;
  }

  if (interfaces.has(type)) {
    if (depth >= MAX_DEPTH) return null;
    return buildDummyTsObject(type, interfaces, depth + 1);
  }
  return null;
}

function buildDummyTsObject(
  name: string,
  interfaces: Map<string, TsProp[]>,
  depth: number
): Record<string, unknown> {
  const props = interfaces.get(name);
  if (!props) return {};
  return Object.fromEntries(
    props.map((p) => [p.key, tsValueFor(p.tsType, interfaces, depth)])
  );
}

function tsToJson(src: string, parseError: string): string {
  const interfaces = parseTsInterfaces(src, parseError);
  const rootName = [...interfaces.keys()][0];
  return JSON.stringify(buildDummyTsObject(rootName, interfaces, 0), null, 2);
}

export default function StructConverterPage() {
  const { t } = useLanguage();
  const [input, setInput] = useToolState("struct-converter", "input", "");
  const [lang, setLang] = useToolState<TypeLang>(
    "struct-converter",
    "lang",
    "go"
  );
  const [direction, setDirection] = useToolState<Direction>(
    "struct-converter",
    "direction",
    "json-to-type"
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
    (src: string, dir: Direction, tl: TypeLang) => {
      if (!src) {
        setOutput("");
        setError(null);
        return;
      }
      try {
        if (dir === "json-to-type") {
          const parsed = JSON.parse(src);
          setOutput(
            tl === "go"
              ? jsonToGo(parsed, t.structConverterJsonObjectError)
              : jsonToTs(parsed, t.structConverterJsonObjectError)
          );
        } else {
          setOutput(
            tl === "go"
              ? goStructToJson(src, t.structConverterGoParseError)
              : tsToJson(src, t.structConverterTsParseError)
          );
        }
        setError(null);
      } catch (e) {
        setError((e as Error).message);
        setOutput("");
      }
    },
    [
      t.structConverterJsonObjectError,
      t.structConverterGoParseError,
      t.structConverterTsParseError
    ]
  );

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(
      () => convert(input, direction, lang),
      500
    );
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [input, direction, lang, convert]);

  const swap = () => {
    const next: Direction =
      direction === "json-to-type" ? "type-to-json" : "json-to-type";
    setInput(output);
    setDirection(next);
  };

  const copy = async () => {
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const targetLabel = LANGS.find((l) => l.value === lang)?.label ?? "";
  const inputLabel = direction === "json-to-type" ? "JSON" : targetLabel;
  const outputLabel = direction === "json-to-type" ? targetLabel : "JSON";
  const inputLanguage = direction === "json-to-type" ? "json" : lang;
  const outputLanguage = direction === "json-to-type" ? lang : "json";
  const inputPlaceholder =
    direction === "json-to-type" ? JSON_PLACEHOLDER : TYPE_PLACEHOLDERS[lang];

  return (
    <div className="flex h-full flex-col gap-4 px-4 lg:px-6">
      <div className="flex shrink-0 items-center gap-3">
        <Label htmlFor="struct-converter-lang">
          {t.structConverterFormatLabel}
        </Label>
        <Select value={lang} onValueChange={(v) => setLang(v as TypeLang)}>
          <SelectTrigger id="struct-converter-lang" className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {LANGS.map((l) => (
              <SelectItem key={l.value} value={l.value}>
                {l.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button size="lg" onClick={swap}>
          {t.swap}
        </Button>
        <div className="flex items-center gap-2">
          <Checkbox
            id="struct-converter-word-wrap"
            checked={wordWrap}
            onCheckedChange={(c) => setWordWrap(c === true)}
          />
          <Label
            htmlFor="struct-converter-word-wrap"
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
