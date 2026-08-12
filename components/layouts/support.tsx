"use client";

import { Coffee } from "lucide-react";
import { useEffect, useRef } from "react";

import { Button } from "@/components/ui/button";
import { SAWERIA_LINK } from "@/constants";
import { useLanguage } from "@/contexts/language-context";

const CONFETTI_COLORS = [
  "#f97316",
  "#facc15",
  "#22c55e",
  "#38bdf8",
  "#ec4899",
  "#a78bfa"
];

function fireConfetti(originX: number, originY: number) {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  for (let i = 0; i < 28; i++) {
    const piece = document.createElement("span");
    const size = 5 + Math.random() * 5;
    piece.style.cssText = `position:fixed;left:${originX}px;top:${originY}px;width:${size}px;height:${
      size * 0.4
    }px;background:${CONFETTI_COLORS[i % CONFETTI_COLORS.length]};border-radius:1px;pointer-events:none;z-index:9999;`;
    document.body.appendChild(piece);

    const angle = Math.random() * Math.PI * 2;
    const distance = 60 + Math.random() * 100;
    const dx = Math.cos(angle) * distance;
    const dy = Math.sin(angle) * distance - 80;
    const rotation = Math.random() * 720 - 360;

    const animation = piece.animate(
      [
        { transform: "translate(0, 0) rotate(0deg)", opacity: 1 },
        {
          transform: `translate(${dx}px, ${dy + 200}px) rotate(${rotation}deg)`,
          opacity: 0
        }
      ],
      {
        duration: 900 + Math.random() * 500,
        easing: "cubic-bezier(0.25, 0.46, 0.45, 0.94)"
      }
    );
    animation.onfinish = () => piece.remove();
  }
}

export function Support() {
  const { t } = useLanguage();
  const buttonRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const button = buttonRef.current;
    if (!button) return;

    const burst = () => {
      const rect = button.getBoundingClientRect();
      fireConfetti(rect.left + rect.width / 2, rect.top + rect.height / 2);
    };

    const timers = Array.from({ length: 3 }, (_, i) =>
      window.setTimeout(burst, i * 1000)
    );

    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, []);

  return (
    <Button
      className="gap-1.5 bg-orange-500 text-white hover:bg-orange-600 dark:bg-orange-500 dark:hover:bg-orange-400"
      nativeButton={false}
      render={
        <a
          ref={buttonRef}
          href={SAWERIA_LINK}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Coffee className="size-3.5" />
          <span className="hidden sm:inline">{t.supportButton}</span>
        </a>
      }
    />
  );
}
