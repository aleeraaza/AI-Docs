# AI workflow note — Ajaia Docs

## Tools used

- **Cursor agent (Composer)** for scaffolding Next.js App Router structure, Prisma schema, TipTap editor wiring, API routes, and first-pass UI
- Occasional web lookup for **Next.js 16.3** and **Prisma 6 vs 7** setup differences (adapter requirements)

## Where AI sped things up

- Boilerplate: project scripts, seed users, REST handlers, login/dashboard shells
- TipTap toolbar + autosave client state machine
- First drafts of README / architecture / submission docs

## What I changed or rejected

- **Rejected Prisma 7 + better-sqlite3 adapter path** for this exercise — more moving parts on Windows/serverless than the timebox justified; kept Prisma 6 + classic SQLite client
- **Rejected accidental npm packages** (`tip` / `tap`) introduced by a typo’d install command
- **Tightened product copy and scope** in UI (owned vs shared badges, import limits, demo account picker) rather than accepting generic dashboard chrome
- **Simplified Markdown importer** to headings/emphasis/lists only — avoided claiming DOCX support
- Adjusted TipTap `immediatelyRender: false` for Next.js SSR compatibility after initial generation

## How correctness was verified

- `npx prisma db push` + seed → demo users and shared sample doc
- `npm test` → import conversion unit tests
- `npm run build` → TypeScript / Next production compile
- Manual flow: Alice edits → share with Carol → Carol sees Shared list → Bob opens seeded shared doc → import `.md` → refresh persistence check

AI drafted fast; human judgment set the scope cuts, storage choice, and what “done” meant for sharing and import.
