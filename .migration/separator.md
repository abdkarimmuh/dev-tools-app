# separator

2026-07-22, strategy: golden pair via CLI (`shadcn add separator --overwrite`), whole-project mode. Verdict: pristine migration.

## Changed

- `components/ui/separator.tsx` — replaced with the `base-vega` registry
  variant (`Separator` from `@base-ui/react/separator`). Diff from the
  `radix-vega` golden was formatting/import-order only — pristine.
  Reformatted with `prettier --write` + `eslint --fix`. Leftover scan:
  clean.

## Left alone

Nothing else in this component's family.

## Behavior changes

- `decorative` prop is dropped in Base UI (per `consumer-props.md`) — no
  consumer in this app passed it, so no call-site change needed.

## Verify by hand

Check any tool with a toolbar (e.g. `markdown-preview`) — vertical
separators between toolbar button groups should still render as thin lines
at the correct orientation.
