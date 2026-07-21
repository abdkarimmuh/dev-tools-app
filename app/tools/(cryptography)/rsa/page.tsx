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

function ab2b64(buf: ArrayBuffer): string {
  return btoa(String.fromCharCode(...new Uint8Array(buf)));
}

function b642ab(b64: string): ArrayBuffer {
  const clean = b64.replace(/-----[^-]+-----/g, "").replace(/\s/g, "");
  const binary = atob(clean);
  const buf = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) buf[i] = binary.charCodeAt(i);
  return buf.buffer;
}

function toPem(b64: string, type: "PUBLIC KEY" | "PRIVATE KEY"): string {
  const chunks = b64.match(/.{1,64}/g)?.join("\n") ?? b64;
  return `-----BEGIN ${type}-----\n${chunks}\n-----END ${type}-----`;
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
      setPublicKeyPem(toPem(ab2b64(pubBuf), "PUBLIC KEY"));
      setPrivateKeyPem(toPem(ab2b64(privBuf), "PRIVATE KEY"));
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
      const key = await crypto.subtle.importKey(
        "spki",
        b642ab(publicKeyPem),
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
      const key = await crypto.subtle.importKey(
        "pkcs8",
        b642ab(privateKeyPem),
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
