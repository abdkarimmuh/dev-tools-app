# project — whole-project Radix UI → Base UI migration

2026-07-22, whole-project mode. All 15 Radix-dependent `components/ui/*`
wrappers migrated to `@base-ui/react`, plus the previously-added `accordion`
(net-new, no Radix predecessor) folded in. `radix-ui` fully removed from
`package.json`. Verdict: complete, typecheck/lint/build all green.

## Dependency swap

- Added `@base-ui/react@^1.6.0` (installed earlier in this session, before
  this whole-project run started).
- Flipped `components.json` `style`: `radix-vega` → `base-vega` (matches
  this project's shadcn preset — `menuColor: "default"`, `menuAccent:
  "subtle"`, `iconLibrary: "lucide"`, `rtl: false`, `fontHeading:
  "inherit"` all carried forward unchanged; only `base` flipped from
  `"radix"` to `"base"` per `shadcn info --json`).
- Removed `radix-ui` from `package.json` (`npm uninstall radix-ui`) after
  confirming zero remaining references.

## Components migrated (15 Radix wrappers + 1 net-new)

Bottom-up dependency order, each with its own `.migration/<component>.md`:

| Component | Strategy | Note |
|---|---|---|
| `button` | CLI golden pair | real `@base-ui/react/button` primitive (hard rule) |
| `label` | CLI golden pair | pristine |
| `separator` | CLI golden pair | pristine |
| `avatar` | CLI golden pair | pristine, no consumers |
| `badge` | CLI golden pair | pristine |
| `checkbox` | CLI golden pair | pristine |
| `tabs` | CLI golden pair | pristine, no consumers (activation-mode delta flagged) |
| `toggle` | CLI golden pair | pristine |
| `tooltip` | CLI golden pair | pristine |
| `toggle-group` | CLI golden pair | pristine wrapper; 1 consumer needed real value-shape rewrite |
| `dropdown-menu` | CLI golden pair | pristine (raw-JSON false positive resolved by preset-aware CLI) |
| `select` | CLI golden pair | pristine (same false positive) |
| `dialog` | CLI golden pair | pristine (same false-positive pattern); 1 downstream type fix |
| `sheet` | CLI golden pair | pristine (same false-positive pattern), shares `dialog`'s primitive |
| `sidebar` | CLI golden pair + hand patch | 1 genuine customization preserved (`h-svh overflow-hidden`) |
| `accordion` | CLI golden pair | net-new, no Radix predecessor, no consumers |

### A note on the "customized wrapper" detection process

Early classification (diffing each wrapper against a *raw* `curl`-fetched
`radix-vega` registry JSON) flagged `dropdown-menu`, `select`, `dialog`, and
`sheet` as customized (missing `cn-menu-target cn-menu-translucent` /
`cn-font-heading` utility classes present in the raw JSON). Attempting a
line-based 3-way `git merge-file` on `dropdown-menu` first produced conflicts
across nearly the entire file — Radix's and Base UI's menu/dialog primitives
are structured too differently (different subcomponent nesting) for a
line-diff merge to work even when the underlying customization is tiny.
Investigating further: those "missing" classes turned out to be correctly
absent — `shadcn add <component> --overwrite` (the actual CLI, not a raw
JSON fetch) resolves the registry against this project's real
`components.json` preset values (`menuColor`, `menuAccent`, `fontHeading`),
and for this project's specific preset combination those utility classes are
conditionally omitted. So all four were actually pristine; only `sidebar`
had a real, hand-made customization (see `sidebar.md`), found by diffing
against the CLI-resolved base variant instead of the raw registry JSON.
**Lesson for future migrations in this project**: always classify wrappers
by comparing against `shadcn add --dry-run`/CLI-delivered content, never a
raw registry URL fetch — the raw JSON isn't preset-resolved and produces
false positives.

## App-code sweep (consumer-props.md)

- `asChild` → `render`: 8 call sites across `app/not-found.tsx`,
  `app/tools/(text)/markdown-preview/page.tsx`,
  `app/tools/(generator)/fake-data/page.tsx`, `components/layouts/site-
  header.tsx`, `components/layouts/app-sidebar.tsx` (×3).
- `ToggleGroup` `type="single"` + string `value` → `multiple` (default
  `false`) + array `value`/`onValueChange`: 2 call sites in
  `app/tools/(encoding)/base-encoder/page.tsx` (mode switch, file-direction
  switch).
- `Select`'s `onValueChange` signature widening (`value: string` →
  `(value: Value | null, eventDetails)`): audited all 18 files importing
  `Select`; all use inline-arrow handlers with casts, none broke.
- `Checkbox`'s `indeterminate`, `Tooltip`'s `disableHoverableContent`,
  `Select`'s `position`, `Tabs`'s `activationMode`: none used anywhere in
  this app — no call-site changes needed, noted as flags for future use in
  the respective component reports.
- `components/ui/command.tsx`'s `CommandDialog` — a consumer of the
  migrated `Dialog` wrapper, not itself a Radix wrapper (`cmdk`, explicitly
  out of scope) — needed a `children` prop type narrowing fix; see
  `dialog.md`.

## Out-of-scope files touched then reverted

`hooks/use-mobile.ts`, `components/ui/input.tsx`,
`components/ui/skeleton.tsx` were overwritten as side effects of the
`sidebar` registry item pulling them in as dependencies, then reverted via
`git checkout` — none of the three ever depended on `radix-ui`, so
overwriting them wasn't part of a Radix→Base UI swap (in `input.tsx`'s
case, the base-vega variant would have introduced Base UI's `Input`
primitive in place of a plain native `<input>`, a separate unrequested
upgrade).

## Verification

- `npm run typecheck` — 0 errors (multiple full passes throughout, final
  pass after `npm uninstall radix-ui`).
- `npm run lint` — 0 errors/warnings.
- `npm run build` — succeeds, all 46 routes statically generated.
- Leftover scan: `grep -rn "radix-ui\|@radix-ui\|IconPlaceholder\|asChild"
  app/ components/ hooks/ lib/` → zero matches anywhere in the repo.
- `npm run dev` + `curl` smoke test on `/`, `/tools/markdown-preview`,
  `/tools/fake-data`: all return 200, no server/console errors, and the
  migrated `sidebar`/`dropdown-menu` wrappers render with correct
  `data-slot` markup in the SSR output.
- **Not verified**: interactive/visual behavior in a real browser (hover
  states, keyboard nav feel, animation smoothness, the sidebar's mobile
  `h-svh` viewport fix under an actual mobile viewport). No browser
  automation tool was available in this environment — only SSR output and
  the absence of console/build errors were confirmed. Recommend a manual
  pass through each component's "Verify by hand" checklist before shipping.

## What's left on Radix

`grep -rl "radix-ui" components/ui/*.tsx` → **0 files**. Migration is
complete; `radix-ui` is fully removed from `package.json`.
