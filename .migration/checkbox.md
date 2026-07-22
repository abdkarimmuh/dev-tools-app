# checkbox

2026-07-22, strategy: golden pair via CLI (`shadcn add checkbox --overwrite`), whole-project mode. Verdict: pristine migration.

## Changed

- `components/ui/checkbox.tsx` — replaced with the `base-vega` registry
  variant (`Checkbox` from `@base-ui/react/checkbox`). The CLI resolved the
  registry's generic `IconPlaceholder` marker to this project's real icon
  (`CheckIcon` from `lucide-react`). Diff from the radix golden beyond that
  icon resolution was formatting only — pristine. Reformatted with
  `prettier --write` + `eslint --fix`. Leftover scan: clean.

## Left alone

Nothing else in this component's family.

## Behavior changes

- Radix's tri-state `checked="indeterminate"` becomes a separate boolean
  `indeterminate` prop in Base UI (per `consumer-props.md`). No consumer in
  this app currently passes `indeterminate` (`grep -rn "indeterminate"`
  returned nothing outside the wrapper), so no call-site change was needed.

## Verify by hand

Any checkbox in the app (e.g. `dataUri` toggle on `base-encoder`) should
still check/uncheck on click and show the check icon.
