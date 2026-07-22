# tooltip

2026-07-22, strategy: golden pair via CLI (`shadcn add tooltip --overwrite`), whole-project mode. Verdict: pristine migration, two consumers needed `asChild` → `render`.

## Changed

- `components/ui/tooltip.tsx` — replaced with the `base-vega` registry
  variant (`Tooltip` from `@base-ui/react/tooltip`, including
  `TooltipProvider`). Diff from the radix golden was formatting/import-order
  only — pristine. Reformatted with `prettier --write` + `eslint --fix`.
  Leftover scan: clean.
- `app/tools/(text)/markdown-preview/page.tsx:190-204` —
  `<TooltipTrigger asChild><Button>...</Button></TooltipTrigger>` (one per
  toolbar button, generated from `TOOLBAR.map`) converted to
  `<TooltipTrigger render={<Button>...}/>`.
- `components/ui/sidebar.tsx` — `SidebarMenuButton`'s internal tooltip
  wiring already uses Base UI's `render` pattern natively (delivered by the
  registry, see `sidebar.md`) — no manual fix needed there.

## Left alone

- `app/layout.tsx` still wraps the app in `<TooltipProvider>` with no
  props — Base UI's `TooltipProvider` accepts this unchanged (default
  `delay`/`closeDelay`), so no rename was needed since nothing overrode
  Radix's `delayDuration`/`skipDelayDuration`.

## Behavior changes

- `disableHoverableContent` (Radix) has NO Base UI equivalent (per
  `consumer-props.md`) — not used anywhere in this app, so nothing to flag
  against a live consumer, but noting for future reference: if a tooltip
  ever needs to prevent the pointer from moving into the tooltip content
  itself, that escape hatch is gone.

## Verify by hand

1. Go to `/tools/markdown-preview`, hover each toolbar button (Bold,
   Italic, etc.) — a tooltip with the button's label should appear below
   after the default hover delay, and the button itself should still be
   clickable/keyboard-focusable.
2. Confirm tooltips dismiss on mouse-out / blur.
