# toggle

2026-07-22, strategy: golden pair via CLI (`shadcn add toggle --overwrite`), whole-project mode. Verdict: pristine migration.

## Changed

- `components/ui/toggle.tsx` — replaced with the `base-vega` registry
  variant (`Toggle` from `@base-ui/react/toggle`). Diff from the radix
  golden was formatting/import-order only — pristine. Reformatted with
  `prettier --write` + `eslint --fix`. Leftover scan: clean.

## Left alone

Nothing else standalone — `toggle-group.tsx` builds on `toggleVariants`
exported from this file (see `toggle-group.md`).

## Behavior changes

None for standalone `Toggle` usage.

## Verify by hand

No page uses standalone `<Toggle>` outside of `ToggleGroup` composition
(`base-encoder`'s mode/direction switches) — see `toggle-group.md` for the
QA checklist.
