# button

2026-07-22, strategy: golden pair via CLI (`shadcn add button --overwrite`), whole-project mode. Verdict: migrated cleanly, one consumer fix.

## Changed

- `components/ui/button.tsx` — replaced with the `base-vega` registry variant.
  Per the migration's hard rule, `button.tsx` uses the real
  `@base-ui/react/button` `Button` primitive (not a hand-rolled `useRender`
  wrapper) with `asChild` replaced by the standard Base UI `render` prop.
  Diff from the current `radix-vega` golden was formatting/import-order only
  (semicolons, import sort) — confirmed pristine, no local customization to
  replay. Reformatted with `prettier --write` + `eslint --fix`. Leftover
  scan: `grep -n "radix-ui\|@radix-ui" components/ui/button.tsx` → clean.
- `app/not-found.tsx:31-40` — `<Button variant="link" asChild>` wrapping a
  `<Link>` converted to `<Button variant="link" render={<Link>...}/>` per
  `consumer-props.md`'s universal `asChild` → `render` rule.

## Left alone

- No other consumers used `asChild` on `Button` directly (other `asChild`
  usages were on `DropdownMenuTrigger`/`TooltipTrigger`/`SidebarMenuButton`,
  covered in their own reports).

## Behavior changes

None.

## Verify by hand

1. Visit `/` (404 fallback isn't reachable without a bad route — visit any
   nonexistent path e.g. `/tools/does-not-exist`) and click "Go home" — the
   link-styled button should navigate via Next's `<Link>` (client-side nav,
   no full reload).
2. Tab to any button in the app, confirm focus ring renders and Enter/Space
   activates it.
3. Confirm disabled buttons (e.g. Fake Data's Generate button with no
   custom fields) are visually dimmed and unclickable.
