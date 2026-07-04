# Hardware Wiring Guide — Representative Room (Concept)

This is a **conceptual** circuit for one representative office room (3 lights + 2 fans),
built for **Wokwi** (ESP32). No physical hardware is required — this demonstrates how the
office devices *could* be wired and sensed in reality. The live hackathon demo uses the
software simulator, not this circuit.

> ⚠️ **Safety / honesty note:** the ESP32 does **not** power AC lights or fans directly.
> It only drives the low-voltage **control** side of relays. Each relay switches the real
> mains circuit. In this simulation, an indicator LED stands in for the switched AC load,
> and a potentiometer stands in for an ACS712 current sensor on the mains feed.

> 💡 **Where are the fans?** Wokwi has no AC-fan or motor part, so the two **blue LEDs**
> (labelled *Fan 1 / Fan 2*) represent the fan circuits, and the three **yellow LEDs**
> (*Light 1–3*) represent the lights. When a relay closes, its LED lights up = that fan/light
> is ON. Blue buttons toggle fans; green buttons toggle lights.

## Files
- [`hardware/sketch.ino`](hardware/sketch.ino) — ESP32 firmware (buttons → relays, reads current sensor).
- [`hardware/diagram.json`](hardware/diagram.json) — Wokwi wiring.
- [`hardware/wokwi.toml`](hardware/wokwi.toml) + [`hardware/platformio.ini`](hardware/platformio.ini) — only needed for the **VS Code Wokwi extension** (path B below).

## Option A — wokwi.com (recommended, zero setup)
No `wokwi.toml` and no compiling required.
1. Go to <https://wokwi.com> → **New Project** → **ESP32**.
2. Replace `sketch.ino` with the contents of `hardware/sketch.ino`.
3. Open the `diagram.json` tab and paste the contents of `hardware/diagram.json`.
4. Press ▶. Click the buttons to toggle each light/fan; the matching relay clicks and its
   indicator LED turns on. The serial monitor prints the estimated room wattage.

## Option B — Wokwi VS Code extension
The extension needs a `wokwi.toml` **and a compiled firmware binary** in the workspace, so
there is one build step. If you saw *"wokwi.toml configuration file not found in workspace"*,
this is the path to follow:

1. Install the [PlatformIO IDE](https://platformio.org/install/ide?install=vscode) extension
   (provides the ESP32 toolchain) and the **Wokwi for VS Code** extension.
2. In VS Code, **open the `docs/hardware` folder as the workspace root**
   (File → Open Folder → `docs/hardware`). This is important — the Wokwi extension looks for
   `wokwi.toml` in the workspace root, and all four files live here.
3. Build the firmware: run **`pio run`** in a terminal in that folder (or use the PlatformIO
   "Build" button). This produces `.pio/build/esp32dev/firmware.bin` + `firmware.elf`, which
   `wokwi.toml` points to.
4. Run the command palette → **"Wokwi: Start Simulator"**.

> If you don't want to install PlatformIO, just use **Option A** — it needs nothing but a browser.

## Pin mapping

| Function            | Device   | ESP32 GPIO | Connected to        | Notes                          |
|---------------------|----------|-----------:|---------------------|--------------------------------|
| Relay control       | Light 1  | 16         | Relay L1 `IN`       | Switches light circuit         |
| Relay control       | Light 2  | 17         | Relay L2 `IN`       |                                |
| Relay control       | Light 3  | 18         | Relay L3 `IN`       |                                |
| Relay control       | Fan 1    | 19         | Relay F1 `IN`       | Switches fan circuit           |
| Relay control       | Fan 2    | 21         | Relay F2 `IN`       |                                |
| Wall switch (input) | Light 1  | 13         | Push button → GND   | `INPUT_PULLUP`, press = toggle |
| Wall switch (input) | Light 2  | 14         | Push button → GND   |                                |
| Wall switch (input) | Light 3  | 27         | Push button → GND   |                                |
| Wall switch (input) | Fan 1    | 26         | Push button → GND   |                                |
| Wall switch (input) | Fan 2    | 25         | Push button → GND   |                                |
| Current sense       | Mains    | 34 (ADC)   | ACS712 `OUT` (pot)  | Analog read, ~100 mV/A         |
| Power / logic       | —        | 3V3        | Relay `VCC`, sensor | Relay control-side supply      |
| Common ground       | —        | GND        | All modules         |                                |

## Real-world notes
- Relay module: control side (`VCC`, `GND`, `IN`) is ESP32 logic; the switched side
  (`COM`, `NO`, `NC`) carries the light/fan load. Use opto-isolated relays for mains.
- For real mains switching use a certified relay board and proper isolation — this concept
  uses LEDs as safe stand-ins.
- **Wi-Fi link:** in production the ESP32 would `POST` device state to the shared backend
  (`reportState()` in the sketch). Wokwi can't reach a laptop's `localhost`, so the demo
  uses the backend simulator instead. The data model (name, type, ON/OFF, watts, timestamp)
  is identical either way.

## Final screenshot
_Placeholder — export a screenshot of the running Wokwi circuit here:_

`docs/hardware/wokwi-screenshot.png`
