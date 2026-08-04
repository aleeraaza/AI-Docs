# Architecture note — Ali Docs

## Product slice

Goal: a **coherent collaborative writing loop**, not a Google Docs clone.

Prioritized:

1. Create → edit with usable rich text → persist → reopen  
2. Import files into that same editing model  
3. Share with a second user; show owned vs shared clearly  

Cut: realtime CRDTs, comments, versions, enterprise ACL, public links.

## System shape

```
Browser (App Router UI + TipTap)
  ├─ Cookie session (JWT via jose)
  └─ Route Handlers
        └─ Prisma 7 + Neon adapter
             ├─ User
             ├─ Document (ownerId, title, content HTML)
             └─ DocumentShare (permission: view | edit)
```

## Storage: Neon Postgres + Prisma 7

| Concern | Choice |
|---|---|
| Hosted DB | Neon free Postgres (no paid dependency for reviewers) |
| App queries | Pooled `DATABASE_URL` (`-pooler`) via `@prisma/adapter-neon` |
| CLI / `db push` | Direct `DIRECT_URL` in `prisma.config.ts` |
| Schema | `provider = "postgresql"` — **no `url` in schema** (Prisma 7) |

Local SQLite was used early; production/review path is Neon so data survives serverless deploy.

## Why TipTap + HTML

Usable toolbar without a custom editor. HTML persistence is pragmatic for single-writer / soft-collab demos. Tradeoff: not ideal for CRDT merge later — accepted for this scope.

## Auth & sharing

- Seeded email/password + HTTP-only JWT cookie  
- **Owner**: edit, share, delete  
- **Sharee**: `view` (Reader) or `edit` (Writer)  
- Dashboard filters: Owned by anyone / me / Shared with me  

## File import & export

- **Import**: `.txt`, `.md`, `.docx` → new document  
- **Export** (stretch): `.docx`, `.pdf`, `.md`, `.txt` from the editor  

## Validation & quality

- Zod on auth / document / share payloads  
- File type + 2MB size checks on import  
- 401 / 403 / 404 distinctions  
- Vitest coverage for Markdown/plain-text → HTML conversion  

## What I’d build next (2–4 hours)

1. Vercel production deploy with env vars + seed  
2. Walkthrough video + Drive submission pack  
3. Soft version snapshots on explicit Save  
4. Access-control unit tests for `getDocumentAccess`
