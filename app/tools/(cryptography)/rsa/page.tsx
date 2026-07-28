"use client";

import { Check, Copy, Download, RefreshCw } from "lucide-react";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useLanguage } from "@/contexts/language-context";
import { useToolState } from "@/hooks/use-tool-state";
import { handleTextareaTab } from "@/lib/utils";

type Mode = "keys" | "encrypt" | "decrypt";
type PkcsFormat = "pkcs1" | "pkcs8";
type PemType =
  | "PUBLIC KEY"
  | "PRIVATE KEY"
  | "RSA PUBLIC KEY"
  | "RSA PRIVATE KEY";

function ab2b64(buf: ArrayBuffer | Uint8Array): string {
  const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
  return btoa(String.fromCharCode(...bytes));
}

function b642ab(b64: string): Uint8Array<ArrayBuffer> {
  const clean = b64.replace(/-----[^-]+-----/g, "").replace(/\s/g, "");
  const binary = atob(clean);
  const buf = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) buf[i] = binary.charCodeAt(i);
  return buf;
}

function toPem(b64: string, type: PemType): string {
  const chunks = b64.match(/.{1,64}/g)?.join("\n") ?? b64;
  return `-----BEGIN ${type}-----\n${chunks}\n-----END ${type}-----`;
}

function pemHeaderType(pem: string): string {
  return pem.match(/-----BEGIN ([^-]+)-----/)?.[1].trim() ?? "";
}

// Minimal ASN.1 DER helpers to convert between PKCS#8/SPKI (Web Crypto's
// only supported import/export formats) and traditional PKCS#1.
const RSA_ALGORITHM_ID = Uint8Array.from([
  0x30, 0x0d, 0x06, 0x09, 0x2a, 0x86, 0x48, 0x86, 0xf7, 0x0d, 0x01, 0x01, 0x01,
  0x05, 0x00
]);

function derReadLength(
  bytes: Uint8Array,
  offset: number
): { length: number; nextOffset: number } {
  const first = bytes[offset];
  if ((first & 0x80) === 0) return { length: first, nextOffset: offset + 1 };
  const numBytes = first & 0x7f;
  let length = 0;
  for (let i = 0; i < numBytes; i++) {
    length = (length << 8) | bytes[offset + 1 + i];
  }
  return { length, nextOffset: offset + 1 + numBytes };
}

function derEncodeLength(length: number): number[] {
  if (length < 0x80) return [length];
  const bytes: number[] = [];
  let len = length;
  while (len > 0) {
    bytes.unshift(len & 0xff);
    len >>= 8;
  }
  return [0x80 | bytes.length, ...bytes];
}

function derReadTLV(bytes: Uint8Array, offset: number) {
  const tag = bytes[offset];
  const { length, nextOffset } = derReadLength(bytes, offset + 1);
  const valueStart = nextOffset;
  const valueEnd = nextOffset + length;
  return { tag, valueStart, valueEnd, totalEnd: valueEnd };
}

function derChildren(bytes: Uint8Array, start: number, end: number) {
  const children: ReturnType<typeof derReadTLV>[] = [];
  let offset = start;
  while (offset < end) {
    const tlv = derReadTLV(bytes, offset);
    children.push(tlv);
    offset = tlv.totalEnd;
  }
  return children;
}

function derEncodeTLV(tag: number, value: Uint8Array): Uint8Array<ArrayBuffer> {
  const lengthBytes = Uint8Array.from(derEncodeLength(value.length));
  const out = new Uint8Array(1 + lengthBytes.length + value.length);
  out[0] = tag;
  out.set(lengthBytes, 1);
  out.set(value, 1 + lengthBytes.length);
  return out;
}

// PKCS#8 PrivateKeyInfo ::= SEQUENCE { version, algorithm, privateKey OCTET STRING }
// The OCTET STRING content is the raw PKCS#1 RSAPrivateKey DER.
function pkcs8ToPkcs1Private(pkcs8: Uint8Array): Uint8Array {
  const outer = derReadTLV(pkcs8, 0);
  const [, , privateKeyOctetString] = derChildren(
    pkcs8,
    outer.valueStart,
    outer.valueEnd
  );
  return pkcs8.slice(
    privateKeyOctetString.valueStart,
    privateKeyOctetString.valueEnd
  );
}

function pkcs1ToPkcs8Private(pkcs1: Uint8Array): Uint8Array<ArrayBuffer> {
  const version = derEncodeTLV(0x02, Uint8Array.from([0x00]));
  const privateKey = derEncodeTLV(0x04, pkcs1);
  const body = new Uint8Array(
    version.length + RSA_ALGORITHM_ID.length + privateKey.length
  );
  body.set(version, 0);
  body.set(RSA_ALGORITHM_ID, version.length);
  body.set(privateKey, version.length + RSA_ALGORITHM_ID.length);
  return derEncodeTLV(0x30, body);
}

