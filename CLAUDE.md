# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This project uses a version of Next.js with breaking changes — APIs, conventions, and file structure may differ from training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any Next.js-specific code (routing, config, data fetching). Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

## Commands

```bash
npm run dev        # Start dev server (http://localhost:3000)
npm run build      # Production build
npm run start      # Serve production build
npm run typecheck  # tsc --noEmit
npm run lint       # ESLint (flat config, eslint.config.mjs)
npm run lint:fix   # ESLint with --fix
npm run format     # Prettier --write across **/*.{ts,tsx}
```

There is no test runner configured in this repo. Verification is via `typecheck` + `lint` + manual exercise of the tool in the browser (`npm run dev`).

## What this is

DevTools: a single Next.js (App Router) app hosting ~42 independent, client-side developer utilities (formatters, converters, encoders, generators, crypto tools, CSS helpers) grouped into 7 sidebar categories. Every tool runs entirely in the browser — no API routes, no server-side processing, no backend. Look for `app/api/` before assuming otherwise; as of now none exists.

## Architecture

**One tool = one file.** Each tool is a single self-contained `"use client"` page component at `app/tools/<category>/<tool-slug>/page.tsx`. Category folders use route groups (parens, e.g. `(generator)`, `(encoding)`) so they don't affect the URL — the tool's URL is always `/tools/<tool-slug>`. Tool logic (parsing, encoding, formatting algorithms) is normally inlined directly in `page.tsx`; only pull it into `constants/<category>/<tool-slug>.ts` when the page would otherwise get unwieldy (existing precedent: `constants/generators/`, `constants/formatters/sql-formatter.ts`, `constants/text/regex-tester.ts`, `constants/frontend/px-rem.ts`).

**Adding a new tool is a 3-step, low-coordination process** (this is the load-bearing convention of the whole codebase):

1. Create `app/tools/<category>/<tool-slug>/page.tsx` — default-export a client component.
2. Register it in `config/nav.ts` (add to the right `NavGroup.items`, pick a `lucide-react` icon) — this single file drives the sidebar, the command-palette search, and the home page grid simultaneously.
3. Add every user-facing string to **both** language blocks in `lib/i18n.ts` (`en` and `id`) under the `Translations` type (`typeof translations.en`). If introducing a brand-new nav group, also add it to `navGroupLabels` and `navGroupDescriptions` in the same file.

Skipping step 3 for one language causes a TS error (`Translations` requires the same keys in both blocks) — this is deliberate, it's the only thing enforcing i18n completeness.

**State persistence across navigation**: `useToolState(toolId, key, defaultValue)` (`hooks/use-tool-state.ts`) reads/writes an in-memory Zustand store (`stores/tool-states.ts`, not persisted to localStorage) keyed by `toolId`. Use it for every piece of input/output state a tool wants to survive a sidebar navigation away-and-back. Don't route non-serializable or large ephemeral data (e.g. an uploaded `File`/`Uint8Array`) through it — keep that in local `useState` instead (see `base-encoder/page.tsx` for the pattern: encoding/mode/text go through `useToolState`, the actual file bytes stay local).

Separately, `useStorage(key, defaultValue, "local" | "session")` (`hooks/use-storage.ts`) is real `localStorage`/`sessionStorage` persistence, used for language (`contexts/language-context.tsx`), theme, and the `"code-editor-word-wrap"` toggle shared by every `CodeEditor`-based tool. It's built on `useSyncExternalStore` rather than a `useState` initializer — reading storage synchronously during the initializer would return `defaultValue` on the server but the real persisted value on the client's first render, hydration-mismatching whenever a value was already saved. `useSyncExternalStore`'s separate `getServerSnapshot` avoids that.

