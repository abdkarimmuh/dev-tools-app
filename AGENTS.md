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
- [lib/](lib/) and [contexts/](contexts/) — utilities and app contexts

When making changes, link to these files in your PR description so reviewers can follow context.

## Conventions & patterns

- Uses Next.js App Router (app/). Prefer page-level single-file components: `app/tools/<name>/page.tsx`.
- TypeScript strict typing, run `npm run typecheck` before PRs.
- Tailwind CSS v4 + shadcn UI component patterns — prefer existing component primitives in `components/ui/`.
- `config/nav.ts` is the single source for sidebar/home navigation; updating it auto-updates UI.
- Use `sonner` for toast feedback where appropriate (see `components/ui/sonner.tsx`).

## How to add a new tool (minimal example)

1. Create `app/tools/<tool-name>/page.tsx` with a default export React component.
2. Add an entry to `config/nav.ts` so the sidebar and home page show the tool.

Example snippet (to include in patch/PR):

```ts
// config/nav.ts (add to an appropriate group)
{ title: "My Tool", url: "/tools/my-tool", icon: IconName }
```

## Verification checklist for PRs

- Runs: `npm run build`, `npm run typecheck`, `npm run lint` locally
- UI: run `npm run dev` and verify new pages appear under `/tools` and in the sidebar
- Tests: (none present by default) include instructions if adding test suites

## Safety & escalation

- If a change touches `next.config.ts`, global build config, or deps, ask a human to review prior to merging.
- If unsure about permission to push or create branches, open an issue describing the intended change.

## Suggested next customizations

- Create a small `add-tool` skill that scaffolds `app/tools/<name>/page.tsx` and updates `config/nav.ts`.
- Add a `lint-and-typecheck` agent hook that runs `npm run lint && npm run typecheck` on generated patches before creating PRs.

If you want, I can scaffold the `add-tool` skill next (creates template files and a usage example). Reply yes to proceed.

