# accordion

2026-07-22, strategy: golden pair via CLI, whole-project mode. Verdict: added — net-new component, no prior Radix predecessor and no consumers, folded into this whole-project migration for completeness.

## Changed

- `components/ui/accordion.tsx` (new file) — added via `npx shadcn@latest
  add accordion` once `components.json`'s `style` was flipped to
  `base-vega` (see `project.md`). CLI resolved the registry's generic
  `IconPlaceholder` markers to this project's real icons
  (`ChevronDownIcon`/`ChevronUpIcon` from `lucide-react`). Reformatted with
  `prettier --write` + `eslint --fix` (had to re-run prettier after
  eslint's export-sort autofix left a malformed export brace — same glitch
  seen on `dropdown-menu.tsx`). Leftover scan: clean.
- `app/globals.css:1-21` — added a CSS override for the `accordion-down` /
  `accordion-up` `@keyframes`. Root cause: `tw-animate-css` (imported
  project-wide) ships these keyframes with a height fallback chain that
  only covers `--radix-accordion-content-height` / `--bits-*` / `--reka-*`
  / `--kb-*` / `--ngp-*` — not Base UI's `--accordion-panel-height` (the
  CSS var `AccordionPrimitive.Panel` actually sets). Without the override,
  opening/closing an accordion resolves height to the unmatched `auto`
  fallback and snaps instantly instead of animating. The override
  redeclares both keyframes (CSS keyframes are unscoped by name, so a later
  declaration replaces the earlier one) with `--accordion-panel-height` in
  the fallback chain. General fix for any Base UI accordion in this
  project, not per-instance.

## Left alone

No consumers exist yet (`grep -rn "Accordion" app/ components/` outside
`components/ui/accordion.tsx` is empty) — nothing to sweep.

## Behavior changes

- Base UI's accordion supports multiple simultaneously open items by
  default (`openMultiple` defaults to `true`, unlike Radix where
  `type="single"` had to be chosen explicitly); pass `openMultiple={false}`
  on `<Accordion>` for single-open-at-a-time behavior when a page adopts
  this component.

## Verify by hand

1. `npm run dev`, temporarily drop an `<Accordion>` with 2-3
   `<AccordionItem>`s onto any page to smoke-test (no shipped page uses it
   yet).
2. Click a trigger — panel should smoothly expand/collapse (the
   `globals.css` keyframe fix), not snap instantly.
3. Chevron icon should flip from down to up while a panel is open.
4. Tab to a trigger, Enter/Space should open/close it.
