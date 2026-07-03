==================================================
OFFICIAL HACKATHON PROBLEM CONTEXT
==================================================

Project theme:
Lights, Fans, Discord: The Boss’s Big Idea

Problem:
A small office uses Discord for daily communication. Employees sometimes leave lights and fans running after leaving the office, increasing electricity costs without anyone noticing.

Build a system that allows users to monitor office electrical devices and electricity usage through:
1. A live web dashboard
2. A Discord bot

The system must show real device states, current power usage, alerts, and office status.

--------------------------------------------------
OFFICE SETUP
--------------------------------------------------

The office has 3 rooms:

1. Drawing Room
   - Waiting area where people occasionally sit

2. Work Room 1
   - Main employee work area

3. Work Room 2
   - Main employee work area

Each room has:
- 2 fans
- 3 lights

Important document inconsistency:
- The office description says 3 rooms × 5 devices = 15 devices total.
- Later dashboard and simulation sections repeatedly say 18 devices.

Implementation rule:
- Do not hardcode either 15 or 18 in frontend, backend, bot, calculations, or UI wording.
- Make the device catalogue configurable.
- Default to the explicit physical layout: 2 fans + 3 lights in each room = 15 devices.
- Keep the architecture able to support 18 devices if organizers clarify the extra devices.
- Document this inconsistency in the README.

--------------------------------------------------
MANDATORY DELIVERABLE 1:
HIGH-LEVEL SYSTEM DIAGRAM
--------------------------------------------------

Create a clear system diagram showing the complete flow:

Devices
→ simulated device data
→ backend
→ web dashboard
→ Discord bot
→ user

The diagram must clearly show how a device state change reaches:
- the live web dashboard
- the Discord bot response/message

Diagram requirements:
- Show data flow from device state to user-facing output.
- Show backend as the shared source of truth.
- Show simulator, backend, dashboard, Discord bot, and users.
- Do NOT use Mermaid.
- Use another diagramming tool such as Draw.io, Figma, Lucidchart, Canva, Excalidraw, or manually created SVG/PNG.

--------------------------------------------------
MANDATORY DELIVERABLE 2:
HARDWARE / ELECTRICAL SCHEMATIC
--------------------------------------------------

Create a conceptual circuit design using Wokwi or Tinkercad.

The circuit should demonstrate how lights and fans could be wired and sensed in a real office.

Suggested components:
- ESP32 or Arduino
- Light outputs
- Fan outputs
- Relay modules
- Optional current sensor
- Optional switches/buttons for state input

Hardware expectations:
- No physical hardware is required.
- This is only a simulation/concept.
- You do not need to wire every office device.
- A representative circuit for one room is enough.
- The design must be physically sensible.
- Do not claim ESP32 directly powers real AC fans or lights.
- ESP32 should control relays or read sensors, while relays handle electrical loads.

The schematic should ideally demonstrate:
- ESP32 reading ON/OFF state
- ESP32 controlling relay signals
- Optional current sensing
- Conceptual Wi-Fi communication with backend

--------------------------------------------------
MANDATORY DELIVERABLE 3:
SIMULATED DEVICE DATA
--------------------------------------------------

Since there is no real hardware, generate dynamic simulated data.

Each device must contain:
- Device name
- Device type: Light or Fan
- Room
- Status: ON or OFF
- Power draw
- Last changed timestamp

Power examples:
- Fan when ON: approximately 60W
- Light when ON: approximately 15W
- Device when OFF: 0W

Simulation requirements:
- Data must change over time.
- Dashboard must always have live activity to show.
- Do not use static-only data.
- You may use:
  - a script
  - in-memory store
  - JSON data with a simulator
  - a small database

Recommended realistic behaviour:
- Devices gradually turn on during working hours.
- Some devices turn off during lunch.
- Most devices should turn off after office hours.
- Occasionally leave some devices ON after hours to demonstrate alerts.
- Avoid changing every device randomly every second.

--------------------------------------------------
MANDATORY DELIVERABLE 4:
REAL-TIME WEB DASHBOARD
--------------------------------------------------

The dashboard is the main monitoring interface.

It must provide a live, clear view of office activity.

Required dashboard features:

1. Live Device Status Panel
- Show all devices grouped by room.
- Clearly identify devices, for example:
  - Fan 1
  - Fan 2
  - Light 1
  - Light 2
  - Light 3
- Show ON/OFF status visually.
- Update without page refresh.

2. Live Power Consumption Meter
- Show total power currently being used across the office in Watts.
- Show room-by-room power breakdown.
- Update live with device changes.

3. Active Alerts Panel
- Show anomalous situations.
- Alerts must be timestamped.

Required alert examples:
- Devices still ON after office hours.
- Office hours assumed to be 9 AM–5 PM.
- A room where all devices have remained ON for more than 2 hours.

