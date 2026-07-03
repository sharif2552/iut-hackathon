/*
 * Office Energy Monitor — representative room controller (CONCEPT)
 * Board: ESP32 DevKit v1  (simulate on https://wokwi.com)
 *
 * One representative room = 3 lights + 2 fans.
 * The ESP32 does NOT power AC loads directly. It drives low-voltage RELAY
 * control pins; each relay switches the real light/fan circuit. Push buttons
 * emulate wall switches (state input). A potentiometer stands in for an
 * ACS712 current sensor on the mains feed.
 *
 * In a real deployment the ESP32 would POST this state to the backend over
 * Wi-Fi (see reportState() — left as a concept because Wokwi cannot reach a
 * laptop's localhost). The hackathon demo uses the software simulator instead.
 */

// ---- Relay control pins (active-HIGH in this concept) ----
const int RELAY_LIGHT_1 = 16;
const int RELAY_LIGHT_2 = 17;
const int RELAY_LIGHT_3 = 18;
const int RELAY_FAN_1   = 19;
const int RELAY_FAN_2   = 21;

// ---- Wall-switch inputs (buttons, INPUT_PULLUP) ----
const int BTN_LIGHT_1 = 13;
const int BTN_LIGHT_2 = 14;
const int BTN_LIGHT_3 = 27;
const int BTN_FAN_1   = 26;
const int BTN_FAN_2   = 25;

// ---- Current sensor (ACS712) analog input ----
const int CURRENT_SENSE = 34; // ADC1_CH6

struct Device {
  const char* name;
  int relayPin;
  int buttonPin;
  bool on;
  bool lastButton;
  int  watts; // nominal watts when ON
};

Device devices[] = {
  {"Light 1", RELAY_LIGHT_1, BTN_LIGHT_1, false, HIGH, 15},
  {"Light 2", RELAY_LIGHT_2, BTN_LIGHT_2, false, HIGH, 15},
  {"Light 3", RELAY_LIGHT_3, BTN_LIGHT_3, false, HIGH, 15},
  {"Fan 1",   RELAY_FAN_1,   BTN_FAN_1,   false, HIGH, 60},
  {"Fan 2",   RELAY_FAN_2,   BTN_FAN_2,   false, HIGH, 60},
};
const int DEVICE_COUNT = sizeof(devices) / sizeof(devices[0]);

void setup() {
  Serial.begin(115200);
  for (int i = 0; i < DEVICE_COUNT; i++) {
    pinMode(devices[i].relayPin, OUTPUT);
    digitalWrite(devices[i].relayPin, LOW);
    pinMode(devices[i].buttonPin, INPUT_PULLUP);
  }
  Serial.println("Office room controller ready.");
}

int estimatedWatts() {
  int total = 0;
  for (int i = 0; i < DEVICE_COUNT; i++) if (devices[i].on) total += devices[i].watts;
  return total;
}

// Concept only: in production this POSTs to the shared backend.
// void reportState() { http.POST("http://<backend-host>:4000/api/v1/ingest", json); }

void loop() {
  bool changed = false;

  for (int i = 0; i < DEVICE_COUNT; i++) {
    bool button = digitalRead(devices[i].buttonPin);
    // Falling edge = a press toggles the device (debounced simply).
    if (devices[i].lastButton == HIGH && button == LOW) {
      devices[i].on = !devices[i].on;
      digitalWrite(devices[i].relayPin, devices[i].on ? HIGH : LOW);
      Serial.print(devices[i].name);
      Serial.println(devices[i].on ? " -> ON" : " -> OFF");
      changed = true;
    }
    devices[i].lastButton = button;
  }

  // Read the current sensor (ACS712 stand-in). ~2.5V idle at mid-scale.
  int raw = analogRead(CURRENT_SENSE);
  float sensedAmps = (raw - 2048) * (5.0 / 4096.0) / 0.100; // 100 mV/A

  if (changed) {
    Serial.print("Estimated room draw: ");
    Serial.print(estimatedWatts());
    Serial.print(" W | sensed ~");
    Serial.print(sensedAmps, 2);
    Serial.println(" A");
    // reportState();
  }

  delay(40);
}
