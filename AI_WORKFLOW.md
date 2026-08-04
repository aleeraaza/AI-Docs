# AI workflow note — Ali Docs

## Tools used

- **Cursor (Composer)** for scaffolding Next.js App Router, TipTap wiring, sharing UI, and docs drafts  
- Official **Neon + Prisma 7** docs for the driver-adapter / `prisma.config.ts` migration  
- Occasional web lookup for TipTap StarterKit capabilities and shadcn/Base UI patterns  

## Where AI sped things up

- Boilerplate: seed users, REST handlers, dashboard/editor shells  
- TipTap toolbar expansion and autosave client flow  
- First drafts of README / architecture / submission notes  
- Prisma 7 + Neon adapter wiring after reading current docs  

## What I changed or rejected

- **Rejected Prisma 7 on day one** for SQLite/`better-sqlite3` complexity on Windows; later **adopted Prisma 7 correctly** with Neon (no `url` in schema; CLI via `prisma.config.ts`)  
- Rejected accidental npm packages from a typo’d install  
- Rejected claiming DOCX support before Mammoth was wired; later added it deliberately  
- Tightened Google Docs–inspired UI instead of accepting generic “AI dashboard” chrome  
- Split pure HTML conversion helpers from Prisma-backed access helpers so unit tests don’t require a live DB  

## How correctness was verified

- `npx prisma db push` + seed against Neon → demo users and shared sample doc  
- `npm test` → import conversion unit tests  
- Manual flows: Ali edits → share with Carol → Bob opens shared → import `.md`/`.docx` → export → refresh persistence  

AI drafted fast; human judgment set scope cuts, Neon/Prisma layout, and what “done” meant for sharing and import.
