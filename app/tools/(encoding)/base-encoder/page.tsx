"use client";

import { Check, Copy, Download, FileIcon, Upload } from "lucide-react";
import { type DragEvent, useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useLanguage } from "@/contexts/language-context";
import { useToolState } from "@/hooks/use-tool-state";
import { handleTextareaTab } from "@/lib/utils";

type Encoding = "base64" | "base32" | "base58" | "base16";
type Mode = "text" | "file";
type FileDirection = "encode" | "decode";

const ENCODINGS: { value: Encoding; label: string }[] = [
  { value: "base64", label: "Base64" },
  { value: "base32", label: "Base32" },
  { value: "base58", label: "Base58" },
  { value: "base16", label: "Hex (Base16)" }
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const MAX_BASE58_BYTES = 1 * 1024 * 1024; // Base58's BigInt math doesn't scale past ~1MB
const MAX_BASE58_TEXT_LENGTH = 1_400_000; // roughly the Base58 text length of MAX_BASE58_BYTES

const MIME_EXTENSIONS: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/gif": "gif",
  "image/webp": "webp",
  "image/svg+xml": "svg",
  "application/pdf": "pdf",
  "text/plain": "txt",
  "application/json": "json",
  "application/zip": "zip"
};

function guessFileName(mime: string): string {
  return `decoded-file.${MIME_EXTENSIONS[mime] ?? "bin"}`;
}

function bytesToBlob(bytes: Uint8Array, type: string): Blob {
  return new Blob([bytes.slice().buffer as ArrayBuffer], { type });
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ── Base64 ──────────────────────────────────────────────────────────────────
function bytesToBase64(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.length; i++)
    binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}
