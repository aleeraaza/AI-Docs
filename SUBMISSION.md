# SUBMISSION.md — Ajaia Docs

## Included in this folder / repository

| Item | Location |
|---|---|
| Source code | Entire repo (`src/`, `prisma/`, config) |
| Local setup instructions | `README.md` |
| Architecture note | `ARCHITECTURE.md` |
| AI workflow note | `AI_WORKFLOW.md` |
| This checklist | `SUBMISSION.md` |
| Walkthrough video URL | `WALKTHROUGH_URL.txt` |
| Env template | `.env.example` |
| Automated tests | `src/lib/documents.test.ts` (`npm test`) |

## Live product URL

```
TODO: paste deployed URL here after hosting
```

Suggested path: Vercel + Neon Postgres (see README deployment notes), or Railway/Render with SQLite volume.

## Reviewer credentials

All passwords: `password123`

- `alice@ajaia.dev` — owns seeded Welcome doc (shared with Bob)
- `bob@ajaia.dev` — has shared access to Alice’s Welcome doc
- `carol@ajaia.dev` — empty library for create/share demos

## Working

- Login / logout with seeded users
- Create, rename, rich-text edit, autosave, reopen
- Delete owned documents
- Import `.txt` / `.md` / `.docx` into a new document
- Share by email with view/edit; revoke access
- Owned vs Shared sections on dashboard
- Persistence across refresh (SQLite)

## Incomplete / not built

- Live multiplayer editing / cursors
- Comments / suggestions
- Version history
- DOCX/PDF import or export
- Link-based public sharing
- Production deploy URL (pending your host credentials / Drive upload)

## Next 2–4 hours

1. Deploy with Postgres and paste URL here + Drive folder
2. Record 3–5 min walkthrough → `WALKTHROUGH_URL.txt`
3. Optional stretch: Markdown export or presence indicator
