# select

2026-07-22, strategy: golden pair via CLI (`shadcn add select --overwrite`), whole-project mode. Verdict: migrated cleanly, no consumer rewrites needed.

## Changed

- `components/ui/select.tsx` — replaced with the `base-vega` registry
  variant (`Select` from `@base-ui/react/select`). CLI resolved
  `IconPlaceholder` markers to `CheckIcon`/`ChevronDownIcon`/`ChevronUpIcon`
  from `lucide-react`. Same false-positive story as `dropdown-menu.tsx`:
  a raw-JSON diff suggested missing `cn-menu-target cn-menu-translucent`
  classes, but the CLI's preset-aware resolution against this project's
  `menuColor`/`menuAccent` config confirmed the wrapper was already
  pristine. Reformatted with `prettier --write` + `eslint --fix`. Leftover
  scan: clean.

## Left alone

Nothing else in this component's family.

## Behavior changes

- `position="popper"|"item-aligned"` → Base UI's `alignItemWithTrigger`
  boolean (per `consumer-props.md`) — no consumer in this app passes
  `position` (`grep -rn 'position="' `on Select usages returned nothing),
  so the default behavior (`alignItemWithTrigger` default, roughly
  equivalent to Radix's `item-aligned`) carries over unchanged.
- `onValueChange(value: string)` widens to `(value: Value | null,
  eventDetails)` in Base UI. Checked all 18 files importing `Select` in this
  app (struct-converter, json-converter, rsa, ecdsa, api-signature,
  des-cipher, base-encoder, hash-generator, tree-generator, qr-generator,
  fake-data, uuid-generator, lorem-ipsum, barcode-generator,
  gradient-generator, js-formatter, css-formatter, sql-formatter) — every
  one uses an inline arrow (`onValueChange={(v) => setX(v as T)}`), never a
  bare `setState` pass-through, so the wider/nullable signature didn't
  require any call-site changes. `npm run typecheck` confirms 0 errors
  across all of them.

## Verify by hand

Pick 2-3 tools using `<Select>` (e.g. `/tools/rsa` key size, `/tools/qr-
generator` error-correction level) — open the dropdown, select an option,
confirm the selected value updates and the trigger reflects the new value.
