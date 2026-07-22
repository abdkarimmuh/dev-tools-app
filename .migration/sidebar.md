# sidebar

2026-07-22, strategy: golden pair via CLI (`shadcn add sidebar --overwrite`) + one hand-replayed customization, whole-project mode. Verdict: migrated cleanly; genuine local fix preserved; three consumer `asChild` → `render` conversions in `app-sidebar.tsx`.

## Changed

- `components/ui/sidebar.tsx` — replaced with the `base-vega` registry
  variant. Sidebar composes `Button`, `Input`, `Separator`, `Sheet*`,
  `Skeleton`, `Tooltip*` internally, all already migrated. The `asChild`
  prop on `SidebarMenuButton` is gone; it now uses Base UI's `useRender` +
  `mergeProps` pattern with a `render` prop directly (delivered by the
  registry, no manual work needed for the wrapper itself).
  **Real customization found and preserved**: the mobile drawer's content
  wrapper div. Upstream (both the current radix and base goldens) renders
  `<div className="flex h-full w-full flex-col">{children}</div>`; this
  project's installed file had `<div className="flex h-svh w-full flex-col
  overflow-hidden">{children}</div>` (`h-svh` instead of `h-full`, plus
  `overflow-hidden`) — almost certainly a deliberate fix for mobile viewport
  height / scroll containment, since it's the only content-level diff found
  across all 15 migrated wrappers that wasn't explained by preset config or
  formatting. A line-based 3-way `git merge-file` (radix golden as
  ancestor) was attempted first but produced heavy, mostly-noise conflicts
  because Radix and Base UI structure several other parts of this large
  file very differently — so instead the CLI-delivered base variant was
  taken wholesale and this one div's className was hand-patched back to
  `h-svh w-full flex-col overflow-hidden` at
  `components/ui/sidebar.tsx:202-204`.
  Reformatted with `prettier --write` + `eslint --fix`. Leftover scan:
  clean (`grep -n "radix-ui\|@radix-ui\|IconPlaceholder"` → no matches).
- `hooks/use-mobile.ts`, `components/ui/input.tsx`,
  `components/ui/skeleton.tsx` — the `sidebar` registry item drags these in
  as dependencies and the CLI overwrote them too. **Reverted via `git
  checkout`**: none of the three ever imported `radix-ui` (native `<input>`,
  a `useSyncExternalStore`-based hook, a plain `<div>` skeleton), so
  swapping them isn't a Radix→Base UI migration — the `base-vega` `input`
  variant would've introduced Base UI's `Input` primitive where a plain
  native `<input>` was intentionally used before, which is a separate,
  unrequested upgrade. `button.tsx`/`separator.tsx`/`tooltip.tsx` were also
  re-overwritten by this same dependency pull; those were re-formatted
  (already migrated wrappers, so the re-overwrite was idempotent) rather
  than reverted.
- `components/layouts/app-sidebar.tsx` — three `asChild` call sites fixed
  per `consumer-props.md`:
  - `:45-60` — logo `SidebarMenuButton asChild` wrapping a `<Link>` → `render`.
  - `:75-92` — nav-item `SidebarMenuButton asChild` wrapping a `<Link>` → `render`.
  - `:106-118` — mobile-footer `DropdownMenuTrigger asChild` wrapping a
    `<Button>` → `render` (covered again here since it's the same file;
    see `dropdown-menu.md` for the general pattern).

## Left alone

- `hooks/use-mobile.ts`, `components/ui/input.tsx`,
  `components/ui/skeleton.tsx` — reverted to their pre-migration state, see
  above. Not radix-dependent, out of scope.

## Behavior changes

None beyond the universal `asChild` → `render` call-site mechanics (not a
behavior change, a syntax change).

## Verify by hand

1. Desktop (`≥ md`): sidebar should render as a fixed left column; the
   collapse trigger (`SidebarTrigger` in the header) should collapse it to
   icon-only width and back.
2. Mobile (resize `< md` or use device toolbar): open the sidebar via the
   trigger — it should slide in as a full-height sheet from the left, with
   NO page scroll bleeding through behind it (the `h-svh
   overflow-hidden` fix this migration preserved) — the specific thing to
   check is that the sheet doesn't visually overflow site the actual
   viewport height on mobile Safari/Chrome (address-bar collapse/expand
   scenarios).
3. Click the logo (top of sidebar) — should navigate home.
4. Click a nav item — should navigate to that tool and highlight as active.
5. Mobile footer language dropdown — opens above the trigger (`side="top"`),
   selecting a language updates it and closes the menu.