// SPKI SubjectPublicKeyInfo ::= SEQUENCE { algorithm, subjectPublicKey BIT STRING }
// The BIT STRING content is a leading unused-bits byte (0x00) followed by
// the raw PKCS#1 RSAPublicKey DER.
function spkiToPkcs1Public(spki: Uint8Array): Uint8Array {
  const outer = derReadTLV(spki, 0);
  const [, subjectPublicKeyBitString] = derChildren(
    spki,
    outer.valueStart,
    outer.valueEnd
  );
  return spki.slice(
    subjectPublicKeyBitString.valueStart + 1,
    subjectPublicKeyBitString.valueEnd
  );
}

function pkcs1ToSpkiPublic(pkcs1: Uint8Array): Uint8Array<ArrayBuffer> {
  const bitStringValue = new Uint8Array(pkcs1.length + 1);
  bitStringValue.set(pkcs1, 1);
  const bitString = derEncodeTLV(0x03, bitStringValue);
  const body = new Uint8Array(RSA_ALGORITHM_ID.length + bitString.length);
  body.set(RSA_ALGORITHM_ID, 0);
  body.set(bitString, RSA_ALGORITHM_ID.length);
  return derEncodeTLV(0x30, body);
}

function DownloadBtn({ text, filename }: { text: string; filename: string }) {
  const handle = () => {
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };
  return (
    <Button
      size="sm"
      variant="ghost"
      onClick={handle}
      disabled={!text}
      className="gap-1 text-xs"
    >
      <Download className="size-3" />
      Download
    </Button>
  );
}

function CopyBtn({ text }: { text: string }) {
  const { t } = useLanguage();
  const [copied, setCopied] = useState(false);
  const handle = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <Button
      size="sm"
      variant="ghost"
      onClick={handle}
      disabled={!text}
      className="gap-1 text-xs"
    >
      {copied ? <Check className="size-3" /> : <Copy className="size-3" />}
      {copied ? t.copied : t.copy}
    </Button>
  );
}

