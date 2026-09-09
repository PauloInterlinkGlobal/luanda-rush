<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in the
> editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Base44 Dev Environment

**Stack:** Vite 8 + TanStack Start (SSR via nitro) + React 19 + Phaser 3 + Tailwind v4. Package manager: Bun.

**Run:** `docker compose -f docker-compose.base44.yml up -d` — starts the Vite dev server on port 5173, mapped to host port 3000.

**No external services or credentials required.** This is a frontend-only game; no database, no API keys.

**Live reload:** The Vite dev server watches the bind-mounted source. Frontend edits appear automatically in the preview.

**Key files:**
- `vite.config.ts` — wraps `@lovable.dev/vite-tanstack-config` (includes TanStack Start, React, Tailwind, SSR/nitro, sandbox detection). Phaser is pre-bundled via `optimizeDeps.include`.
- `src/routes/index.tsx` — home route, lazy-loads the Phaser game canvas (client-only).
- `src/game/` — Phaser game scenes, entities, systems, data.
- `src/server.ts` — custom SSR entry with error handling wrapper.
- `src/start.ts` — TanStack Start instance with CSRF + error middleware.

**Verify:** `curl -s -o /dev/null -w '%{http_code}' http://localhost:3000/` should return 200.
