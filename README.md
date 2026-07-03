# ⚡ Office Energy Monitor

A **local-first** system that monitors office lights and fans, calculates power usage,
detects energy waste, shows everything on a **real-time web dashboard**, and answers
office-status questions through a **Discord bot** — all powered by **one shared backend**
and running entirely on a single laptop. No deployment, no tunnels, no public URLs.

> Theme: *Lights, Fans, Discord: The Boss's Big Idea.* Employees leave devices on after
> hours; this catches it.

- **Live dashboard** — summary cards, device grid by room, 2D office map (lights glow, fans
  spin), power-history chart, timestamped alerts. Updates without refresh.
- **Discord bot** — `!status`, `!room <name>`, `!usage`, `!alerts`, plus proactive alert posts.
- **Shared source of truth** — the dashboard and the bot always show the same numbers because
  they read the same backend (SQLite + domain services).
- **Friendly wording via Groq** — optional. Groq only rewrites *verified* facts; a
  deterministic template fallback means the system works with **no API key at all**.

---

## Architecture

![System architecture](docs/system-architecture.svg)

```
Device Simulator ─→ Backend API (SQLite + power/energy + alert engine + AI composer)
                         │  REST + Socket.IO
                         ├────────────→ Web Dashboard   (live, no refresh)
                         └────────────→ Discord Bot ──→ Discord Gateway ──→ Users
```

The backend is the **only** source of truth. The frontend never invents device state; the bot
never calculates independently; Groq never decides state, usage, or alerts.
Diagram source: [`docs/system-architecture.svg`](docs/system-architecture.svg) (open in a
browser or any SVG tool to export a PNG).

---

## Tech stack
- **Backend** — Node.js, Fastify, TypeScript, Socket.IO, Zod, Pino, Drizzle ORM + better-sqlite3, Vitest.
- **Frontend** — React, Vite, TypeScript, Tailwind, TanStack Query, Socket.IO client, Recharts, Framer Motion.
- **Discord bot** — discord.js (Gateway mode), TypeScript.
- **LLM** — `groq-sdk`, backend-only, optional.

## Monorepo layout
```
backend/       Fastify API, simulator, alert engine, SQLite, Groq/template composer
frontend/      React dashboard + 2D office map
discord-bot/   discord.js bot (prefix commands + proactive alerts)
docs/          architecture SVG, wiring guide + Wokwi files, API docs, demo script
```
Managed with **npm workspaces** (pnpm also works — see note below).

---

## Prerequisites
- **Node.js 20+** and **npm 10+** (`node -v`, `npm -v`).
- (Optional) a Discord bot token to run the bot.
- (Optional) a Groq API key for LLM wording.

## Quick start

```bash
# 1. install everything (root installs all three workspaces)
npm install

# 2. create env files
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
cp discord-bot/.env.example discord-bot/.env     # only needed to run the bot

# 3. run each service in its own terminal
npm run dev:backend     # → http://localhost:4000  (simulator auto-starts + seeds DB)
npm run dev:frontend    # → http://localhost:5173
npm run dev:bot         # connects outward to Discord (needs a token)
```

The database file (`backend/local.db`) is created and seeded automatically on first run.
To re-seed manually: `npm run seed`.

### Expected local URLs
| Service | URL |
|---|---|
| Dashboard | http://localhost:5173 |
| Backend API | http://localhost:4000 |
| SQLite | `backend/local.db` (file) |
| Discord bot | no local URL — connects outward to Discord Gateway |

> **pnpm users:** `pnpm install` then `pnpm dev:backend` / `pnpm dev:frontend` / `pnpm dev:bot`
> work identically (the root scripts are runner-agnostic).

---

## Device count (confirmed: 15)
The office has **3 rooms × (2 fans + 3 lights) = 15 devices total** — this is the confirmed,
authoritative count. (An earlier version of the brief mentioned "18" in a few places; that was
a documentation error and is not used anywhere.) The system **seeds 15** and **never hardcodes
any device count** in business logic — every count is derived from the database
(`totalDevices`, per-room counts, watt sums), so the layout stays configurable. The seeded
layout lives in [`backend/src/shared/constants.ts`](backend/src/shared/constants.ts).

