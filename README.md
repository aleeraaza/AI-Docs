# Ali Docs

Collaborative documents by **Ali Raza** — a Google Docs–inspired editor built with Next.js 16.

## Demo accounts

| Email | Password | Notes |
|---|---|---|
| `ali@alidocs.dev` | `password123` | Ali Raza — owns the sample Welcome doc |
| `bob@alidocs.dev` | `password123` | Shared Writer access to Ali’s sample doc |
| `carol@alidocs.dev` | `password123` | Clean slate for create/share tests |

## What works

- Create, rename, rich-text edit, autosave, reopen, delete (owners)
- TipTap formatting: bold, italic, underline, strike, headings, lists, quote, code, links
- Import `.txt` / `.md` / `.docx` → new editable document (max 2MB)
- Export `.docx` / `.pdf` / `.md` / `.txt`
- Sharing: owner grants **Reader** or **Writer**; dashboard Owned vs Shared filters
- Persistence on **Neon Postgres** via Prisma 7

## Local setup

### Prerequisites

- Node.js 20+ (tested on 22)
- npm 10+
- A Neon project (free tier is fine)

### 1. Install

```bash
npm install
cp .env.example .env
```

### 2. Configure `.env`

From the Neon Console → **Connect**, copy **both** URLs:

```ini
# Pooled (hostname includes -pooler) — used by the Next.js app
DATABASE_URL="postgresql://...?sslmode=require"

# Direct (no -pooler) — used by Prisma CLI (db push / migrate)
DIRECT_URL="postgresql://...?sslmode=require"

AUTH_SECRET="replace-with-a-long-random-string"
```

### 3. Schema + seed

```bash
npm run db:setup
```

This runs `prisma db push` against `DIRECT_URL`, then seeds demo users.

### 4. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Useful scripts

| Script | Purpose |
|---|---|
| `npm run dev` | Next.js dev server (Turbopack) |
| `npm run build` | Generate Prisma client + production build |
| `npm start` | Run production server |
| `npm test` | Vitest unit tests |
| `npm run db:push` | Push schema to Neon |
| `npm run db:seed` | Seed demo users / sample doc |
| `npm run db:setup` | Push + seed |

## Supported uploads

| Type | Behavior |
|---|---|
| `.txt` | Paragraphs → HTML |
| `.md` / `.markdown` | Headings, emphasis, lists → HTML |
| `.docx` | Converted via Mammoth (max 2MB) |

Limits are also shown in the dashboard UI.

## Stack

- **Next.js 16** (App Router) + React 19 + TypeScript
- **Prisma 7** + **`@prisma/adapter-neon`** + **Neon Postgres**
- **TipTap** editor
- **jose** + **bcryptjs** sessions
- **Zod** validation · **Vitest** tests · **shadcn/ui**

### Prisma 7 layout (important)

- Connection URL is **not** in `schema.prisma`
- CLI uses [`prisma.config.ts`](./prisma.config.ts) → `DIRECT_URL`
- Runtime uses [`src/lib/db.ts`](./src/lib/db.ts) → pooled `DATABASE_URL` via Neon adapter
- Generated client lives in `src/generated/prisma` (gitignored)

## Project docs

- [`ARCHITECTURE.md`](./ARCHITECTURE.md) — prioritization & design choices
- [`AI_WORKFLOW.md`](./AI_WORKFLOW.md) — how AI was used
- [`SUBMISSION.md`](./SUBMISSION.md) — deliverables checklist
- [`WALKTHROUGH_URL.txt`](./WALKTHROUGH_URL.txt) — walkthrough video link

## Intentionally deprioritized

- Real-time multiplayer cursors / CRDT sync
- Comments / suggestions
- Version history
- Public link sharing / SSO

With another 2–4 hours: Vercel deploy polish, walkthrough video, optional soft version snapshots.
