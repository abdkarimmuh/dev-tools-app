# tabs

2026-07-22, strategy: golden pair via CLI (`shadcn add tabs --overwrite`), whole-project mode. Verdict: pristine migration, one behavior delta flagged (not patched).

## Changed

- `components/ui/tabs.tsx` — replaced with the `base-vega` registry variant
  (`Tabs` from `@base-ui/react/tabs`). Diff from the radix golden was
  formatting/export-order only — pristine. Reformatted with `prettier
  --write` + `eslint --fix`. Leftover scan: clean.

## Left alone

Nothing else in this component's family.

## Behavior changes

- **Tab activation mode**: Radix's `Tabs` defaults to AUTOMATIC activation
  (arrow-key focus immediately switches the active tab); Base UI's `Tabs`
  defaults to MANUAL activation (arrow keys move focus, Enter/Space commits
  the switch). No consumer in this app passed `activationMode="manual"`
  explicitly (`grep -rn "activationMode"` found nothing), meaning the app
  was previously relying on Radix's automatic default. Per the skill's hard
  rule this is flagged, not silently patched with an opt-in prop — no
  current tool in this app actually uses `<Tabs>` (`grep -rln "from
  \"@/components/ui/tabs\"" app/` is empty), so there's no live behavior to
  regress today, but the next consumer of `Tabs` should be aware keyboard
  navigation now requires a commit keypress by default.

## Verify by hand

No current consumer — nothing to click-test yet. When a page adopts
`<Tabs>`, confirm arrow-key navigation and whether manual-activation feels
right for that UI (Enter/Space needed to switch tabs via keyboard).
