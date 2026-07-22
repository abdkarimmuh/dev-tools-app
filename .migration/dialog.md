# dialog

2026-07-22, strategy: golden pair via CLI (`shadcn add dialog --overwrite`), whole-project mode. Verdict: migrated cleanly; one downstream consumer (`command.tsx`) needed a type-only fix.

## Changed

- `components/ui/dialog.tsx` — replaced with the `base-vega` registry
  variant (`Dialog` from `@base-ui/react/dialog`). CLI resolved
  `IconPlaceholder` to `XIcon` from `lucide-react`. Same false-positive
  story as the menu components: raw-JSON diff showed `cn-font-heading`
  (golden) vs `font-heading` (local) on `DialogTitle`; the CLI's
  preset-aware resolution against this project's `fontHeading: "inherit"`
  config confirmed `font-heading` (no `cn-` prefix) is correct for this
  project — the wrapper was already pristine. Reformatted with `prettier
  --write` + `eslint --fix`. Leftover scan: clean.
- `components/ui/command.tsx:33-45` (the `cmdk`-based command palette,
  itself explicitly out of scope for this migration) — `CommandDialog`
  wraps our `Dialog`/`DialogContent` and previously typed its `children`
  prop via `React.ComponentProps<typeof Dialog>`. Base UI's
  `Dialog.Root.Props.children` widened to `ReactNode |
  PayloadChildRenderFunction<Payload>` (a new render-prop-with-payload
  feature Radix didn't have), which `DialogContent`'s `Popup.Props.children`
  (plain `ReactNode`) doesn't accept — a real `tsc` error
  (`command.tsx(59,9)`). Fixed by narrowing just `CommandDialog`'s own
  `children` prop to `React.ReactNode` (`Omit<..., "children"> & {
  children?: React.ReactNode }`), since `CommandDialog` never uses the
  payload-render-function variant — it always passes plain children through
  to `DialogContent`. This does not touch `cmdk` itself, only the
  wrapper-composition type in this project's own file.

## Left alone

- `components/ui/command.tsx`'s use of `cmdk`'s own `Command` primitive is
  untouched — only the `Dialog`-consuming type signature was adjusted.

## Behavior changes

- `onOpenAutoFocus`/`onCloseAutoFocus` (Radix) become `initialFocus`/
  `finalFocus` (element/ref-based, not event-based) in Base UI — not used
  by any consumer in this app.
- Escape/outside-click handler props are consolidated differently in Base
  UI dialogs — not used by any consumer here either.

## Verify by hand

1. Open the command palette (search icon in the header, or its keyboard
   shortcut if wired) — dialog should open centered, focus should land
   inside it, Escape should close it.
2. Any other `<Dialog>` consumer in the app: open/close, confirm the
   backdrop dims the page and the close (X) button works.
