<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

## Purpose

Concise instructions for AI coding agents working in this repository: help implement, refactor, and improve code with minimal disruption; prefer small, reviewable changes; ask for approval on ambiguous or wide-impact edits.

## Allowed & Prohibited Actions

- Allowed: read the codebase, run local build/test/typecheck/lint commands, create or modify files, generate small examples or templates, and suggest PR-ready patches.
- Prohibited without explicit human approval: push or merge to protected branches, publish packages, modify CI or deployment pipelines, handle secrets, or perform any destructive global search-and-replace.

## Onboarding (quick commands)

Install and run locally:

```bash
npm install
npm run dev        # start Next dev server (http://localhost:3000)
npm run build      # production build
npm run start      # serve production build
npm run typecheck  # TypeScript checks
npm run lint       # ESLint
npm run format     # Prettier (formats .ts/.tsx)
```

## Repo layout & hotspots (use these first)

- [README.md](README.md) — project overview and how-to
- [package.json](package.json) — scripts and deps
- [tsconfig.json](tsconfig.json) — TypeScript settings
- [next.config.ts](next.config.ts) — Next.js config (read before changing)
- [postcss.config.mjs](postcss.config.mjs) — Tailwind/PostCSS setup
- [app/layout.tsx](app/layout.tsx) — root layout (sidebar + header)
- [app/page.tsx](app/page.tsx) — home / tools index
- [app/tools/](app/tools/) — each tool lives here; add new tools as folders
- [components/layouts/](components/layouts/) — `app-sidebar.tsx`, `site-header.tsx`, `tool-search.tsx`
- [components/ui/](components/ui/) — UI primitives following shadcn patterns
- [config/nav.ts](config/nav.ts) — central navigation (update to expose new tools)
- [lib/i18n.ts](lib/i18n.ts) — all UI strings in EN + ID; add keys here for new tools
- [lib/](lib/) and [contexts/](contexts/) — utilities and app contexts

When making changes, link to these files in your PR description so reviewers can follow context.

## Current tool inventory (42 tools across 7 categories)

### Format & Validasi (9 tools)

`json-formatter`, `js-formatter` (JS/TS via Select), `html-formatter`, `css-formatter`, `sql-formatter`, `xml-formatter`, `yaml-formatter`, `toml-formatter`, `graphql-formatter`

### Converter (4 tools)

`json-converter` (JSON ↔ CSV/XML/YAML via Select), `struct-converter` (JSON ↔ Go struct/TS interface via Select), `number-base`, `unix-timestamp`

### Encoding (4 tools)

`base-encoder`, `ascii-cheatsheet`, `jwt-decoder`, `hash-generator`

### Text (6 tools)

`diff-checker`, `case-converter`, `regex-tester`, `markdown-preview`, `word-counter`, `json-path`

### Generator (8 tools)

`uuid-generator`, `lorem-ipsum`, `password-generator`, `qr-generator`, `barcode-generator`, `cron-generator`, `fake-data`, `tree-generator`

### Cryptography (6 tools)

`aes-cipher`, `des-cipher`, `rc4-cipher`, `rsa`, `ecdsa`, `api-signature`

### Frontend / CSS (5 tools)

`color-converter`, `px-rem`, `gradient-generator`, `box-shadow-generator`, `html-entities-cheatsheet`

## Conventions & patterns

