"use client";

import { Download } from "lucide-react";
import QRCode from "qrcode";
import { useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { useLanguage } from "@/contexts/language-context";
import { useToolState } from "@/hooks/use-tool-state";

type ErrorLevel = "L" | "M" | "Q" | "H";
type QrSize = "200" | "300" | "400" | "600";

const ERROR_LEVELS: { value: ErrorLevel; label: string }[] = [
  { value: "L", label: "L — 7%" },
  { value: "M", label: "M — 15%" },
  { value: "Q", label: "Q — 25%" },
  { value: "H", label: "H — 30%" }
];

const SIZES: { value: QrSize; label: string }[] = [
  { value: "200", label: "200 x 200" },
  { value: "300", label: "300 x 300" },
  { value: "400", label: "400 x 400" },
  { value: "600", label: "600 x 600" }
];

export default function QrGeneratorPage() {
  const { t } = useLanguage();
  const [text, setText] = useToolState("qr-generator", "text", "");
  const [errorLevel, setErrorLevel] = useToolState<ErrorLevel>(
    "qr-generator",
    "errorLevel",
    "M"
  );
  const [size, setSize] = useToolState<QrSize>("qr-generator", "size", "300");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hasOutput, setHasOutput] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = async (
    currentText = text,
    currentErrorLevel = errorLevel,
    currentSize = size
  ) => {
    if (!currentText.trim() || !canvasRef.current) return;
    try {
      await QRCode.toCanvas(canvasRef.current, currentText, {
        width: Number(currentSize),
        errorCorrectionLevel: currentErrorLevel,
        margin: 2
      });
      setHasOutput(true);
      setError(null);
    } catch (e) {
      setError((e as Error).message);
      setHasOutput(false);
    }
  };

  const download = () => {
    if (!canvasRef.current) return;
    const link = document.createElement("a");
    link.download = "qrcode.png";
    link.href = canvasRef.current.toDataURL("image/png");
    link.click();
  };

  const clear = () => {
    setText("");
    setHasOutput(false);
    setError(null);
    const ctx = canvasRef.current?.getContext("2d");
    if (ctx && canvasRef.current) {
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
  };

  return (
    <div className="flex flex-col gap-6 px-4 lg:px-6">
      <div className="flex max-w-xl flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label className="mb-1">{t.qrInputLabel}</Label>
          <Input
            placeholder={t.qrInputPlaceholder}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && generate()}
          />
        </div>

        <div className="flex flex-wrap gap-4">
          <div className="flex flex-col gap-1.5">
            <Label className="mb-1">{t.qrErrorLevel}</Label>
            <Select
              value={errorLevel}
              onValueChange={(v) => setErrorLevel(v as ErrorLevel)}
            >
              <SelectTrigger className="w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ERROR_LEVELS.map((l) => (
                  <SelectItem key={l.value} value={l.value}>
                    {l.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label className="mb-1">{t.qrSize}</Label>
            <Select value={size} onValueChange={(v) => setSize(v as QrSize)}>
              <SelectTrigger className="w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SIZES.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex gap-3">
          <Button size="lg" onClick={() => generate()} disabled={!text.trim()}>
            {t.generate}
          </Button>
          <Button size="lg" variant="ghost" onClick={clear}>
            {t.clear}
          </Button>
        </div>
      </div>

      {error && (
        <div className="max-w-xl rounded-md border border-destructive bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="flex flex-col gap-3">
        <canvas
          ref={canvasRef}
          className={`rounded-md border ${hasOutput ? "" : "hidden"}`}
        />
        {hasOutput && (
          <Button variant="secondary" className="w-fit" onClick={download}>
            <Download className="mr-2 size-4" />
            {t.qrDownload}
          </Button>
        )}
      </div>
    </div>
  );
}
