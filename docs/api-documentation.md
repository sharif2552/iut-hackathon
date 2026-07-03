# API Documentation

Base URL (local only): `http://localhost:4000`. All responses are JSON. The backend is the
single source of truth for device state, power, energy, and alerts.

## Health
### `GET /health`
```json
{ "status": "ok", "time": "…", "simulator": { "running": true, "scenario": "normal-working-hours", "intervalMs": 30000 }, "realtimeClients": 1 }
```

## Public read endpoints

### `GET /api/v1/office/summary`
The main dashboard payload.
```json
{
  "generatedAt": "…",
  "officeWatts": 285,
  "todayKwh": 1.24,
  "totalDevices": 15,
  "activeDevices": 10,
  "totalRooms": 3,
  "activeAlertCount": 1,
  "highestConsumingRoom": { "slug": "work-room-2", "name": "Work Room 2", "watts": 150 },
  "rooms": [ { "id": "drawing-room", "slug": "drawing-room", "name": "Drawing Room", "watts": 45,
              "deviceCount": 5, "activeDeviceCount": 3, "fansOn": 0, "fansTotal": 2,
              "lightsOn": 3, "lightsTotal": 3, "devices": [ … ], "activeAlertCount": 0 } ],
  "activeAlerts": [ … ]
}
```
> `totalDevices` / `totalRooms` are **derived from the database**, never hardcoded.

### `GET /api/v1/rooms`
`{ "rooms": [ RoomSummary, … ] }`

### `GET /api/v1/rooms/:roomSlug`
One `RoomSummary`. `404` if the slug is unknown. Slugs: `drawing-room`, `work-room-1`, `work-room-2`.

### `GET /api/v1/devices`
`{ "devices": [ Device, … ] }`

### `GET /api/v1/devices/:deviceId`
One `Device`. `404` if unknown.

### `GET /api/v1/devices/:deviceId/history`
`{ "device": Device, "history": [ { "previousStatus", "nextStatus", "source", "occurredAt" }, … ] }`

### `GET /api/v1/alerts`
`{ "active": [ Alert, … ], "recent": [ Alert, … ] }`

### `GET /api/v1/energy`
`{ "officeWatts", "todayKwh", "todayWh", "rooms": [ … ], "samples": [ { "officeWatts", "drawingRoomWatts", "workRoom1Watts", "workRoom2Watts", "energyWh", "sampledAt" }, … ] }`

## Development / demo endpoints
| Method | Path | Effect |
|---|---|---|
| `POST` | `/api/v1/dev/simulator/start` | Resume the simulator |
| `POST` | `/api/v1/dev/simulator/stop` | Pause the simulator |
| `POST` | `/api/v1/dev/scenarios/:scenarioName` | Activate a scenario + run one tick immediately |
| `POST` | `/api/v1/dev/devices/:deviceId/toggle` | Toggle one device |

Scenarios: `normal-working-hours`, `lunch-break`, `after-hours-waste`, `room-overactive`,
`all-off`, `high-power-usage`.

## Internal bot endpoints
These return both verified `facts` and a ready-to-send friendly `message`
(Groq wording, or a deterministic template fallback).

| Path | Returns |
|---|---|
| `GET /api/v1/internal/bot/status` | `{ message, source, facts }` — whole-office status |
| `GET /api/v1/internal/bot/room/:roomSlug` | `{ message, source, facts }` — accepts aliases (`work1`, `drawing`, …) |
| `GET /api/v1/internal/bot/usage` | `{ message, source, facts }` — watts, kWh, top room, insight |
| `GET /api/v1/internal/bot/alerts` | `{ count, alerts: [ … ] }` |

`source` is `"groq"` when a Groq key is configured and the call succeeds, otherwise `"template"`.

## Socket.IO events (server → client)
Connect to `http://localhost:4000`.

| Event | Payload |
|---|---|
| `office:summary.updated` | full `OfficeSummary` |
| `device:updated` | one `Device` |
| `room:updated` | one `RoomSummary` |
| `energy:sample.created` | `{ officeWatts, todayKwh, sampledAt, rooms }` |
| `alert:created` | one `Alert` |
| `alert:resolved` | one `Alert` |
| `simulator:status.updated` | `{ running, scenario, intervalMs, updatedAt }` |

## Entities
**Device**: `id, roomId, roomName, name, type(LIGHT|FAN), status(ON|OFF), nominalWattage, currentWatts, lastChangedAt`
**Alert**: `id, type, severity(INFO|WARNING|CRITICAL), status(ACTIVE|RESOLVED), roomId, roomName, deviceId, message, createdAt, resolvedAt`

## Business rules
- OFF device = 0 W. ON fan ≈ 60 W, ON light ≈ 15 W (per-device nominal, stored in DB).
- Office watts = Σ active device watts. Room watts = Σ active devices in the room.
- Energy (Wh) is accumulated from watts over time (trapezoidal), never faked. kWh = Wh / 1000.