- Uses Next.js App Router (app/). Prefer page-level single-file components: `app/tools/<name>/page.tsx`.
- TypeScript strict typing, run `npm run typecheck` before PRs.
- Tailwind CSS v4 + shadcn UI component patterns — prefer existing component primitives in `components/ui/`.
- `config/nav.ts` is the single source for sidebar/home navigation; updating it auto-updates UI.
- `lib/i18n.ts` contains all UI text strings in English and Indonesian. Add new keys to **both** language blocks, then add the new group key to `navGroupLabels` if adding a new category.
- Use `useToolState(toolId, key, defaultValue)` for all persistent input/output state — this prevents state loss on navigation.
- Use `useLanguage()` from `contexts/language-context.tsx` to access translated strings via `t.keyName`.
- Use `sonner` for toast feedback where appropriate (see `components/ui/sonner.tsx`).
- All tool pages are `"use client"` components.
- Two-panel input/output layout (left=input, right=output) is the standard for formatter and converter tools.
- Plain text fields use `<Textarea>` from `components/ui/textarea` (only layout classes in `className` — border/background/padding/ring already come from the component); structured/code content uses the shared `CodeEditor` (`components/code-editor.tsx`) instead. `diff-checker` is the only tool still on a raw `<textarea>`.
- `CodeEditor` tools include a "Wrap lines" checkbox backed by `useStorage("code-editor-word-wrap", false, "local")` — one hook call per page (even for multi-panel tools) so all panels toggle together.
- `useStorage` (`hooks/use-storage.ts`) is built on `useSyncExternalStore`, not a `useState` initializer, so it never hydration-mismatches when a value was already persisted.

## Key dependencies

| Package                                   | Purpose                                                                                                                                                             |
| ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `js-yaml`                                 | YAML parse/dump (yaml-formatter, json-converter)                                                                                                                    |
| `smol-toml`                               | TOML parse/stringify (toml-formatter)                                                                                                                               |
| `graphql`                                 | GraphQL parse/print (graphql-formatter)                                                                                                                             |
| `sql-formatter`                           | SQL formatting (sql-formatter)                                                                                                                                      |
| `crypto-js`                               | AES/DES/RC4 symmetric encryption                                                                                                                                    |
| `marked`                                  | Markdown → HTML (markdown-preview)                                                                                                                                  |
| `dompurify`                               | Sanitizes `marked` output before `dangerouslySetInnerHTML` (markdown-preview)                                                                                       |
| `qrcode`                                  | QR code generation                                                                                                                                                  |
| `jsbarcode`                               | Barcode generation                                                                                                                                                  |
| `xlsx`                                    | XLSX export (fake-data)                                                                                                                                             |
| `@uiw/react-codemirror` + `@codemirror/*` | Code editor w/ syntax highlighting & folding (`components/code-editor.tsx`, used by all Format & Validasi tools + json-converter/struct-converter/markdown-preview) |
| `cm6-graphql`                             | GraphQL language support for the code editor                                                                                                                        |

XML and JSON↔XML use browser-native `DOMParser` / `XMLSerializer` — no external package.

`xlsx` is installed from `cdn.sheetjs.com`, not the npm registry (see the pinned URL in `package.json`) — the npm-published `xlsx` package is frozen at a version with an unpatched high-severity prototype-pollution/ReDoS advisory. Don't `npm install xlsx` to "fix" or update it without checking this first.

## How to add a new tool (minimal example)

1. Create `app/tools/<tool-name>/page.tsx` with a default export React component.
2. Add an entry to `config/nav.ts` so the sidebar and home page show the tool.
3. Add any new UI strings to both language blocks in `lib/i18n.ts`.

Example snippet:

```ts
// config/nav.ts (add to an appropriate group)
{ title: "My Tool", url: "/tools/my-tool", icon: IconName }
```

```ts
// page.tsx skeleton
"use client";
import { useToolState } from "@/hooks/use-tool-state";
import { useLanguage } from "@/contexts/language-context";

export default function MyToolPage() {
  const { t } = useLanguage();
  const [input, setInput] = useToolState("my-tool", "input", "");
  // ...
}
```

## Verification checklist for PRs

- Runs: `npm run build`, `npm run typecheck`, `npm run lint` locally
- UI: run `npm run dev` and verify new pages appear under `/tools` and in the sidebar
- Tests: (none present by default) include instructions if adding test suites

## Safety & escalation

- If a change touches `next.config.ts`, global build config, or deps, ask a human to review prior to merging.
- If unsure about permission to push or create branches, open an issue describing the intended change.
