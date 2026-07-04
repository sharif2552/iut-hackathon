# Code Quality & Completeness Report — Office Energy Monitor

_Audit date: 2026-07-04 · Reviewed against `full-system-design.md`, `official-context.md`, and the official evaluation criteria._

---

## 1. Executive summary

The project is in **strong shape** — a clean, well-tested, local-first monorepo where the
backend is a genuine single source of truth for the dashboard and the Discord bot. Core
functionality (real-time dashboard, live simulator, deterministic alert engine, Groq + template
wording, working bot) is implemented and verified.

**Overall submission readiness: ~85%.** The single highest-leverage fix is the **Wokwi circuit
wiring** (worth 15% of the grade and currently broken due to a reverted file). A handful of
polish items (resolved-alerts panel, an architecture PNG, screenshots, demo-time clock) would
push this toward a top submission.

### Verification snapshot (all green)
| Check | Result |
|---|---|
| `npm run typecheck` (all 3 workspaces) | ✅ clean |
| `npm test` | ✅ **41 passed** (backend 34, bot 5, frontend 2) |
| `npm run lint` | ✅ clean, no warnings |
| `npm run build` | ✅ backend + frontend + bot all build |
| Secrets in git | ✅ only `*.env.example` tracked; no real `.env` committed |

### Scorecard vs. official evaluation criteria
| # | Criterion | Weight | Readiness | Note |
|---|---|---:|---:|---|
| 1 | Real-time web dashboard | 20% | ~90% | Solid; resolved-alerts section is dead code |
| 2 | Discord bot on real data | 10% | ~95% | Works end-to-end, shares backend |
| 3 | Dashboard visual/UX | 10% | ~85% | Good 2D map; needs screenshots/polish |
| 4 | Clear system diagram | 15% | ~85% | SVG is clear; add a PNG fallback |
| 5 | **Sensible circuit schematic** | 15% | **~60%** | ⚠️ **wiring currently broken — top priority** |
| 6 | Demo & simulated-data quality | 15% | ~85% | Strong simulator; after-hours needs real clock |
| 7 | Codebase, docs, commits | 15% | ~90% | Excellent structure, tests, docs |

---

## 2. What's done well (strengths)

- **Architecture & separation of concerns.** Clean layering: `repositories → domain services →
  thin route handlers`, a DI `container.ts`, and a `Clock` abstraction for testable time. No
  business logic in React components; no hardcoded device facts.
- **True single source of truth.** Dashboard and bot both read the same backend; the bot never
  computes state; Groq only rewords verified facts and cannot invent numbers.
- **Deterministic alert engine.** Three rules (after-hours, room-overactive, high-power) with
  deduplication, **auto-resolution**, and **live message refresh** (fixed this session so alert
  text never goes stale). Correct emit ordering (evaluate → build → broadcast).
- **Resilient AI layer.** `groq-sdk` backend-only, Zod-validated output, length cap, formatting
  strip, key rotation **for resilience only**, and a deterministic `TemplateMessageComposer`
  fallback so it works with **no key**.
- **Realtime UX.** Socket.IO with reconnect + refetch-on-reconnect, connection status states,
  and a 15s REST safety-net poll.
- **Device count derived from DB (15), never hardcoded** — documented, configurable.
- **Testing & tooling.** 41 tests across power, energy, alert rules, alert reconciliation,
  simulator scenarios, socket emission, office summary, Groq fallback, and bot alias resolution.
  TS strict, ESLint, Prettier-style formatting, Pino structured logs.
- **Security hygiene.** Hardened `.gitignore` (env, keys, `.npmrc`, DBs, build output); no
  secrets in source; Groq keys never sent to the frontend or logged.
- **Documentation.** README, `api-documentation.md`, `demo-script.md`, `implementation-plan.md`,
  `wiring-guide.md`, and a hand-authored architecture SVG.

---

## 3. Gaps & required improvements (prioritized)

### 🔴 Critical (fix before submission)

**C1 — Wokwi circuit wiring is broken (15% of the grade).**
`docs/hardware/diagram.json` was reverted to an earlier version that grounds the buttons,
potentiometer, and LED cathodes to **`GND.2` / `GND.3`**, which **do not exist** on Wokwi's
`wokwi-esp32-devkit-v1`. Wokwi silently drops those wires, so the buttons and current sensor
render **unconnected**. Fix: route **every ground to `GND.1`** (the pin the relays already use
successfully). This was fixed once and needs re-applying.
- _File:_ `docs/hardware/diagram.json` (currently 5×GND.1, 5×GND.2, 6×GND.3 → should be 16×GND.1, 0 others).

**C2 — Commit the fixes and confirm a public repo.**
Working tree is clean but the buggy diagram is what's committed. After C1, commit it. Ensure the
GitHub repo is **public** and includes all `docs/` diagrams (submission requirement).

### 🟠 High

**H1 — "Recently resolved" alerts panel is dead code.**
`Dashboard.tsx` sets `recentAlerts = data.activeAlerts`, which never contains `RESOLVED` alerts,
so the resolved section never appears even though `GET /api/v1/alerts` already returns them.
Either wire a `useQuery(['alerts'], api.alerts)` into `useOfficeMonitor` and pass `recent`, or
remove the section. (Recommend wiring it — resolved history is a nice demo touch.)
- _Files:_ `frontend/src/dashboard/Dashboard.tsx:37`, `frontend/src/hooks/useOfficeMonitor.ts`.

