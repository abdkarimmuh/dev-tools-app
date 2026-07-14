# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Important: Next.js version

This project uses Next.js 16.2.6, which has breaking changes vs. training data (APIs, conventions, file structure may differ). If `node_modules/next/dist/docs/` exists, read the relevant guide there before writing Next.js-specific code, and heed deprecation notices.

## Commands

```bash
npm run dev        # start Next dev server (http://localhost:3000)
npm run build      # production build
npm run start      # serve production build
npm run typecheck  # tsc --noEmit
npm run lint        # ESLint
npm run lint:fix    # ESLint with --fix
npm run format      # Prettier, writes **/*.{ts,tsx}
```

There is no test suite in this repo. Verify changes with `typecheck`, `lint`, and manual testing via `npm run dev`.

## Architecture

DevTools is a single Next.js App Router app that hosts ~42 independent client-side developer tools (formatters, converters, encoders, generators, crypto utilities, CSS helpers). Every tool runs entirely in the browser — no backend/API routes; all parsing, formatting, and crypto happens client-side (Web Crypto API, crypto-js, js-yaml, sql-formatter, etc.).

### How a tool is wired up

Each tool is a self-contained route with three touchpoints:

1. **`app/tools/(category)/<tool-name>/page.tsx`** — the tool itself. Route groups (`(formater)`, `(converter)`, `(encoding)`, `(text)`, `(generator)`, `(cryptography)`, `(frontend)`) organize tools by category without affecting the URL, which is always `/tools/<tool-name>`. Every tool page is a single-file `"use client"` component.
2. **`config/nav.ts`** — the single source of truth for sidebar/home navigation. `navMenus` (grouped nav items) and `navTitleMap` (url → title, derived from it) drive the sidebar, the header title, and the home page tool list. Adding an entry here is what makes a new tool appear in the UI.
3. **`lib/i18n.ts`** — all UI strings, keyed in parallel `en` and `id` blocks under `translations`. Every new string needs a key added to **both** blocks. Components read strings via `useLanguage()` → `t.keyName`, never hardcoded text.

To add a new tool: create the page file, add a nav entry, add any new i18n keys to both languages. See AGENTS.md for a fuller worked example.

### State persistence

Tool input/output state must survive navigation away and back. Use `useToolState(toolId, key, defaultValue)` (`hooks/use-tool-state.ts`) instead of local `useState` for anything the user typed or generated — it's backed by `stores/tool-states.ts`, a single in-memory Zustand store keyed by `toolId` then `key`. `use-storage.ts` in `hooks/` is legacy and not the pattern to follow for new tools.

### UI conventions

- Two-panel input/output layout (input left, output right) is standard for formatter/converter tools.
- Reference/cheatsheet tools (e.g. `ascii-cheatsheet`, `html-entities-cheatsheet`) use a different pattern: a live search `Input` filtering a static list of `{ title, entries }` sections (defined in `constants/<category>/<tool-name>.ts`), rendered as click-to-copy rows.
- Tool variants (e.g. JS vs TS, CSS vs SCSS, SQL dialect) are chosen via a `Select` dropdown within a single tool page rather than separate routes.
- `components/ui/` holds shadcn/ui primitives; prefer these over ad-hoc markup.
- `components/layouts/` holds `app-sidebar.tsx`, `site-header.tsx`, and `tool-search.tsx` (the Cmd/Ctrl+K command palette, built on `cmdk`).
- Use `sonner` (`components/ui/sonner.tsx`) for toast feedback.
- Theming is dark/light via `next-themes`.

### Notable libraries by tool domain

| Package | Used for |
|---|---|
| `js-yaml` | YAML parse/dump |
| `smol-toml` | TOML parse/stringify |
| `graphql` | GraphQL parse/print |
| `sql-formatter` | SQL formatting |
| `crypto-js` | AES/DES/3DES/RC4 symmetric ciphers |
| Web Crypto API | RSA, ECDSA, HMAC, SHA hashing |
| `marked` | Markdown → HTML |
| `qrcode` / `jsbarcode` | QR / barcode generation |
| `xlsx` | XLSX export (Fake Data Generator) |

XML tools and JSON↔XML conversion use the browser-native `DOMParser`/`XMLSerializer` — no external XML package. Prettier runs client-side via its standalone browser build for the JS/TS/HTML/CSS formatters.

`xlsx` (SheetJS) is installed from `cdn.sheetjs.com`, not the npm registry — the npm-published `xlsx` package is frozen at a version with an unpatched high-severity prototype-pollution/ReDoS advisory; SheetJS ships current fixes only via their own CDN tarball. See the `xlsx` entry in `package.json` for the exact pinned URL. Don't `npm install xlsx` to "fix" or update it without checking this first.

## Code style

- Import order is enforced by `eslint-plugin-simple-import-sort` (auto-fixable via `npm run lint:fix`).
- `@typescript-eslint/no-explicit-any` is disabled — `any` is permitted where needed.
- Prettier config: semicolons, double quotes, no trailing commas, 80 print width (see `.prettierrc`).
- Path alias `@/*` maps to the repo root (see `tsconfig.json`).

## Scope boundaries

Changes to `next.config.ts`, global build config, or dependencies should be flagged to a human before merging — don't push/merge to protected branches, publish packages, or modify CI/deploy pipelines without explicit approval.
