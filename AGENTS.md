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

# Base44 dev environment

## Stack
Lovable-generated Vite 8 + TanStack Start (SSR via nitro) + React 19 + Phaser 3 game.
Package manager: **bun** (bun.lock, bunfig.toml).

## Running
`docker compose -f docker-compose.base44.yml up -d`
- Base image: `oven/bun:1.2` with the repo bind-mounted at `/app`.
- `bun install --frozen-lockfile` runs on every container start, then `bun run dev` (`vite dev`).
- **Port quirk:** the `@lovable.dev/vite-tanstack-config` sandbox detection always
  starts Vite on **8080** inside the container (PORT env is ignored). The compose
  maps host `3000 → container 8080`. Don't try to change the internal port.
- Live reload is active; edits to `src/` appear in the preview without a rebuild.

## No external services / secrets
The app is fully self-contained — no database, no API keys, no SaaS. `secrets: []`.

## Verifying
`curl -sS -o /dev/null -w "%{http_code}" http://localhost:3000/` → 200.
The served HTML includes `<title>LOTADOR — Chama, Lota, Ganha ...</title>`.
