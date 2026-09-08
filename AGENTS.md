# AGENTS.md

## Project Overview
LOTADOR — a Phaser 3 arcade game built with TanStack Start (SSR) + Vite + React 19.
Client-only game canvas; the server only renders the shell and loading state.

## Stack
- **Runtime:** Bun (bun.lock, bunfig.toml) — use `bun` for install/run
- **Framework:** TanStack Start (SSR) on Vite 8, React 19, TanStack Router
- **Game engine:** Phaser 3.90 (loaded client-side via lazy import)
- **Styling:** Tailwind CSS 4 via `@tailwindcss/vite`
- **Build config:** `@lovable.dev/vite-tanstack-config` wraps Vite (do NOT add plugins it already includes)

## Running
```
docker compose -f docker-compose.base44.yml up -d
```
- Dev server: `bun run dev -- --host 0.0.0.0 --port 3000` (Vite dev with live reload)
- Port 3000 is the only public port (single-origin; SSR + client served together)
- No database, no external APIs, no secrets required

## Key Files
- `src/routes/index.tsx` — home route, lazy-loads `GameCanvas` (client-only)
- `src/components/GameCanvas.tsx` — mounts the Phaser game
- `src/game/` — all game logic (scenes, entities, systems, config, data)
- `src/start.ts` — TanStack Start config (error + CSRF middleware)
- `src/server.ts` — SSR server entry wrapper

## Notes
- The game is client-only (`ClientOnly` + `lazy`); SSR only renders the loading shell
- Vite allowed hosts handled via `__VITE_ADDITIONAL_SERVER_ALLOWED_HOSTS` env var
- `bunfig.toml` has a 24h supply-chain guard on package versions
