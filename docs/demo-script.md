# Demo Script (≈3 minutes)

Goal: prove one shared backend drives both a live dashboard and a Discord bot, with real
calculations and real alerts.

## Before you start
Three terminals:
```bash
npm run dev:backend    # terminal 1  → http://localhost:4000
npm run dev:frontend   # terminal 2  → http://localhost:5173
npm run dev:bot        # terminal 3  (needs discord-bot/.env with a token)
```
Open the dashboard at <http://localhost:5173>. The simulator auto-starts.

## 0:00 — The pitch (15s)
> "Office Energy Monitor. People leave lights and fans on after hours. This watches every
> device, shows live usage on a dashboard, and answers questions in Discord — all from one
> local backend, no cloud."

## 0:15 — Dashboard tour (45s)
- **Summary cards**: current watts, today's kWh, active/total devices, active alerts, live status.
- **Office map**: point out lights that glow and fans that spin when ON; a red room border = alert.
- **Device grid** grouped by room; **power history** chart filling in live.
- Say: *"Nothing here is hardcoded — 15 devices across 3 rooms, all derived from the database."*

## 1:00 — Prove it's live (40s)
- Click a device on the map → **Toggle**. Watch the watts and chart update instantly (no refresh).
- Click scenario **`high-power-usage`** → all fans switch on, watts jump, a high-usage alert appears.
- Click **`after-hours-waste`** (or note it's already after 5 PM) → an after-hours alert appears,
  timestamped, naming the room and wattage.

## 1:40 — Discord bot (50s)
In the Discord channel:
```
!status      → per-room fans/lights ON, usage, alerts (friendly wording)
!room work1  → one room's devices + watts (alias resolution: work1 → Work Room 1)
!usage       → total watts, today's kWh, highest room, a short insight
!alerts      → active alerts with timestamps
```
Say: *"Same numbers as the dashboard — because the bot reads the same backend. Groq only
rewords verified facts; if Groq is down it falls back to templates and still works."*

## 2:30 — Proactive alert (20s)
- Trigger `after-hours-waste` (or `room-overactive`). Within a tick the bot **posts an alert
  message to the channel by itself** — pushed from the backend over Socket.IO.

## 2:50 — Close (10s)
> "One backend, one source of truth. Dashboard and Discord always agree. Runs entirely on
> this laptop." Show the architecture diagram (`docs/system-architecture.svg`).

## Reset between takes
```bash
# stop backend, delete the local DB, restart (re-seeds automatically)
rm backend/local.db backend/local.db-*  ;  npm run dev:backend
```

## Fallback if the bot token isn't ready
Demo the internal endpoint directly to show identical data:
```bash
curl http://localhost:4000/api/v1/internal/bot/status
```
