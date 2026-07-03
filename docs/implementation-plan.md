# Implementation Plan — Office Energy Monitor

Local-first system. Three workspaces (`backend`, `frontend`, `discord-bot`) sharing **one backend source of truth**. No deployment, no tunnels, no public URLs.

## Device count (confirmed: 15)
Confirmed total = 3 rooms × (2 fans + 3 lights) = **15 devices**. (An earlier brief mentioned "18" in error — not used anywhere.) **Seed 15**, never hardcode any device count in business logic — every count is derived from the database, so the catalogue stays configurable.

## Milestones
1. **Structure & configs** — npm workspaces, TS strict, ESLint/Prettier, env examples.
2. **Schema & seed** — Drizzle + better-sqlite3. Tables: rooms, devices, device_state_events, alerts, power_samples. Seed 3 rooms × 5 devices.
3. **Domain services** — power calc (OFF=0W), room/office watts, energy Wh accumulation (watts × Δtime), repositories.
4. **Simulator** — scenarios (normal, lunch, after-hours-waste, room-overactive, all-off, high-power), scheduler, pause/resume, persists events, recalculates power, evaluates alerts, emits socket events.
5. **API + Socket.IO** — Fastify REST (`/health`, `/api/v1/...`), dev + internal-bot endpoints, realtime gateway.
6. **AI composer** — MessageComposer interface, template fallback (always works), Groq composer + key rotator (resilience only).
7. **Dashboard** — summary cards, device grid by room, room power charts, alerts, live via Socket.IO with reconnect.
8. **Office map** — 2D top-view; lights glow / fans spin when ON; click for details.
9. **Discord bot** — discord.js Gateway; `!status !room !usage !alerts`; alias resolution; proactive alerts via backend socket.
10. **Tests** — power, energy, alert rules, simulator, summary endpoint, socket emission, bot alias, groq fallback.
11. **Docs & diagrams** — README, architecture SVG/PNG, wiring guide, api docs, demo script.

## Verification per milestone
`npm run typecheck`, `npm run lint`, `npm run test`, `npm run build` for the touched workspace. No deployment config introduced.

## Runtime flow
`!status` → Discord Gateway WS → local discord.js bot → `http://localhost:4000` REST → SQLite + domain services → Groq wording (or template) → bot reply. Simulator loop → alert engine → Socket.IO `alert:created` → bot subscriber → alert channel message.
