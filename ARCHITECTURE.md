# Architecture note — Ajaia Docs

## Product slice

The goal was a **coherent collaborative writing loop**, not a Google Docs clone. The slice prioritizes:

1. Create → edit with usable rich text → persist → reopen
2. Import text into that same editing model
3. Share with a second user and see owned vs shared clearly

Everything else (realtime CRDTs, comments, versions, Office formats) was cut to protect depth in those three flows.

## System shape

```
Browser (App Router UI)
  ├─ TipTap editor (HTML content)
  ├─ Cookie session (JWT via jose)
  └─ REST-ish Route Handlers
        └─ Prisma → SQLite
             ├─ User
             ├─ Document (ownerId, title, content HTML)
             └─ DocumentShare (permission: view|edit)
```

### Why Next.js full stack

One deployable unit for UI + API + auth cookies. Route Handlers keep document/share logic colocated with the product screens reviewers will click through.

### Why TipTap + HTML persistence

TipTap gives a coherent toolbar (bold/italic/underline/headings/lists) without building a custom editor. Storing HTML is pragmatic for this scope: formatting round-trips after refresh without a custom schema. Tradeoff: not ideal for CRDT merge later — acceptable for a single-writer / soft-collab demo.

### Why SQLite + Prisma

Zero paid services for local review, fast to seed, easy for reviewers. Schema stays portable to Postgres for hosted deploy. Prisma keeps access checks (`owner` vs `share`) explicit in queries rather than scattered ad-hoc SQL.

### Auth model

Lightweight email/password against seeded users + HTTP-only JWT cookie. Enough to demonstrate ownership and sharing without OAuth setup friction for reviewers.

### Sharing model

- **Owner**: full control (edit, share, delete)
- **Sharee**: `view` or `edit`
- Dashboard splits lists so the access story is visible without opening each doc

No nested folders, groups, or link-sharing — those add UI surface without teaching more about access intent.

### File upload choice

Import `.txt` / `.md` as a **new document**. That is product-relevant (kickstart a draft from notes) and reuses the same editor/persistence path. Attachment-only uploads were skipped — they don’t exercise editing quality.

## Validation & errors

- Zod on login / create / update / share payloads
- Explicit file type + size checks on import
- 401/403/404 distinctions for auth vs access vs missing docs
- Autosave with manual “Save now” fallback and visible save state

## Testing strategy

Unit tests cover Markdown/plain-text → HTML conversion (the riskiest pure logic in the import path). Auth/share flows are designed for fast manual demo with seeded accounts.

## What I’d build next (2–4 hours)

1. Neon/Postgres + Vercel production deploy with seed on first boot
2. Presence / “someone else has this open” indicator (no full CRDT yet)
3. Export to Markdown
4. Soft version snapshots on explicit Save
