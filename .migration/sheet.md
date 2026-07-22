# sheet

2026-07-22, strategy: golden pair via CLI (`shadcn add sheet --overwrite`), whole-project mode. Verdict: migrated cleanly, no consumer rewrites needed.

## Changed

- `components/ui/sheet.tsx` — replaced with the `base-vega` registry
  variant. Sheet is built on the same `@base-ui/react/dialog` `Dialog`
  primitive as `dialog.tsx` (re-exported under `Sheet*` names, same as
  Radix used `Dialog` under the hood for both). CLI resolved
  `IconPlaceholder` to `XIcon`. Same `cn-font-heading` false positive as
  `dialog.tsx` — the CLI's preset-aware resolution confirmed the plain
  `font-heading` class (no `cn-` prefix) is correct for this project's
  `fontHeading: "inherit"` config; the wrapper was already pristine.
  Reformatted with `prettier --write` + `eslint --fix`. Leftover scan:
  clean.

## Left alone

Nothing else in this component's family — `components/ui/sidebar.tsx`
consumes `Sheet`/`SheetContent`/etc. for the mobile sidebar drawer; see
`sidebar.md` for that composition's own (unrelated) customization.

## Behavior changes

Same as `dialog.md` (shared primitive): `onOpenAutoFocus`/`onCloseAutoFocus`
→ `initialFocus`/`finalFocus`; not used by any consumer here.

## Verify by hand

No direct `<Sheet>` consumer outside `sidebar.tsx`'s mobile drawer — see
`sidebar.md`'s checklist (resize below `md`, open the sidebar via the
trigger, confirm it slides in as a sheet from the left and dismisses on
backdrop click or Escape).
