"use client"

import { Check, Copy, RefreshCw } from "lucide-react"
import { useState } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { useLanguage } from "@/contexts/language-context"
import { useToolState } from "@/hooks/use-tool-state"

type Curve = "P-256" | "P-384"

function ab2b64(buf: ArrayBuffer): string {
  return btoa(String.fromCharCode(...new Uint8Array(buf)))
}

function b642ab(b64: string): ArrayBuffer {
  const clean = b64.replace(/-----[^-]+-----/g, "").replace(/\s/g, "")
  const binary = atob(clean)
  const buf = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) buf[i] = binary.charCodeAt(i)
  return buf.buffer
}

function toPem(b64: string, type: "PUBLIC KEY" | "PRIVATE KEY"): string {
  const chunks = b64.match(/.{1,64}/g)?.join("\n") ?? b64
  return `-----BEGIN ${type}-----\n${chunks}\n-----END ${type}-----`
}

function CopyBtn({ text }: { text: string }) {
  const { t } = useLanguage()
  const [copied, setCopied] = useState(false)
  const handle = async () => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }
  return (
    <Button size="sm" variant="ghost" onClick={handle} disabled={!text} className="gap-1 text-xs">
      {copied ? <Check className="size-3" /> : <Copy className="size-3" />}
      {copied ? t.copied : t.copy}
    </Button>
  )
}

