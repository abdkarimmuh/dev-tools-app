import { type ClassValue, clsx } from "clsx";
import { KeyboardEvent } from "react";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function handleTextareaTab(
  e: KeyboardEvent<HTMLTextAreaElement>,
  value: string,
  onChange: (next: string) => void,
  indent = "  "
) {
  if (e.key !== "Tab") return;
  e.preventDefault();
  const el = e.currentTarget;
  const start = el.selectionStart;
  const end = el.selectionEnd;
  const next = value.substring(0, start) + indent + value.substring(end);
  onChange(next);
  requestAnimationFrame(() => {
    el.selectionStart = el.selectionEnd = start + indent.length;
  });
}
