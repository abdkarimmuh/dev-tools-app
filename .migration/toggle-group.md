# toggle-group

2026-07-22, strategy: golden pair via CLI (`shadcn add toggle-group --overwrite`), whole-project mode. Verdict: pristine wrapper migration; one consumer required a real prop/value-shape rewrite.

## Changed

- `components/ui/toggle-group.tsx` — replaced with the `base-vega` registry
  variant (`ToggleGroup` from `@base-ui/react/toggle-group`, built on the
  migrated `Toggle` primitive). Diff from the radix golden was import-order
  only — pristine. Reformatted with `prettier --write` + `eslint --fix`.
  Leftover scan: clean.
- `app/tools/(encoding)/base-encoder/page.tsx:455-473` — the two
  `<ToggleGroup>` usages (mode switch: text/file; file direction switch:
  encode/decode) used Radix's `type="single"` API with a plain string
  `value`/`onValueChange`. Per `consumer-props.md`, Base UI's `ToggleGroup`
  drops `type` entirely — single-select is the `multiple={false}` default —
  and `value`/`onValueChange` are ALWAYS arrays. Rewrote both:
  `type="single" value={mode} onValueChange={(v) => v && switchMode(v as Mode)}`
  → `value={[mode]} onValueChange={(v) => v[0] && switchMode(v[0] as Mode)}`
  (same treatment for the direction toggle). `multiple` was left at its
  `false` default since both toggles are genuinely single-select — matches
  prior Radix `type="single"` behavior exactly.

## Left alone

Nothing else in this component's family.

## Behavior changes

- `rovingFocus={false}` / `loop` props (per `consumer-props.md`: roving
  focus always on in Base UI; `loop` renamed `loopFocus`) — not used by
  either consumer, no change needed.

## Verify by hand

1. Go to `/tools/base-encoder`.
2. Click the Text/File mode toggle — exactly one should stay pressed at a
   time, and the file-direction toggle should appear/disappear correctly
   when switching to File mode.
3. In File mode, click Encode/Decode — exactly one should stay pressed.
4. Tab to a toggle group and use arrow keys — focus should move between
   items; Enter/Space (or click) should toggle selection, deselecting the
   previous item (single-select behavior, not multi-select).