export default function RsaPage() {
  const { t } = useLanguage();
  const [mode, setMode] = useState<Mode>("keys");
  const [publicKeyPem, setPublicKeyPem] = useToolState("rsa", "publicKey", "");
  const [privateKeyPem, setPrivateKeyPem] = useToolState(
    "rsa",
    "privateKey",
    ""
  );
  const [keySize, setKeySize] = useState<"1024" | "2048" | "4096">("2048");
  const [pkcsFormat, setPkcsFormat] = useState<PkcsFormat>("pkcs8");
  const [generating, setGenerating] = useState(false);

  const [encInput, setEncInput] = useState("");
  const [encOutput, setEncOutput] = useState("");
  const [encError, setEncError] = useState<string | null>(null);
  const [encLoading, setEncLoading] = useState(false);

  const [decInput, setDecInput] = useState("");
  const [decOutput, setDecOutput] = useState("");
  const [decError, setDecError] = useState<string | null>(null);
  const [decLoading, setDecLoading] = useState(false);

  const generateKeys = async () => {
    setGenerating(true);
    try {
      const kp = await crypto.subtle.generateKey(
        {
          name: "RSA-OAEP",
          modulusLength: Number(keySize),
          publicExponent: new Uint8Array([1, 0, 1]),
          hash: "SHA-256"
        },
        true,
        ["encrypt", "decrypt"]
      );
      const pubBuf = await crypto.subtle.exportKey("spki", kp.publicKey);
      const privBuf = await crypto.subtle.exportKey("pkcs8", kp.privateKey);
      if (pkcsFormat === "pkcs1") {
        const pubPkcs1 = spkiToPkcs1Public(new Uint8Array(pubBuf));
        const privPkcs1 = pkcs8ToPkcs1Private(new Uint8Array(privBuf));
        setPublicKeyPem(toPem(ab2b64(pubPkcs1), "RSA PUBLIC KEY"));
        setPrivateKeyPem(toPem(ab2b64(privPkcs1), "RSA PRIVATE KEY"));
      } else {
        setPublicKeyPem(toPem(ab2b64(pubBuf), "PUBLIC KEY"));
        setPrivateKeyPem(toPem(ab2b64(privBuf), "PRIVATE KEY"));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setGenerating(false);
    }
  };

  const encrypt = async () => {
    if (!encInput || !publicKeyPem) return;
    setEncLoading(true);
    setEncError(null);
    try {
      let spki = b642ab(publicKeyPem);
      if (pemHeaderType(publicKeyPem) === "RSA PUBLIC KEY") {
        spki = pkcs1ToSpkiPublic(spki);
      }
      const key = await crypto.subtle.importKey(
        "spki",
        spki,
        { name: "RSA-OAEP", hash: "SHA-256" },
        false,
        ["encrypt"]
      );
      const enc = await crypto.subtle.encrypt(
        { name: "RSA-OAEP" },
        key,
        new TextEncoder().encode(encInput)
      );
      setEncOutput(ab2b64(enc));
    } catch (e) {
      setEncError((e as Error).message);
      setEncOutput("");
    } finally {
      setEncLoading(false);
    }
  };

  const decrypt = async () => {
    if (!decInput || !privateKeyPem) return;
    setDecLoading(true);
    setDecError(null);
    try {
      let pkcs8 = b642ab(privateKeyPem);
      if (pemHeaderType(privateKeyPem) === "RSA PRIVATE KEY") {
        pkcs8 = pkcs1ToPkcs8Private(pkcs8);
      }
      const key = await crypto.subtle.importKey(
        "pkcs8",
        pkcs8,
        { name: "RSA-OAEP", hash: "SHA-256" },
        false,
        ["decrypt"]
      );
      const dec = await crypto.subtle.decrypt(
        { name: "RSA-OAEP" },
        key,
        b642ab(decInput)
      );
      setDecOutput(new TextDecoder().decode(dec));
    } catch (e) {
      setDecError((e as Error).message);
      setDecOutput("");
    } finally {
      setDecLoading(false);
    }
  };

  return (
    <div className="flex h-full flex-col gap-4 px-4 lg:px-6">
      {/* Top bar */}
      <div className="flex shrink-0 items-end justify-between gap-4">
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex flex-col gap-1.5">
            <Label className="mb-1">Mode</Label>
            <Select value={mode} onValueChange={(v) => setMode(v as Mode)}>
              <SelectTrigger className="w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="keys">{t.rsaKeys}</SelectItem>
                <SelectItem value="encrypt">{t.cryptoEncrypt}</SelectItem>
                <SelectItem value="decrypt">{t.cryptoDecrypt}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {mode === "keys" && (
            <div className="flex flex-col gap-1.5">
              <Label className="mb-1">{t.rsaKeySize}</Label>
              <Select
                value={keySize}
                onValueChange={(v) => setKeySize(v as typeof keySize)}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1024">1024-bit</SelectItem>
                  <SelectItem value="2048">2048-bit</SelectItem>
                  <SelectItem value="4096">4096-bit</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {mode === "keys" && (
            <div className="flex flex-col gap-1.5">
              <Label className="mb-1">{t.rsaPkcsFormat}</Label>
              <Select
                value={pkcsFormat}
                onValueChange={(v) => setPkcsFormat(v as PkcsFormat)}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pkcs1">PKCS#1</SelectItem>
                  <SelectItem value="pkcs8">PKCS#8</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {mode === "keys" && (
          <Button onClick={generateKeys} disabled={generating}>
            <RefreshCw
              className={`mr-2 size-4 ${generating ? "animate-spin" : ""}`}
            />
            {generating ? t.rsaGenerating : t.rsaGenerate}
          </Button>
        )}
        {mode === "encrypt" && (
          <Button
            size="lg"
            onClick={encrypt}
            disabled={!encInput || !publicKeyPem || encLoading}
          >
            {encLoading ? t.rsaGenerating : t.cryptoEncrypt}
          </Button>
        )}
        {mode === "decrypt" && (
          <Button
            size="lg"
            onClick={decrypt}
            disabled={!decInput || !privateKeyPem || decLoading}
          >
            {decLoading ? t.rsaGenerating : t.cryptoDecrypt}
          </Button>
        )}
      </div>

      {/* Keys mode */}
      {mode === "keys" && (
        <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="flex min-h-0 flex-col gap-1.5">
            <div className="flex shrink-0 items-center justify-between">
              <Label>{t.rsaPublicKey}</Label>
              <div className="flex items-center gap-1">
                <DownloadBtn text={publicKeyPem} filename="public_key.pem" />
                <CopyBtn text={publicKeyPem} />
              </div>
            </div>
            <Textarea
              className="bg-muted min-h-0 w-full flex-1 resize-none font-mono text-xs"
              value={publicKeyPem}
              onChange={(e) => setPublicKeyPem(e.target.value)}
              onKeyDown={(e) =>
                handleTextareaTab(e, publicKeyPem, setPublicKeyPem)
              }
              placeholder="-----BEGIN PUBLIC KEY-----"
              spellCheck={false}
            />
          </div>
          <div className="flex min-h-0 flex-col gap-1.5">
            <div className="flex shrink-0 items-center justify-between">
              <Label>{t.rsaPrivateKey}</Label>
              <div className="flex items-center gap-1">
                <DownloadBtn text={privateKeyPem} filename="private_key.pem" />
                <CopyBtn text={privateKeyPem} />
              </div>
            </div>
            <Textarea
              className="bg-muted min-h-0 w-full flex-1 resize-none font-mono text-xs"
              value={privateKeyPem}
              onChange={(e) => setPrivateKeyPem(e.target.value)}
              onKeyDown={(e) =>
                handleTextareaTab(e, privateKeyPem, setPrivateKeyPem)
              }
              placeholder="-----BEGIN PRIVATE KEY-----"
              spellCheck={false}
            />
          </div>
        </div>
      )}

      {/* Encrypt mode */}
      {mode === "encrypt" && (
        <div className="flex min-h-0 flex-1 flex-col gap-4">
          <div className="flex shrink-0 flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <Label className="mb-1">{t.rsaPublicKey}</Label>
              {!publicKeyPem && (
                <Badge variant="destructive" className="text-xs">
                  {t.rsaNoKey}
                </Badge>
              )}
            </div>
            <Textarea
              className="bg-muted h-24 w-full resize-none font-mono text-xs"
              value={publicKeyPem}
              onChange={(e) => setPublicKeyPem(e.target.value)}
              onKeyDown={(e) =>
                handleTextareaTab(e, publicKeyPem, setPublicKeyPem)
              }
              placeholder="-----BEGIN PUBLIC KEY-----"
              spellCheck={false}
            />
          </div>
          <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 lg:grid-cols-2">
            <div className="flex min-h-0 flex-col gap-2">
              <span className="shrink-0 py-1.5 text-sm font-medium">
                Plaintext
              </span>
              <Textarea
                className="min-h-0 w-full flex-1 resize-none font-mono text-sm"
                placeholder={t.rsaPlaintextPlaceholder}
                value={encInput}
                onChange={(e) => setEncInput(e.target.value)}
                onKeyDown={(e) => handleTextareaTab(e, encInput, setEncInput)}
                spellCheck={false}
              />
            </div>
            <div className="flex min-h-0 flex-col gap-2">
              <div className="flex shrink-0 items-center justify-between">
                <span className="text-sm font-medium">Ciphertext (Base64)</span>
                <CopyBtn text={encOutput} />
              </div>
              {encError ? (
                <div className="border-destructive bg-destructive/10 text-destructive min-h-0 flex-1 overflow-auto rounded-md border p-3 font-mono text-sm">
                  {encError}
                </div>
              ) : (
                <Textarea
                  readOnly
                  className="bg-muted min-h-0 w-full flex-1 resize-none font-mono text-sm"
                  value={encOutput}
                  placeholder={t.outputPlaceholder}
                  spellCheck={false}
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Decrypt mode */}
      {mode === "decrypt" && (
        <div className="flex min-h-0 flex-1 flex-col gap-4">
          <div className="flex shrink-0 flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <Label className="mb-1">{t.rsaPrivateKey}</Label>
              {!privateKeyPem && (
                <Badge variant="destructive" className="text-xs">
                  {t.rsaNoKey}
                </Badge>
              )}
            </div>
            <Textarea
              className="bg-muted h-24 w-full resize-none font-mono text-xs"
              value={privateKeyPem}
              onChange={(e) => setPrivateKeyPem(e.target.value)}
              onKeyDown={(e) =>
                handleTextareaTab(e, privateKeyPem, setPrivateKeyPem)
              }
              placeholder="-----BEGIN PRIVATE KEY-----"
              spellCheck={false}
            />
          </div>
          <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 lg:grid-cols-2">
            <div className="flex min-h-0 flex-col gap-2">
              <span className="shrink-0 py-1.5 text-sm font-medium">
                Ciphertext (Base64)
              </span>
              <Textarea
                className="min-h-0 w-full flex-1 resize-none font-mono text-sm"
                placeholder={t.rsaCiphertextPlaceholder}
                value={decInput}
                onChange={(e) => setDecInput(e.target.value)}
                onKeyDown={(e) => handleTextareaTab(e, decInput, setDecInput)}
                spellCheck={false}
              />
            </div>
            <div className="flex min-h-0 flex-col gap-2">
              <div className="flex shrink-0 items-center justify-between">
                <span className="text-sm font-medium">Plaintext</span>
                <CopyBtn text={decOutput} />
              </div>
              {decError ? (
                <div className="border-destructive bg-destructive/10 text-destructive min-h-0 flex-1 overflow-auto rounded-md border p-3 font-mono text-sm">
                  {decError}
                </div>
              ) : (
                <Textarea
                  readOnly
                  className="bg-muted min-h-0 w-full flex-1 resize-none font-mono text-sm"
                  value={decOutput}
                  placeholder={t.outputPlaceholder}
                  spellCheck={false}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