export default function EcdsaPage() {
  const { t } = useLanguage()
  const [curve, setCurve] = useToolState<Curve>("ecdsa", "curve", "P-256")
  const [publicKeyPem, setPublicKeyPem] = useToolState("ecdsa", "publicKey", "")
  const [privateKeyPem, setPrivateKeyPem] = useToolState("ecdsa", "privateKey", "")
  const [generating, setGenerating] = useState(false)

  const [signMessage, setSignMessage] = useState("")
  const [signature, setSignature] = useState("")
  const [signError, setSignError] = useState<string | null>(null)
  const [signLoading, setSignLoading] = useState(false)

  const [verifyMessage, setVerifyMessage] = useState("")
  const [verifySig, setVerifySig] = useState("")
  const [verifyResult, setVerifyResult] = useState<boolean | null>(null)
  const [verifyError, setVerifyError] = useState<string | null>(null)
  const [verifyLoading, setVerifyLoading] = useState(false)

  const hashAlgo = "SHA-256"

  const generateKeys = async () => {
    setGenerating(true)
    try {
      const kp = await crypto.subtle.generateKey(
        { name: "ECDSA", namedCurve: curve },
        true,
        ["sign", "verify"]
      )
      const pubBuf = await crypto.subtle.exportKey("spki", kp.publicKey)
      const privBuf = await crypto.subtle.exportKey("pkcs8", kp.privateKey)
      setPublicKeyPem(toPem(ab2b64(pubBuf), "PUBLIC KEY"))
      setPrivateKeyPem(toPem(ab2b64(privBuf), "PRIVATE KEY"))
    } catch (e) {
      console.error(e)
    } finally {
      setGenerating(false)
    }
  }

  const sign = async () => {
    if (!signMessage || !privateKeyPem) return
    setSignLoading(true)
    setSignError(null)
    try {
      const key = await crypto.subtle.importKey(
        "pkcs8",
        b642ab(privateKeyPem),
        { name: "ECDSA", namedCurve: curve },
        false,
        ["sign"]
      )
      const sig = await crypto.subtle.sign(
        { name: "ECDSA", hash: hashAlgo },
        key,
        new TextEncoder().encode(signMessage)
      )
      setSignature(ab2b64(sig))
    } catch (e) {
      setSignError((e as Error).message)
      setSignature("")
    } finally {
      setSignLoading(false)
    }
  }

  const verify = async () => {
    if (!verifyMessage || !verifySig || !publicKeyPem) return
    setVerifyLoading(true)
    setVerifyError(null)
    setVerifyResult(null)
    try {
      const key = await crypto.subtle.importKey(
        "spki",
        b642ab(publicKeyPem),
        { name: "ECDSA", namedCurve: curve },
        false,
        ["verify"]
      )
      const valid = await crypto.subtle.verify(
        { name: "ECDSA", hash: hashAlgo },
        key,
        b642ab(verifySig),
        new TextEncoder().encode(verifyMessage)
      )
      setVerifyResult(valid)
    } catch (e) {
      setVerifyError((e as Error).message)
    } finally {
      setVerifyLoading(false)
    }
  }

  return (
    <div className="px-4 lg:px-6">
      <Tabs defaultValue="keys">
        <TabsList>
          <TabsTrigger value="keys">{t.rsaKeys}</TabsTrigger>
          <TabsTrigger value="sign">{t.ecdsaSign}</TabsTrigger>
          <TabsTrigger value="verify">{t.ecdsaVerify}</TabsTrigger>
        </TabsList>

        {/* ── Keys ── */}
        <TabsContent value="keys">
          <div className="flex flex-col gap-4 pt-4">
            <div className="flex flex-wrap items-end gap-3">
              <div className="flex flex-col gap-1.5">
                <Label>{t.ecdsaCurve}</Label>
                <Select value={curve} onValueChange={(v) => setCurve(v as Curve)}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="P-256">P-256</SelectItem>
                    <SelectItem value="P-384">P-384</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={generateKeys} disabled={generating}>
                <RefreshCw className={`mr-2 size-4 ${generating ? "animate-spin" : ""}`} />
                {generating ? t.rsaGenerating : t.rsaGenerate}
              </Button>
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <Label>{t.rsaPublicKey}</Label>
                  <CopyBtn text={publicKeyPem} />
                </div>
                <textarea
                  className="h-48 w-full resize-none rounded-md border bg-muted p-3 font-mono text-xs outline-none"
                  value={publicKeyPem}
                  onChange={(e) => setPublicKeyPem(e.target.value)}
                  placeholder="-----BEGIN PUBLIC KEY-----"
                  spellCheck={false}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <Label>{t.rsaPrivateKey}</Label>
                  <CopyBtn text={privateKeyPem} />
                </div>
                <textarea
                  className="h-48 w-full resize-none rounded-md border bg-muted p-3 font-mono text-xs outline-none"
                  value={privateKeyPem}
                  onChange={(e) => setPrivateKeyPem(e.target.value)}
                  placeholder="-----BEGIN PRIVATE KEY-----"
                  spellCheck={false}
                />
              </div>
            </div>
          </div>
        </TabsContent>

        {/* ── Sign ── */}
        <TabsContent value="sign">
          <div className="flex flex-col gap-4 pt-4">
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <Label>{t.rsaPrivateKey}</Label>
                {!privateKeyPem && (
                  <Badge variant="destructive" className="text-xs">{t.rsaNoKey}</Badge>
                )}
              </div>
              <textarea
                className="h-24 w-full resize-none rounded-md border bg-muted p-3 font-mono text-xs outline-none"
                value={privateKeyPem}
                onChange={(e) => setPrivateKeyPem(e.target.value)}
                placeholder="-----BEGIN PRIVATE KEY-----"
                spellCheck={false}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <div className="flex flex-col gap-2">
                <span className="text-sm font-medium">{t.ecdsaMessage}</span>
                <textarea
                  className="h-52 w-full resize-none rounded-md border bg-background p-3 font-mono text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  placeholder={t.ecdsaMessagePlaceholder}
                  value={signMessage}
                  onChange={(e) => setSignMessage(e.target.value)}
                  spellCheck={false}
                />
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{t.ecdsaSignature}</span>
                  <CopyBtn text={signature} />
                </div>
                {signError ? (
                  <div className="flex h-52 items-start overflow-auto rounded-md border border-destructive bg-destructive/10 p-3 font-mono text-sm text-destructive">
                    {signError}
                  </div>
                ) : (
                  <textarea
                    readOnly
                    className="h-52 w-full resize-none rounded-md border bg-muted p-3 font-mono text-sm outline-none"
                    value={signature}
                    placeholder={t.outputPlaceholder}
                    spellCheck={false}
                  />
                )}
              </div>
            </div>

            <Button
              size="lg"
              onClick={sign}
              disabled={!signMessage || !privateKeyPem || signLoading}
              className="w-fit"
            >
              {signLoading ? t.rsaGenerating : t.ecdsaSign}
            </Button>
          </div>
        </TabsContent>

        {/* ── Verify ── */}
        <TabsContent value="verify">
          <div className="flex flex-col gap-4 pt-4">
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <Label>{t.rsaPublicKey}</Label>
                {!publicKeyPem && (
                  <Badge variant="destructive" className="text-xs">{t.rsaNoKey}</Badge>
                )}
              </div>
              <textarea
                className="h-24 w-full resize-none rounded-md border bg-muted p-3 font-mono text-xs outline-none"
                value={publicKeyPem}
                onChange={(e) => setPublicKeyPem(e.target.value)}
                placeholder="-----BEGIN PUBLIC KEY-----"
                spellCheck={false}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <div className="flex flex-col gap-2">
                <span className="text-sm font-medium">{t.ecdsaMessage}</span>
                <textarea
                  className="h-36 w-full resize-none rounded-md border bg-background p-3 font-mono text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  placeholder={t.ecdsaMessagePlaceholder}
                  value={verifyMessage}
                  onChange={(e) => { setVerifyMessage(e.target.value); setVerifyResult(null) }}
                  spellCheck={false}
                />
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-sm font-medium">{t.ecdsaSignature}</span>
                <textarea
                  className="h-36 w-full resize-none rounded-md border bg-background p-3 font-mono text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  placeholder={t.ecdsaSignaturePlaceholder}
                  value={verifySig}
                  onChange={(e) => { setVerifySig(e.target.value); setVerifyResult(null) }}
                  spellCheck={false}
                />
              </div>
            </div>

            {verifyError && (
              <div className="rounded-md border border-destructive bg-destructive/10 p-3 font-mono text-sm text-destructive">
                {verifyError}
              </div>
            )}

            {verifyResult !== null && !verifyError && (
              <Badge
                variant={verifyResult ? "secondary" : "destructive"}
                className="w-fit text-sm py-1 px-3"
              >
                {verifyResult ? t.ecdsaValid : t.ecdsaInvalid}
              </Badge>
            )}

            <Button
              size="lg"
              onClick={verify}
              disabled={!verifyMessage || !verifySig || !publicKeyPem || verifyLoading}
              className="w-fit"
            >
              {verifyLoading ? t.rsaGenerating : t.ecdsaVerify}
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