---

## Simulator
Believable, not chaotic — it changes only a few devices per tick and persists every state
change. Scenarios (activate from the dashboard buttons or `POST /api/v1/dev/scenarios/:name`):

`normal-working-hours` · `lunch-break` · `after-hours-waste` · `room-overactive` ·
`all-off` · `high-power-usage`

Controls: `SIMULATOR_INTERVAL_MS` (tick rate), `SIMULATOR_AUTOSTART`, pause/resume via the
dashboard or `POST /api/v1/dev/simulator/{start,stop}`.

## Alert engine (deterministic backend logic)
1. **After-hours waste** — devices still ON outside office hours (`OFFICE_START_HOUR`–`OFFICE_END_HOUR`, default 9–17). Names room, active count, watts, time.
2. **Room overactive** — *all* devices in a room ON continuously for **> 2 hours**; auto-resolves.
3. **High room usage** — room watts above `HIGH_ROOM_WATT_THRESHOLD` (default 250 W).

Alerts are deduplicated (no spam), auto-resolved when the condition clears, and persisted.
Groq is never asked whether an alert exists.

---

## Discord bot setup
1. Create an application at the **Discord Developer Portal** → add a **Bot** → copy the token.
2. **Enable the "Message Content Intent"** (Bot → Privileged Gateway Intents) — prefix
   commands read message text.
3. Invite the bot to your server with the *Send Messages* / *Read Message History* permissions.
4. Fill `discord-bot/.env`:
   ```
   DISCORD_BOT_TOKEN=your-token
   DISCORD_ALERT_CHANNEL_ID=channel-id-for-proactive-alerts   # optional
   BACKEND_API_URL=http://localhost:4000
   BACKEND_SOCKET_URL=http://localhost:4000
   ```
5. `npm run dev:bot`. Commands:
   - `!status` — whole-office summary.
   - `!room <name>` — one room. Aliases: `work1`, `work room 1`, `room1`, `work2`, `drawing`, …
   - `!usage` — total watts, today's kWh, highest room, a short insight.
   - `!alerts` — active alerts with timestamps.

The bot uses **Gateway mode only** (outbound WebSocket) — no HTTP interaction endpoint, no
webhook receiver, no tunnel. It ignores other bots and handles backend downtime gracefully.

## Groq (optional)
Add keys to `backend/.env` (never commit real values):
```
GROQ_API_KEY_1=...
GROQ_MODEL=llama-3.3-70b-versatile
```
Groq runs **only on the backend**, receives verified structured facts, and returns friendly
wording validated with Zod (length-capped, formatting stripped). Extra keys are used **only
for resilience** (retry on 429/5xx/timeout), not to bypass quotas. With no keys, the
`TemplateMessageComposer` produces the wording deterministically — the system is fully
functional without Groq.

---

## Testing
```bash
npm test                           # all workspaces
npm test --workspace backend       # power, energy, alert rules, simulator, summary, socket, groq fallback
npm test --workspace discord-bot   # room alias resolution
```
Verify a whole workspace: `npm run typecheck` · `npm run lint` · `npm run build`.

## API & realtime
Full reference: [`docs/api-documentation.md`](docs/api-documentation.md). Key endpoints:
`GET /health`, `GET /api/v1/office/summary`, `GET /api/v1/energy`, `GET /api/v1/alerts`,
internal bot endpoints, and Socket.IO events (`office:summary.updated`, `alert:created`, …).

## Hardware concept
A representative one-room ESP32 + relays + current-sensor circuit for Wokwi lives in
[`docs/hardware/`](docs/hardware/) with a full pin-mapping table in
[`docs/wiring-guide.md`](docs/wiring-guide.md). The ESP32 drives relay *control* pins and
reads sensors — it does **not** power AC loads directly.

## Demo
A step-by-step ~3-minute run-of-show is in [`docs/demo-script.md`](docs/demo-script.md).

## Design principles
TypeScript strict mode · Zod validation · thin route handlers → domain services →
repository layer · no business logic in React components · no hardcoded device facts ·
no secrets in source · structured Pino logs. No deployment configuration by design — the
whole system runs locally for the demo.
