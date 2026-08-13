"use client";

import Image from "next/image";
import { useTheme } from "next-themes";

import { SAWERIA_LINK } from "@/constants";
import { cn } from "@/lib/utils";

export function Support() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <a
      href={SAWERIA_LINK}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "inline-flex h-9 shrink-0 items-center justify-center rounded-lg px-4 transition-all duration-200 ease-out hover:-translate-y-0.5 hover:scale-105 hover:shadow-lg active:scale-95",
        isDark
          ? "bg-white hover:shadow-white/30"
          : "bg-[#FFDD00] hover:shadow-[#FFDD00]/40"
      )}
    >
      <Image
        src={isDark ? "/bmc-button-white.svg" : "/bmc-button-yellow.svg"}
        alt="Buy Me a Coffee"
        width={458}
        height={98}
        className="h-5 w-auto"
      />
    </a>
  );
}
