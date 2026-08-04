# SUBMISSION.md — Ali Docs

## Included in this repository

| Item | Location |
|---|---|
| Source code | Entire repo (`src/`, `prisma/`, config) |
| Local setup | `README.md` |
| Architecture note | `ARCHITECTURE.md` |
| AI workflow note | `AI_WORKFLOW.md` |
| This checklist | `SUBMISSION.md` |
| Walkthrough video URL | `WALKTHROUGH_URL.txt` |
| Env template | `.env.example` |
| Automated tests | `src/lib/documents.test.ts` (`npm test`) |
| Sample import file | `samples/meeting-notes.md` |

## Live product URL

```
TODO: paste Vercel (or other) deployed URL after hosting
```

Database for review/dev: **Neon Postgres** (configured via `.env`).

## Reviewer credentials

All passwords: `password123`

| Account | Role in demo |
|---|---|
| `ali@alidocs.dev` | Ali Raza — owns seeded Welcome doc (shared with Bob) |
| `bob@alidocs.dev` | Sees Welcome under Shared (Writer) |
| `carol@alidocs.dev` | Empty library — use for create / receive-share demos |

## Working

- Login / logout with seeded users  
- Create, rename, rich-text edit, autosave, reopen  
- Delete owned documents  
- Templates (blank + resume / meeting notes / proposal / letter)  
- Import `.txt` / `.md` / `.docx`  
- Export `.docx` / `.pdf` / `.md` / `.txt`  
- Share by email with Reader / Writer; revoke access  
- Owned vs Shared filters on dashboard  
- Persistence on Neon (survives refresh)  

## Incomplete / not built

- Live multiplayer editing / cursors  
- Comments / suggestions  
- Version history  
- Link-based public sharing  
- Production app deploy URL (next step after local Neon verification)  
- Walkthrough video URL  

## Next 2–4 hours

1. Deploy app to Vercel with Neon env vars; paste live URL here  
2. Record 3–5 min walkthrough → `WALKTHROUGH_URL.txt`  
3. Pack Google Drive folder for submission  
4. Optional: soft version snapshots + access-control tests  