**H2 — No architecture PNG.**
Only `docs/system-architecture.svg` exists; the plan lists a `.png` too. Some Markdown/GitHub
previews and slide decks don't render SVG well. Export a PNG (open the SVG in a browser → screenshot,
or any SVG tool) and reference it in the README alongside the SVG.

**H3 — After-hours alert depends on the real system clock (demo risk).**
`after-hours.rule.ts` uses `ctx.now.getHours()` from the real `systemClock`. During a **daytime
demo (9–17)** the after-hours alert won't fire even with the `after-hours-waste` scenario. Add an
optional `SIMULATED_HOUR` (or `DEMO_AFTER_HOURS=true`) config override so you can reproducibly
demo after-hours at any real time, or clearly script the demo for the evening.

**H4 — No screenshots.**
`docs/screenshots/` doesn't exist and the README has no dashboard image. Add 2–3 screenshots
(dashboard, an active alert, a `!status` reply) — helps the visual/UX (10%) and demo (15%) scores
and the "final screenshot" placeholder in `wiring-guide.md`.

### 🟡 Medium

| ID | Item | File(s) |
|---|---|---|
| M1 | Thin frontend test coverage — only `format.ts`. Add a live-update/hook test (jsdom + Testing Library) to cover the spec's "Dashboard live updates". | `frontend/tests/` |
| M2 | No HTTP-level API test. Add a Fastify `.inject()` test for `GET /api/v1/office/summary` to directly cover "API summary endpoint". | `backend/tests/` |
| M3 | No React error boundary — a render throw blanks the app. Add an `ErrorBoundary` around the dashboard. | `frontend/src/` |
| M4 | Frontend bundle ~739 KB (Recharts + Framer Motion). Fine locally; consider lazy-loading the chart for a lighter first paint. | `frontend/` |
| M5 | `recentAlerts` prop naming in `Dashboard` is misleading (see H1). | `frontend/src/dashboard/Dashboard.tsx` |
| M6 | Groq key lives in local `backend/.env`. Confirm it's never committed (it's gitignored) and **rotate it before making the repo public** if it was ever pasted anywhere shareable. | `backend/.env` |

### 🟢 Low / polish

- **L1** Fill the `wiring-guide.md` "final screenshot" placeholder once C1 renders.
- **L2** README: add a one-line test-count/README badge and a screenshot near the top.
- **L3** Document lowering `SIMULATOR_INTERVAL_MS` to ~3–5 s for a livelier demo (default 30 s).
- **L4** Accessibility: device buttons use `title`; add `aria-label`s for screen readers.
- **L5** Pin a `!help` message in the Discord channel for judges.
- **L6** `docker-compose.yml` appears in the planned tree but was intentionally omitted (no
  deployment). Fine — just don't reference it anywhere.

---

## 4. Feature opportunities (optional, score-boosting)

1. **Simulated/configurable clock** (also solves H3) — lets you trigger after-hours on demand;
   great for a reliable 3-minute demo.
2. **Cost estimate** — the official brief mentions costs. The **backend** could compute
   `todayKwh × tariff` (configurable `ELECTRICITY_TARIFF`) and pass it as a verified fact; Groq
   must not invent it. Adds a compelling "money saved" angle.
3. **2.5D / 3D office map** — current map is a clean 2D top-view (fully sufficient). A React Three
   Fiber layer would earn bonus visual points, but keep the 2D fallback.
4. **Slash-command mirror** (`/status`, `/room`) — the brief lists these as optional after prefix
   commands work (they do). Users kept typing `/status`; adding slash commands removes that
   confusion.
5. **CSV / history export** or a longer energy trend view.

---

## 5. Pre-submission checklist

- [ ] **Fix `diagram.json` grounds → `GND.1`** and verify in Wokwi (buttons + fans light). *(C1)*
- [ ] Commit all fixes; confirm the GitHub repo is **public** with `docs/` included. *(C2)*
- [ ] Wire or remove the resolved-alerts panel. *(H1)*
- [ ] Add `docs/system-architecture.png`. *(H2)*
- [ ] Decide demo-time strategy for after-hours (simulated hour or evening demo). *(H3)*
- [ ] Add `docs/screenshots/` (dashboard, alert, `!status`). *(H4)*
- [ ] Rotate the Groq key if the repo will be public and the key was ever shared. *(M6)*
- [ ] Record the ≤3-min demo video per `docs/demo-script.md`.
- [ ] Final pass: `npm run typecheck && npm test && npm run build`.

---

## 6. Bottom line

The engineering is genuinely solid — clean architecture, real shared source of truth, honest AI
usage, good tests, and thorough docs. Nothing here is a rewrite. The work remaining is **one real
fix (the Wokwi wiring)** plus **presentation polish** (resolved-alerts panel, a PNG diagram,
screenshots, and a demo-time clock). Land those and this is a top-tier, well-rounded submission.