Dashboard visual bonus:
- Use the provided office layout as inspiration.
- Show a top-view, 2.5D, or 3D office map.
- Reflect live device state visually:
  - Lights glow when ON.
  - Fans animate when ON.
  - Room alert state is visually visible.
- Include furniture/assets such as chairs, desks, tables, and room boundaries if possible.

The office map is a bonus-quality visual layer, not a replacement for device lists and readable data.

--------------------------------------------------
MANDATORY DELIVERABLE 5:
DISCORD BOT
--------------------------------------------------

Create a Discord bot that uses the same backend as the dashboard.

The Discord bot must never use separate fake state or hardcoded room/device information.

Required command behaviour:

!status
- Give an overall office status.
- Example style:
  Drawing Room: 1 fan ON, 2 lights ON.
  Work Room 1: all OFF.
  Work Room 2: 2 fans ON, 3 lights ON.

!room <name>
- Show status of one requested room.
- Example:
  !room work1

!usage
- Show:
  - total office power currently being drawn
  - today’s estimated energy usage in kWh

Example:
Total power right now: 740W.
Today’s estimated usage: 4.2 kWh.

Discord bot requirements:
- Responses must come from actual simulated backend data.
- No hardcoded answers.
- No random answers.
- Replies should be humanized, friendly, and easy to understand.
- Avoid robotic data dumps.

LLM usage:
- Using an LLM for friendly conversational responses is strongly encouraged.
- LLM is not the source of truth.
- Backend calculates all device state, watts, kWh, room summaries, and alerts.
- LLM only rewrites verified facts into natural Discord messages.
- LLM must never invent values, devices, states, alerts, or predictions.
- System must still work with a deterministic template fallback if LLM is unavailable.

Discord bonus:
- Bot proactively posts a message in a designated Discord channel when an alert happens.

Example:
“⚠️ Work Room 2 still has 2 fans and 3 lights ON at 10 PM. Did someone forget to turn them off?”

--------------------------------------------------
CRITICAL ARCHITECTURE REQUIREMENT
--------------------------------------------------

The web dashboard and Discord bot must share one backend.

Required architecture:

[Simulated Device Layer]
→
[Backend API / Shared Source of Truth]
→
[Web Dashboard]

and

[Backend API / Shared Source of Truth]
→
[Discord Bot]

Rules:
- One source of truth for device state.
- Dashboard and bot must reflect the same live data.
- Simulator updates backend state.
- Backend emits live updates.
- Dashboard receives live updates without refresh.
- Discord bot queries backend for verified information.
- Alert engine runs from backend/domain logic.
- LLM sits after backend facts and before Discord wording.

Correct LLM flow:

Discord User
→ Discord Bot
→ Shared Backend Facts
→ LLM Message Composer
→ Discord Reply

Incorrect flow:

Discord User
→ LLM
→ Discord Reply

--------------------------------------------------
GENERAL CLARIFICATIONS
--------------------------------------------------

- No physical hardware is required.
- Device data in the demo must be simulated.
- Any programming language, framework, library, AI model, or LLM may be used.
- Dashboard updates must happen without manual refresh.
- Exact command names, dashboard UI, visual design, and implementation choices are up to the team.
- The final product should be clean, usable, and reliable.
- Explore Wokwi and Tinkercad before selecting one for the hardware concept.

--------------------------------------------------
EVALUATION CRITERIA
--------------------------------------------------

1. Working real-time web dashboard
   Weight: 20%

2. Working Discord bot using real simulated data
   Weight: 10%

3. Dashboard visual design and UX quality
   Weight: 10%

4. Clear, correct system diagram
   Weight: 15%

5. Sensible circuit schematic
   Weight: 15%

6. Quality of demo and simulated data
   Weight: 15%

7. Well-structured codebase, documentation, and commits
   Weight: 15%

Total: 100%

--------------------------------------------------
FINAL SUBMISSION REQUIREMENTS
--------------------------------------------------

1. Public Codebase
- Public GitHub or GitLab repository.
- Complete source code.
- Clear README.
- Setup instructions for:
  - backend
  - dashboard
  - simulator
  - Discord bot
- Include all diagrams in the repository.

2. Video Demo
- Preferred maximum duration: 3 minutes.
- Show:
  - live web dashboard
  - device state updates
  - power usage updates
  - active alerts
  - Discord bot commands
  - Discord bot reading real backend data
  - brief architecture/data-flow explanation
- Keep the demo concise, stable, and easy to follow.

--------------------------------------------------
WINNING PRIORITIES
--------------------------------------------------

Build in this order:

1. Shared backend and device data model
2. Dynamic simulator
3. Real-time updates
4. Dashboard functionality
5. Alert engine
6. Discord bot using backend facts
7. LLM-friendly message layer with template fallback
8. 3D/2.5D office visualization and animations
9. Hardware schematic
10. Diagrams, README, screenshots, demo video

Do not start with visual polish before proving:
- one shared backend
- real-time updates
- real calculations
- real alerts
- real Discord answers