# avatar

2026-07-22, strategy: golden pair via CLI (`shadcn add avatar --overwrite`), whole-project mode. Verdict: pristine migration.

## Changed

- `components/ui/avatar.tsx` — replaced with the `base-vega` registry
  variant (`Avatar` from `@base-ui/react/avatar`). Initial raw-JSON diff
  against the radix golden showed only an export-statement ordering
  difference (`AvatarImage`/`AvatarBadge` swapped) — an artifact of
  `eslint-plugin-simple-import-sort/exports` alphabetizing exports, not a
  real customization. No `AvatarBadge`/`AvatarImage` consumer in this app
  currently uses this component, so nothing to verify against real usage.
  Reformatted with `prettier --write` + `eslint --fix`. Leftover scan:
  clean.

## Left alone

Nothing else in this component's family.

## Behavior changes

- `Avatar.Image`'s `delayMs` prop renamed to `delay` in Base UI (per
  `consumer-props.md`) — no consumer currently uses `AvatarImage`, so no
  call-site change needed. Flagging for whenever a page adopts it.

## Verify by hand

No current consumer in the app (`grep -rn "from \"@/components/ui/avatar\""
app/` returns nothing) — nothing to click-test yet.