function base64ToBytes(str: string): Uint8Array {
  const binary = atob(str);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

// ── Base32 ──────────────────────────────────────────────────────────────────
const B32_ALPHA = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

function bytesToBase32(bytes: Uint8Array): string {
  let bits = 0,
    value = 0,
    output = "";
  for (const byte of bytes) {
    value = (value << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      output += B32_ALPHA[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) output += B32_ALPHA[(value << (5 - bits)) & 31];
  while (output.length % 8 !== 0) output += "=";
  return output;
}

function base32ToBytes(str: string): Uint8Array {
  const clean = str.toUpperCase().replace(/=+$/, "").replace(/\s/g, "");
  let bits = 0,
    value = 0;
  const bytes: number[] = [];
  for (const char of clean) {
    const idx = B32_ALPHA.indexOf(char);
    if (idx === -1) throw new Error(`Invalid Base32 character: "${char}"`);
    value = (value << 5) | idx;
    bits += 5;
    if (bits >= 8) {
      bytes.push((value >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }
  return new Uint8Array(bytes);
}

// ── Base58 ──────────────────────────────────────────────────────────────────
const B58_ALPHA = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";

function bytesToBase58(bytes: Uint8Array): string {
  let leading = 0;
  for (const b of bytes) {
    if (b !== 0) break;
    leading++;
  }
  let num = BigInt(0);
  for (const b of bytes) num = num * 256n + BigInt(b);
  let result = "";
  while (num > 0n) {
    result = B58_ALPHA[Number(num % 58n)] + result;
    num = num / 58n;
  }
  return "1".repeat(leading) + result;
}

function base58ToBytes(str: string): Uint8Array {
  const clean = str.trim();
  let leading = 0;
  for (const c of clean) {
    if (c !== "1") break;
    leading++;
  }
  let num = BigInt(0);
  for (const c of clean) {
    const idx = B58_ALPHA.indexOf(c);
    if (idx === -1) throw new Error(`Invalid Base58 character: "${c}"`);
    num = num * 58n + BigInt(idx);
  }
  const bytes: number[] = [];
  while (num > 0n) {
    bytes.unshift(Number(num % 256n));
    num = num / 256n;
  }
  return new Uint8Array([...new Array(leading).fill(0), ...bytes]);
}

// ── Base16 / Hex ─────────────────────────────────────────────────────────────
function bytesToBase16(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function base16ToBytes(str: string): Uint8Array {
  const clean = str.replace(/\s/g, "");
  if (clean.length % 2 !== 0)
    throw new Error("Invalid hex: odd number of characters.");
  if (clean.length === 0) return new Uint8Array(0);
  const bytes = clean.match(/.{2}/g)!.map((b) => {
    const n = parseInt(b, 16);
    if (isNaN(n)) throw new Error(`Invalid hex byte: ${b}`);
    return n;
  });
  return new Uint8Array(bytes);
}

const ENCODE_BYTES: Record<Encoding, (bytes: Uint8Array) => string> = {
  base64: bytesToBase64,
  base32: bytesToBase32,
  base58: bytesToBase58,
  base16: bytesToBase16
};

const DECODE_BYTES: Record<Encoding, (str: string) => Uint8Array> = {
  base64: base64ToBytes,
  base32: base32ToBytes,
  base58: base58ToBytes,
  base16: base16ToBytes
};

function encodeText(str: string, encoding: Encoding): string {
  return ENCODE_BYTES[encoding](new TextEncoder().encode(str));
}

function decodeText(str: string, encoding: Encoding): string {
  return new TextDecoder().decode(DECODE_BYTES[encoding](str));
}

// ── Placeholders ─────────────────────────────────────────────────────────────
const PLACEHOLDERS: Record<Encoding, string> = {
  base64: "Enter text or Base64 string...",
  base32: "Enter text or Base32 string (e.g. JBSWY3DP...)...",
  base58: "Enter text or Base58 string...",
  base16: "Enter text or hex string (e.g. 48656c6c6f)..."
};

interface SourceFile {
  bytes: Uint8Array;
  name: string;
  type: string;
  size: number;
  previewUrl: string | null;
}

interface DecodedFile {
  bytes: Uint8Array;
  type: string;
  previewUrl: string | null;
}

const DATA_URI_RE = /^data:([^;,]+)(?:;charset=[^;,]+)?;base64,([\s\S]*)$/;

export default function BaseEncoderPage() {
  const { t } = useLanguage();
  const [encoding, setEncoding] = useToolState<Encoding>(
    "base-encoder",
    "encoding",
    "base64"
  );
  const [mode, setMode] = useToolState<Mode>("base-encoder", "mode", "text");
  const [direction, setDirection] = useState<FileDirection>("encode");
  const [input, setInput] = useToolState("base-encoder", "input", "");
  const [output, setOutput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [dataUri, setDataUri] = useState(false);

  const [sourceFile, setSourceFile] = useState<SourceFile | null>(null);
  const [decodedFile, setDecodedFile] = useState<DecodedFile | null>(null);
  const [downloadName, setDownloadName] = useState("");
  const [downloadMime, setDownloadMime] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const sourceFileRef = useRef(sourceFile);
  const decodedFileRef = useRef(decodedFile);

  useEffect(() => {
    sourceFileRef.current = sourceFile;
    decodedFileRef.current = decodedFile;
  }, [sourceFile, decodedFile]);

  useEffect(() => {
    return () => {
      if (sourceFileRef.current?.previewUrl)
        URL.revokeObjectURL(sourceFileRef.current.previewUrl);
      if (decodedFileRef.current?.previewUrl)
        URL.revokeObjectURL(decodedFileRef.current.previewUrl);
    };
  }, []);

  const runEncode = () => {
    try {
      setOutput(encodeText(input, encoding));
      setError(null);
    } catch (e) {
      setError((e as Error).message);
      setOutput("");
    }
  };

  const runDecode = () => {
    try {
      setOutput(decodeText(input, encoding));
      setError(null);
    } catch (e) {
      setError((e as Error).message);
      setOutput("");
    }
  };

  const processFile = async (file: File) => {
    if (file.size > MAX_FILE_SIZE) {
      setError(t.baseFileTooLarge);
      return;
    }
    const buf = await file.arrayBuffer();
    if (sourceFile?.previewUrl) URL.revokeObjectURL(sourceFile.previewUrl);
    const previewUrl = file.type.startsWith("image/")
      ? URL.createObjectURL(file)
      : null;
    setSourceFile({
      bytes: new Uint8Array(buf),
      name: file.name,
      type: file.type,
      size: file.size,
      previewUrl
    });
    setOutput("");
    setError(null);
  };

  const onFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (file) void processFile(file);
  };

  const onFileDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) void processFile(file);
  };

  const removeFile = () => {
    if (sourceFile?.previewUrl) URL.revokeObjectURL(sourceFile.previewUrl);
    setSourceFile(null);
    setOutput("");
    setError(null);
  };

  const runFileEncode = () => {
    if (!sourceFile) return;
    if (encoding === "base58" && sourceFile.size > MAX_BASE58_BYTES) {
      setError(t.baseBase58TooLarge);
      return;
    }
    try {
      let encoded = ENCODE_BYTES[encoding](sourceFile.bytes);
      if (encoding === "base64" && dataUri) {
        encoded = `data:${sourceFile.type || "application/octet-stream"};base64,${encoded}`;
      }
      setOutput(encoded);
      setError(null);
    } catch (e) {
      setError((e as Error).message);
      setOutput("");
    }
  };

  const runFileDecode = () => {
    const raw = input.trim();
    if (!raw) return;
    if (encoding === "base58" && raw.length > MAX_BASE58_TEXT_LENGTH) {
      setError(t.baseBase58TooLarge);
      return;
    }
    try {
      const match = raw.match(DATA_URI_RE);
      const mime = match ? match[1] : "application/octet-stream";
      const body = match ? match[2] : raw;
      const bytes = DECODE_BYTES[encoding](body);
      if (decodedFile?.previewUrl) URL.revokeObjectURL(decodedFile.previewUrl);
      const blob = bytesToBlob(bytes, mime);
      const previewUrl = mime.startsWith("image/")
        ? URL.createObjectURL(blob)
        : null;
      setDecodedFile({ bytes, type: mime, previewUrl });
      setDownloadMime(mime);
      setDownloadName((prev) => prev || guessFileName(mime));
      setError(null);
    } catch (e) {
      setError((e as Error).message);
      setDecodedFile(null);
    }
  };

  const downloadDecoded = () => {
    if (!decodedFile) return;
    const blob = bytesToBlob(
      decodedFile.bytes,
      downloadMime || "application/octet-stream"
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = downloadName.trim() || "decoded-file";
    a.click();
    URL.revokeObjectURL(url);
  };

  const switchMode = (next: Mode) => {
    if (next === mode) return;
    setMode(next);
    setOutput("");
    setError(null);
    removeFile();
    if (decodedFile?.previewUrl) URL.revokeObjectURL(decodedFile.previewUrl);
    setDecodedFile(null);
  };

  const switchDirection = (next: FileDirection) => {
    if (next === direction) return;
    setDirection(next);
    setInput("");
    setOutput("");
    setError(null);
  };

  const clear = () => {
    setInput("");
    setOutput("");
    setError(null);
    if (mode === "file") {
      if (direction === "encode") removeFile();
      else {
        if (decodedFile?.previewUrl)
          URL.revokeObjectURL(decodedFile.previewUrl);
        setDecodedFile(null);
      }
    }
  };

  const swap = () => {
    setInput(output);
    setOutput("");
    setError(null);
  };

  const copy = async () => {
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const showTextarea = mode === "text" || direction === "decode";
  const showFileResult = mode === "file" && direction === "decode";

  return (
    <div className="flex h-full flex-col gap-4 px-4 lg:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <Label htmlFor="base-encoding">Encoding</Label>
          <Select
            value={encoding}
            onValueChange={(v) => {
              setEncoding(v as Encoding);
              setOutput("");
              setError(null);
              if (decodedFile?.previewUrl)
                URL.revokeObjectURL(decodedFile.previewUrl);
              setDecodedFile(null);
            }}
          >
            <SelectTrigger id="base-encoding" className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ENCODINGS.map((e) => (
                <SelectItem key={e.value} value={e.value}>
                  {e.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <ToggleGroup
            type="single"
            variant="outline"
            size="sm"
            value={mode}
            onValueChange={(v) => v && switchMode(v as Mode)}
          >
            <ToggleGroupItem value="text">{t.baseModeText}</ToggleGroupItem>
            <ToggleGroupItem value="file">{t.baseModeFile}</ToggleGroupItem>
          </ToggleGroup>

          {mode === "file" && (
            <ToggleGroup
              type="single"
              variant="outline"
              size="sm"
              value={direction}
              onValueChange={(v) => v && switchDirection(v as FileDirection)}
            >
              <ToggleGroupItem value="encode">
                {t.baseDirectionEncode}
              </ToggleGroupItem>
              <ToggleGroupItem value="decode">
                {t.baseDirectionDecode}
              </ToggleGroupItem>
            </ToggleGroup>
          )}
        </div>

        <div className="flex gap-4">
          {mode === "text" ? (
            <>
              <Button size="lg" onClick={runEncode} disabled={!input}>
                {t.encode}
              </Button>
              <Button
                size="lg"
                variant="secondary"
                onClick={runDecode}
                disabled={!input}
              >
                {t.decode}
              </Button>
            </>
          ) : direction === "encode" ? (
            <Button size="lg" onClick={runFileEncode} disabled={!sourceFile}>
              {t.encode}
            </Button>
          ) : (
            <Button
              size="lg"
              variant="secondary"
              onClick={runFileDecode}
              disabled={!input.trim()}
            >
              {t.decode}
            </Button>
          )}
        </div>
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="flex min-h-0 flex-col gap-2">
          <div className="flex shrink-0 items-center justify-between">
            <span className="text-sm font-medium">Input</span>
            <Button
              size="sm"
              variant="ghost"
              onClick={clear}
              className="text-xs"
            >
              {t.clear}
            </Button>
          </div>

          {showTextarea ? (
            <textarea
              className="min-h-0 w-full flex-1 resize-none rounded-md border bg-background p-3 font-mono text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              placeholder={PLACEHOLDERS[encoding]}
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                setOutput("");
                setError(null);
              }}
              onKeyDown={(e) => handleTextareaTab(e, input, setInput)}
              spellCheck={false}
            />
          ) : (
            <div
              className="flex min-h-0 flex-1 flex-col items-center justify-center gap-3 rounded-md border border-dashed p-6 text-center"
              onDragOver={(e) => e.preventDefault()}
              onDrop={onFileDrop}
            >
              {sourceFile ? (
                <>
                  {sourceFile.previewUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={sourceFile.previewUrl}
                      alt={sourceFile.name}
                      className="max-h-40 rounded-md border object-contain"
                    />
                  ) : (
                    <FileIcon className="size-10 text-muted-foreground" />
                  )}
                  <div className="text-sm">
                    <p className="font-medium">{sourceFile.name}</p>
                    <p className="text-muted-foreground">
                      {formatBytes(sourceFile.size)}
                      {sourceFile.type ? ` · ${sourceFile.type}` : ""}
                    </p>
                  </div>
                  <Button size="sm" variant="outline" onClick={removeFile}>
                    {t.baseRemoveFile}
                  </Button>
                </>
              ) : (
                <>
                  <Upload className="size-8 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    {t.baseDropOrChoose}
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {t.baseChooseFile}
                  </Button>
                </>
              )}
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={onFileSelect}
              />
            </div>
          )}
        </div>

        <div className="flex min-h-0 flex-col gap-2">
          <div className="flex shrink-0 items-center justify-between">
            <span className="text-sm font-medium py-1.5">Output</span>
            <div className="flex items-center gap-3">
              {mode === "file" &&
                direction === "encode" &&
                encoding === "base64" && (
                  <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Checkbox
                      checked={dataUri}
                      onCheckedChange={(c) => setDataUri(c === true)}
                    />
                    {t.baseDataUri}
                  </label>
                )}
              {mode === "text" && output && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={swap}
                  className="text-xs"
                >
                  {t.swap}
                </Button>
              )}
              {!showFileResult && (
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
              )}
            </div>
          </div>

          {error ? (
            <div className="min-h-0 flex-1 overflow-auto rounded-md border border-destructive bg-destructive/10 p-3 font-mono text-sm text-destructive">
              {error}
            </div>
          ) : showFileResult ? (
            decodedFile ? (
              <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-auto rounded-md border bg-muted p-4">
                {decodedFile.previewUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={decodedFile.previewUrl}
                    alt={downloadName}
                    className="max-h-40 self-center rounded-md border object-contain"
                  />
                )}
                <div className="flex flex-col gap-1.5">
                  <Label className="text-xs">{t.baseFileName}</Label>
                  <Input
                    value={downloadName}
                    onChange={(e) => setDownloadName(e.target.value)}
                    className="font-mono text-sm"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label className="text-xs">{t.baseMimeType}</Label>
                  <Input
                    value={downloadMime}
                    onChange={(e) => setDownloadMime(e.target.value)}
                    className="font-mono text-sm"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  {formatBytes(decodedFile.bytes.length)}
                </p>
                <Button onClick={downloadDecoded} className="w-fit gap-2">
                  <Download className="size-4" />
                  {t.baseDownload}
                </Button>
              </div>
            ) : (
              <div className="flex min-h-0 flex-1 items-center justify-center rounded-md border border-dashed text-sm text-muted-foreground">
                {t.outputPlaceholder}
              </div>
            )
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
