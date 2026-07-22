# label

2026-07-22, strategy: golden pair via CLI (`shadcn add label --overwrite`), whole-project mode. Verdict: pristine migration, no consumer changes needed.

## Changed

- `components/ui/label.tsx` — replaced with the `base-vega` registry variant
  (`Label` from `@base-ui/react/label`... actually Base UI has no dedicated
  Label primitive with extra behavior beyond Radix's here; the registry swap
  is purely the import source). Diff from the `radix-vega` golden was
  formatting/import-order only — pristine. Reformatted with `prettier
  --write` + `eslint --fix`. Leftover scan: clean.

## Left alone

Nothing else in this component's family.

## Behavior changes

None.

## Verify by hand

Any form field using `<Label>` (e.g. HMAC key/message labels, checkbox
labels) should still visually associate with its control and focus the
control when clicked.
