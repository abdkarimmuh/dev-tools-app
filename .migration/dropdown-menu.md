# dropdown-menu

2026-07-22, strategy: golden pair via CLI (`shadcn add dropdown-menu --overwrite`), whole-project mode. Verdict: migrated cleanly; three consumers needed `asChild` → `render`.

## Changed

- `components/ui/dropdown-menu.tsx` — replaced with the `base-vega`
  registry variant (`Menu` from `@base-ui/react/menu`, re-exported under the
  `DropdownMenu*` names — Base UI has no separate "dropdown menu" primitive,
  it's the same `Menu` component Radix's `DropdownMenu` and `ContextMenu`
  both used to be distinct for). The CLI resolved `IconPlaceholder` markers
  to `CheckIcon`/`ChevronRightIcon` from `lucide-react`.
  **Note on an initial false positive**: a raw (non-CLI) fetch of the
  `radix-vega` registry JSON for this component showed `cn-menu-target
  cn-menu-translucent` utility classes on the content/sub-content panels
  that this project's installed file lacked — first read as a hand
  customization to preserve via 3-way merge. Re-fetching through the actual
  `shadcn add` CLI (which resolves the registry against this project's real
  `components.json` — specifically `menuColor: "default"`, `menuAccent:
  "subtle"`) showed those classes are conditionally emitted based on that
  config, and for THIS project's exact config they're correctly absent —
  matching what was already installed. So this wrapper was actually
  pristine all along; the raw-JSON diff was misleading because it doesn't
  apply preset resolution. Reformatted with `prettier --write` + `eslint
  --fix` (had to re-run prettier after eslint's export-sort autofix left a
  malformed brace — `eslint --fix` on this file's export list doesn't
  always emit prettier-compatible output). Leftover scan: clean.
- `app/tools/(generator)/fake-data/page.tsx:557-565`,
  `components/layouts/site-header.tsx:39-50`,
  `components/layouts/app-sidebar.tsx:106-119` — three
  `<DropdownMenuTrigger asChild><Button>...</Button></DropdownMenuTrigger>`
  call sites converted to `<DropdownMenuTrigger render={<Button>...}/>`.

## Left alone

Nothing else in this component's family.

## Behavior changes

- **Menu items no longer close on click by default**: per
  `consumer-props.md`, Base UI's `closeOnClick` defaults to `false` on
  `CheckboxItem`/`RadioItem` (Radix always closed on select). This app's
  `DropdownMenuItem` usages (export-format pickers, language switcher) are
  plain items, not checkbox/radio items, so this specific default doesn't
  apply to them — flagging for awareness if a future menu adds
  checkbox/radio items.

## Verify by hand

1. `/tools/fake-data`: generate data, click Export — the dropdown should
   open below the button; clicking JSON/CSV should close the menu and
   trigger the export.
2. Site header (desktop) and sidebar footer (mobile, resize below `md`):
   click the language dropdown (EN/ID) — menu opens, selecting an option
   updates the language and closes the menu.
3. Keyboard: Tab to the trigger, Enter to open, arrow keys to move between
   items, Enter to select.
