# badge

2026-07-22, strategy: golden pair via CLI (`shadcn add badge --overwrite`), whole-project mode. Verdict: pristine migration.

## Changed

- `components/ui/badge.tsx` — replaced with the `base-vega` registry variant.
  Like `button.tsx`, its `asChild` escape hatch now goes through the Base UI
  `render` prop pattern (via `useRender`, since Badge has no dedicated Base
  UI primitive — it's a styled `<span>`/render-prop component). Diff from
  the radix golden was formatting only — pristine. Reformatted with
  `prettier --write` + `eslint --fix`. Leftover scan: clean.

## Left alone

Nothing else in this component's family.

## Behavior changes

None.

## Verify by hand

No current consumer in the app uses `<Badge>` with `asChild`/`render` —
plain badges (if any) should render unchanged.
