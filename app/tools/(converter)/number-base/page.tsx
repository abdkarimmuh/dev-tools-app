"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLanguage } from "@/contexts/language-context";
import { useToolState } from "@/hooks/use-tool-state";

type Base = 2 | 8 | 10 | 16;

interface BaseConfig {
  base: Base;
  labelKey:
    | "numberBaseBinary"
    | "numberBaseOctal"
    | "numberBaseDecimal"
    | "numberBaseHexadecimal";
  prefix: string;
  placeholder: string;
  chars: RegExp;
}

const BASES: BaseConfig[] = [
  {
    base: 2,
    labelKey: "numberBaseBinary",
    prefix: "0b",
    placeholder: "1010",
    chars: /^[01]+$/
  },
  {
    base: 8,
    labelKey: "numberBaseOctal",
    prefix: "0o",
    placeholder: "17",
    chars: /^[0-7]+$/
  },
  {
    base: 10,
    labelKey: "numberBaseDecimal",
    prefix: "",
    placeholder: "255",
    chars: /^[0-9]+$/
  },
  {
    base: 16,
    labelKey: "numberBaseHexadecimal",
    prefix: "0x",
    placeholder: "FF",
    chars: /^[0-9a-fA-F]+$/
  }
];

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <Button
      size="sm"
      variant="ghost"
      onClick={copy}
      className="h-7 gap-1 px-2 text-xs"
      disabled={!text}
    >
      {copied ? <Check className="size-3" /> : <Copy className="size-3" />}
    </Button>
  );
}

export default function NumberBasePage() {
  const { t } = useLanguage();
  const [activeBase, setActiveBase] = useToolState<Base>(
    "number-base",
    "activeBase",
    10
  );
  const [input, setInput] = useToolState("number-base", "input", "");

  const decimal = (() => {
    if (!input) return null;
    try {
      const n = parseInt(input, activeBase);
      return isNaN(n) ? null : n;
    } catch {
      return null;
    }
  })();

  const handleChange = (base: Base, value: string) => {
    setActiveBase(base);
    setInput(value.toUpperCase());
  };

  const getOutput = (base: Base): string => {
    if (decimal === null) return "";
    if (base === activeBase) return input;
    return decimal.toString(base).toUpperCase();
  };

  return (
    <div className="flex max-w-lg flex-col gap-6 px-4 lg:px-6">
      <p className="text-sm text-muted-foreground">{t.numberBaseIntro}</p>

      {BASES.map(({ base, labelKey, prefix, placeholder }) => {
        const isActive = base === activeBase;
        const value = isActive ? input : getOutput(base);
        return (
          <div key={base} className="flex flex-col gap-1.5">
            <Label className="mb-1 flex items-center gap-2">
              {t[labelKey]}
              <span className="text-xs font-normal text-muted-foreground">
                {t.numberBaseLabel} {base}
              </span>
            </Label>
            <div className="flex items-center gap-2">
              {prefix && (
                <span className="font-mono text-sm text-muted-foreground">
                  {prefix}
                </span>
              )}
              <Input
                className="font-mono"
                placeholder={placeholder}
                value={value}
                onChange={(e) => handleChange(base, e.target.value)}
                spellCheck={false}
              />
              <CopyButton text={value} />
            </div>
          </div>
        );
      })}

      {decimal !== null && (
        <div className="rounded-md border bg-muted px-4 py-3 text-sm">
          <span className="text-muted-foreground">
            {t.numberBaseDecimalValue}{" "}
          </span>
          <span className="font-mono font-medium">
            {decimal.toLocaleString()}
          </span>
        </div>
      )}

      {input && decimal === null && (
        <p className="text-sm text-destructive">
          {t.numberBaseInvalid} {activeBase}
        </p>
      )}
    </div>
  );
}
