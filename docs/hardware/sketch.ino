/*
  Office Energy Monitor — Representative Room Controller
  3 Lights + 2 Fans
  ESP32 + Push Buttons + Relay Modules + LED Loads

  Relays use Wokwi DEFAULT (npn) mode:
  HIGH = relay ON  = COM connected to NO
  LOW  = relay OFF = COM disconnected from NO
*/

// ---------------- Relay output pins ----------------

const int RELAY_LIGHT_1 = 16; // RX2
const int RELAY_LIGHT_2 = 17; // TX2
const int RELAY_LIGHT_3 = 18; // D18
const int RELAY_FAN_1 = 19;   // D19
const int RELAY_FAN_2 = 21;   // D21

// ---------------- Button input pins ----------------

const int BTN_LIGHT_1 = 13; // D13
const int BTN_LIGHT_2 = 14; // D14
const int BTN_LIGHT_3 = 27; // D27
const int BTN_FAN_1 = 26;   // D26
const int BTN_FAN_2 = 25;   // D25

// ---------------- Simulated current sensor ----------------

const int CURRENT_SENSE = 34; // D34 / ADC input

// ---------------- Relay logic (npn = active HIGH) ----------------

const int RELAY_ON = HIGH;
const int RELAY_OFF = LOW;

const unsigned long DEBOUNCE_TIME = 50;

struct Device
{
  const char *name;
  int relayPin;
  int buttonPin;
  int watts;

  bool on;
  bool lastRawButton;
  bool stableButton;

  unsigned long lastDebounceTime;
};

Device devices[] = {
    {"Light 1", RELAY_LIGHT_1, BTN_LIGHT_1, 15, false, HIGH, HIGH, 0},
    {"Light 2", RELAY_LIGHT_2, BTN_LIGHT_2, 15, false, HIGH, HIGH, 0},
    {"Light 3", RELAY_LIGHT_3, BTN_LIGHT_3, 15, false, HIGH, HIGH, 0},
    {"Fan 1", RELAY_FAN_1, BTN_FAN_1, 60, false, HIGH, HIGH, 0},
    {"Fan 2", RELAY_FAN_2, BTN_FAN_2, 60, false, HIGH, HIGH, 0}};

const int DEVICE_COUNT = sizeof(devices) / sizeof(devices[0]);

// ------------------------------------------------------------

int estimatedWatts()
{
  int total = 0;

  for (int i = 0; i < DEVICE_COUNT; i++)
  {
    if (devices[i].on)
    {
      total += devices[i].watts;
    }
  }

  return total;
}

void printOfficeStatus()
{
  Serial.println();
  Serial.println("-------- ROOM STATUS --------");

  for (int i = 0; i < DEVICE_COUNT; i++)
  {
    Serial.print(devices[i].name);
    Serial.print(": ");
    Serial.print(devices[i].on ? "ON" : "OFF");
    Serial.print(" | ");
    Serial.print(devices[i].on ? devices[i].watts : 0);
    Serial.println(" W");
  }

  int total = estimatedWatts();

  Serial.print("Total room power: ");
  Serial.print(total);
  Serial.println(" W");

  Serial.print("Estimated current at 230V: ");
  Serial.print(total / 230.0, 2);
  Serial.println(" A");

  Serial.print("Simulated current sensor value: ");
  Serial.println(analogRead(CURRENT_SENSE));

  Serial.println("-----------------------------");
}

void setDeviceState(Device &device, bool newState)
{
  device.on = newState;

  digitalWrite(
      device.relayPin,
      device.on ? RELAY_ON : RELAY_OFF);

  Serial.print(device.name);
  Serial.println(device.on ? " -> ON" : " -> OFF");

  printOfficeStatus();
}

void checkButton(Device &device)
{
  bool rawButton = digitalRead(device.buttonPin);

  if (rawButton != device.lastRawButton)
  {
    device.lastDebounceTime = millis();
    device.lastRawButton = rawButton;
  }

  if (millis() - device.lastDebounceTime > DEBOUNCE_TIME)
  {

    if (rawButton != device.stableButton)
    {
      device.stableButton = rawButton;

      // INPUT_PULLUP: HIGH = not pressed, LOW = pressed
      if (device.stableButton == LOW)
      {
        setDeviceState(device, !device.on);
      }
    }
  }
}

void setup()
{
  Serial.begin(115200);
  delay(300);

  for (int i = 0; i < DEVICE_COUNT; i++)
  {
    digitalWrite(devices[i].relayPin, RELAY_OFF);
    pinMode(devices[i].relayPin, OUTPUT);

    pinMode(devices[i].buttonPin, INPUT_PULLUP);

    bool initialButtonState = digitalRead(devices[i].buttonPin);
    devices[i].lastRawButton = initialButtonState;
    devices[i].stableButton = initialButtonState;
    devices[i].on = false;
  }

  pinMode(CURRENT_SENSE, INPUT);

  Serial.println("Office Energy Monitor ready.");
  Serial.println("All devices start OFF.");
  printOfficeStatus();
}

void loop()
{
  for (int i = 0; i < DEVICE_COUNT; i++)
  {
    checkButton(devices[i]);
  }

  delay(5);
}