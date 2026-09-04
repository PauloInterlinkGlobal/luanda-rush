<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Base44 dev environment

This is a TanStack Start (SSR via nitro) + Vite + Phaser game ("LOTADOR") using **bun** as its package manager.

### Running

```
docker compose -f docker-compose.base44.yml up -d
```

- Base image: `oven/bun:1.2-debian`; source bind-mounted at `/app`.
- Dev command: `bun run dev` → `vite dev` (live reload, no rebuild needed for edits).
- The `@lovable.dev/vite-tanstack-config` plugin **forces the dev server to port 8080** (`strictPort` in sandbox mode). The compose file maps host `3000 → container 8080`.
- `vite.config.ts` sets `server.allowedHosts: true` so the preview's external hostname is accepted (required — the lovable config does not set `allowedHosts`).
- No external secrets or database required; the app is fully self-contained (client-side Phaser game with SSR shell).

### Verifying

- `curl -sf http://localhost:3000/` returns the SSR page ("A carregar o jogo...").
- `curl -sf -H "Host: external-preview.example.com" http://localhost:3000/` must also return the page (external-host check).
- Dev server logs show `VITE v8.2.0 ready` and serves unhashed source modules (`/src/styles.css`), confirming live source — not a prebuilt bundle.
