"use client";

import { Check, Copy, RefreshCw } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { CHARSETS } from "@/constants/generators/password-generator";
import { useLanguage } from "@/contexts/language-context";
import { useToolState } from "@/hooks/use-tool-state";

function generatePassword(
  length: number,
  opts: { upper: boolean; lower: boolean; numbers: boolean; symbols: boolean }
): string {
  const charset = [
    opts.upper ? CHARSETS.upper : "",
    opts.lower ? CHARSETS.lower : "",
    opts.numbers ? CHARSETS.numbers : "",
    opts.symbols ? CHARSETS.symbols : ""
  ].join("");

  if (!charset) return "";

  const array = new Uint32Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, (n) => charset[n % charset.length]).join("");
}

export default function PasswordGeneratorPage() {
  const { t } = useLanguage();
  const [length, setLength] = useToolState("password-generator", "length", 16);
  const [opts, setOpts] = useToolState("password-generator", "opts", {
    upper: true,
    lower: true,
    numbers: true,
    symbols: false
  });
  const [password, setPassword] = useState("");
  const [copied, setCopied] = useState(false);

  const getStrength = (
    pw: string
  ): { label: string; color: string; width: string } => {
    if (!pw) return { label: "", color: "", width: "0%" };
    const has = {
      upper: /[A-Z]/.test(pw),
      lower: /[a-z]/.test(pw),
      number: /[0-9]/.test(pw),
      symbol: /[^a-zA-Z0-9]/.test(pw)
    };
    const score =
      Object.values(has).filter(Boolean).length + (pw.length >= 16 ? 1 : 0);
    if (score <= 2)
      return { label: t.passwordWeak, color: "bg-red-500", width: "25%" };
    if (score === 3)
      return { label: t.passwordMedium, color: "bg-yellow-500", width: "50%" };
    if (score === 4)
      return { label: t.passwordStrong, color: "bg-blue-500", width: "75%" };
    return {
      label: t.passwordVeryStrong,
      color: "bg-green-500",
      width: "100%"
    };
  };

  const generate = () => {
    setPassword(generatePassword(length, opts));
  };

  const copy = async () => {
    await navigator.clipboard.writeText(password);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const strength = getStrength(password);
  const noneSelected =
    !opts.upper && !opts.lower && !opts.numbers && !opts.symbols;

  const charOptions = [
    { key: "upper" as const, label: t.passwordUppercase },
    { key: "lower" as const, label: t.passwordLowercase },
    { key: "numbers" as const, label: t.passwordNumbers },
    { key: "symbols" as const, label: t.passwordSymbols }
  ];

  return (
    <div className="flex max-w-lg flex-col gap-6 px-4 lg:px-6">
      <div className="flex flex-col gap-4 rounded border p-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="length" className="mb-1">
            {t.passwordLength}: {length}
          </Label>
          <input
            id="length"
            type="range"
            min={4}
            max={128}
            value={length}
            onChange={(e) => setLength(parseInt(e.target.value))}
            className="accent-primary w-full"
          />
          <div className="text-muted-foreground flex justify-between text-xs">
            <span>4</span>
            <span>128</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {charOptions.map(({ key, label }) => (
            <div key={key} className="flex items-center gap-2">
              <Checkbox
                id={key}
                checked={opts[key]}
                onCheckedChange={(checked) =>
                  setOpts({ ...opts, [key]: !!checked })
                }
              />
              <Label
                htmlFor={key}
                className="cursor-pointer text-sm font-normal"
              >
                {label}
              </Label>
            </div>
          ))}
        </div>

        {noneSelected && (
          <p className="text-destructive text-xs">{t.passwordSelectMin}</p>
        )}

        <Button onClick={generate} disabled={noneSelected} className="gap-2">
          <RefreshCw className="size-4" />
          {t.passwordGenerateBtn}
        </Button>
      </div>

      {password && (
        <div className="flex flex-col gap-3">
          <div className="bg-muted flex items-center gap-2 rounded-md border px-3 py-3">
            <span className="flex-1 font-mono text-sm break-all">
              {password}
            </span>
            <Button
              size="sm"
              variant="ghost"
              onClick={copy}
              className="h-7 shrink-0 gap-1 text-xs"
            >
              {copied ? (
                <Check className="size-3" />
              ) : (
                <Copy className="size-3" />
              )}
              {copied ? t.copied : t.copy}
            </Button>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">
                {t.passwordStrength}
              </span>
              <span className="font-medium">{strength.label}</span>
            </div>
            <div className="bg-muted h-1.5 w-full overflow-hidden rounded-full">
              <div
                className={`h-full rounded-full transition-all duration-300 ${strength.color}`}
                style={{ width: strength.width }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
