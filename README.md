# Ali Docs

Collaborative documents by **Ali Raza** — a Google Docs–inspired editor built with Next.js.

## Demo accounts

| Email | Password | Notes |
|---|---|---|
| `ali@alidocs.dev` | `password123` | Ali Raza — owns the sample Welcome doc |
| `bob@alidocs.dev` | `password123` | Shared access to Ali’s sample doc |
| `carol@alidocs.dev` | `password123` | Clean slate for create/share tests |

## Local setup

### Prerequisites

- Node.js 20+ (tested on 22)
- npm 10+

### Install & run

```bash
npm install
cp .env.example .env
npm run db:setup
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Useful scripts

| Script | Purpose |
|---|---|
| `npm run dev` | Next.js dev server (Turbopack) |
| `npm run build` | Production build |
| `npm start` | Run production server |
| `npm test` | Vitest unit tests |
| `npm run db:setup` | Push schema + seed users |
| `npm run db:seed` | Re-seed users / sample doc |

## Supported file uploads

- `.txt` → paragraphs preserved as HTML
- `.md` / `.markdown` → basic headings, bold/italic, lists converted to HTML
- `.docx` → converted to HTML via Mammoth (max 2MB)

## Stack

- **Next.js 16** (App Router) + React 19 + TypeScript
- **Prisma 6** + **SQLite**
- **TipTap** rich-text editor
- **jose** + **bcryptjs** for sessions / passwords
- **Zod** request validation
- **Vitest** for unit tests

## Deployment notes

SQLite is ideal for local review. For a hosted demo (Vercel / similar serverless):

1. Switch `DATABASE_URL` to a free Postgres (e.g. Neon) and set `provider = "postgresql"` in `prisma/schema.prisma`
2. Set `AUTH_SECRET` to a long random string
3. Run `npx prisma db push && npm run db:seed` against the remote DB
4. Deploy with `npm run build`

Alternatively keep SQLite on a long-running host (Railway / Render / Fly) with a persistent volume.

## Project docs

- [`ARCHITECTURE.md`](./ARCHITECTURE.md) — prioritization & design choices
- [`AI_WORKFLOW.md`](./AI_WORKFLOW.md) — how AI was used on this exercise
- [`SUBMISSION.md`](./SUBMISSION.md) — deliverables checklist
- [`WALKTHROUGH_URL.txt`](./WALKTHROUGH_URL.txt) — walkthrough video link (add after recording)

## Intentionally deprioritized

- Real-time multiplayer cursors / CRDT sync
- Comments / suggestions
- Version history
- PDF / DOCX export
- Enterprise SSO / fine-grained ACLs beyond owner + view/edit share

With another 2–4 hours: live presence indicators, Markdown export, and Postgres-backed Vercel deploy polish.