**i18n**: `useLanguage()` (`contexts/language-context.tsx`) exposes `t: Translations` — always read UI copy via `t.someKey`, never hardcode strings in new code (some older tool pages hardcode a few labels like "Input"/"Output"; don't propagate that, follow `lib/i18n.ts` for new strings).

**Provider stack** is fixed in `app/layout.tsx`: `ThemeProvider > LanguageProvider > SearchProvider > TooltipProvider > SidebarProvider`, wrapping the persistent sidebar/header/footer chrome around the routed tool page. `ThemeProvider` (`components/theme-provider.tsx`) wraps `next-themes` and also installs a global `d` keydown hotkey that toggles dark/light — it no-ops while an input/textarea/select/contenteditable is focused, so new tools don't need to guard against it themselves.

**UI components**: shadcn/ui primitives live in `components/ui/` (Tailwind v4 + `class-variance-authority`, radix-ui under the hood) — prefer composing these over hand-rolling. `components.json` defines the shadcn config (style `radix-vega`, base color `neutral`, icon library `lucide`). Two-panel input/output layout (left=input, right=output, `grid lg:grid-cols-2`) is the standard shape for formatter/converter/encoder tools; look at `app/tools/(text)/markdown-preview/page.tsx` or `app/tools/(encoding)/base-encoder/page.tsx` as reference implementations.

Plain single-value text fields (a cipher's plaintext, an HMAC key/message) use `<Textarea>` from `components/ui/textarea` — pass only layout classes (`min-h-0`/`h-24`/`flex-1`, `resize-none`, `font-mono`, `bg-muted` for read-only output) since the component already supplies border/background/padding/focus-ring; don't re-add those. Structured or language-aware content (JSON, SQL, Go, Markdown, etc.) uses the shared `CodeEditor` instead (see Key dependencies). `diff-checker` is the one remaining raw-`<textarea>` exception, for its manual split-pane diff rendering.

Every `CodeEditor`-based tool also exposes a "Wrap lines" `Checkbox` (label key `t.wrapLines`) wired to `CodeEditor`'s `wordWrap` prop and backed by the shared `useStorage("code-editor-word-wrap", false, "local")` — one call per page even when a page renders multiple `CodeEditor` instances (e.g. `json-converter`'s two panels), so toggling always updates every panel on that page at once instead of drifting out of sync.

**Imports** are auto-sorted/enforced by `eslint-plugin-simple-import-sort` (`simple-import-sort/imports` and `/exports` are `error`-level lint rules, not just style).

## Key dependencies (don't reach for a new package if one of these covers it)

| Package                                   | Purpose                                                                                                                                                                                                                           |
| ----------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `js-yaml`                                 | YAML parse/dump (`yaml-formatter`, `json-converter`)                                                                                                                                                                              |
| `smol-toml`                               | TOML parse/stringify (`toml-formatter`)                                                                                                                                                                                           |
| `graphql`                                 | GraphQL parse/print (`graphql-formatter`)                                                                                                                                                                                         |
| `sql-formatter`                           | SQL formatting                                                                                                                                                                                                                    |
| `crypto-js`                               | AES/DES/RC4 symmetric encryption                                                                                                                                                                                                  |
| `marked`                                  | Markdown → HTML (`markdown-preview`)                                                                                                                                                                                              |
| `dompurify`                               | Sanitizes `marked` output before `dangerouslySetInnerHTML` — `marked` does not sanitize HTML itself, so any raw-HTML/`<script>` in the input passes through untouched otherwise                                                   |
| `qrcode`                                  | QR code generation                                                                                                                                                                                                                |
| `jsbarcode`                               | Barcode generation                                                                                                                                                                                                                |
| `zustand`                                 | In-memory per-tool state store                                                                                                                                                                                                    |
| `radix-ui`                                | Headless primitives behind `components/ui/`                                                                                                                                                                                       |
| `xlsx`                                    | XLSX export (`fake-data`)                                                                                                                                                                                                         |
| `@uiw/react-codemirror` + `@codemirror/*` | Code editor with syntax highlighting/folding — shared via `components/code-editor.tsx` (dynamically imported with `ssr: false`), used by every Format & Validasi tool plus `json-converter`/`struct-converter`/`markdown-preview` |
| `cm6-graphql`                             | GraphQL language support for the code editor                                                                                                                                                                                      |

XML and JSON↔XML use browser-native `DOMParser`/`XMLSerializer` — no package. RSA/ECDSA/HMAC use the browser-native Web Crypto API, not `crypto-js`.

## Safety notes specific to this repo

- Every tool is client-only; be wary of introducing anything CPU-quadratic on user-controlled input sizes without a guard (e.g. `base-encoder`'s Base58 codec uses `BigInt` arithmetic that's O(n²)-ish, so file mode caps it separately from the general 10MB file-size cap — see `MAX_BASE58_BYTES`/`MAX_BASE58_TEXT_LENGTH` in `app/tools/(encoding)/base-encoder/page.tsx`).
- `xlsx` is installed from `cdn.sheetjs.com`, not the npm registry (see the pinned URL in `package.json`) — the npm-published `xlsx` package is frozen at a version with an unpatched high-severity prototype-pollution/ReDoS advisory, and SheetJS only ships current fixes via their own CDN tarball. Don't `npm install xlsx` to "update" or "fix" it without checking this first.
- If a change touches `next.config.ts`, global build config, or `package.json` deps, treat it as wide-impact — flag it rather than changing silently.
