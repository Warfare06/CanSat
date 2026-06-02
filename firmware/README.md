# 🛰️ CanSat Astra Maven — ESP32 Firmware

> Baseline firmware for a miniature satellite (CanSat) that reads sensors during flight
> and transmits telemetry via MQTT to HiveMQ Cloud.

## 📁 Project Structure

```
firmware/
├── README.md                  ← You are here
├── cansat-flight/             ← Flight computer firmware (onboard the CanSat)
│   ├── platformio.ini
│   ├── src/
│   │   ├── main.cpp           — Entry point, setup & loop
│   │   ├── config.h           — WiFi, MQTT, pin definitions
│   │   ├── sensors.h/.cpp     — BMP280 + MPU6050 initialization & reading
│   │   ├── mqtt_handler.h/.cpp— MQTT connection & publishing (TLS)
│   │   ├── state_machine.h/.cpp— Flight state detection
│   │   └── gps_handler.h/.cpp — NEO-6M GPS parsing
│   └── lib/
│       └── README.md
└── ground-station/            ← Ground station bridge (on the ground)
    ├── platformio.ini
    ├── src/
    │   ├── main.cpp           — LoRa → MQTT bridge + OLED display
    │   └── config.h           — Configuration
    └── lib/
        └── README.md
```

---

## 🔧 Hardware Requirements

### Flight Computer
| Component         | Model          | Interface | Notes                        |
|-------------------|----------------|-----------|------------------------------|
| Microcontroller   | ESP32 DevKit   | —         | 38-pin recommended           |
| Barometer         | BMP280         | I²C       | Pressure + temperature       |
| IMU               | MPU6050        | I²C       | Accelerometer + gyroscope    |
| GPS               | NEO-6M         | UART      | With external antenna        |
| Battery           | 1S LiPo        | ADC       | 3.7V, 500mAh+ recommended   |
| Status LED        | Any 3mm/5mm    | GPIO      | Connection indicator         |
| Voltage Divider   | 2× resistors   | ADC       | 100kΩ + 100kΩ for Vbat      |

### Ground Station
| Component         | Model          | Interface | Notes                        |
|-------------------|----------------|-----------|------------------------------|
| Microcontroller   | ESP32 DevKit   | —         | 38-pin recommended           |
| LoRa Module       | SX1276/SX1278  | SPI       | 433 MHz or 868/915 MHz       |
| OLED Display      | SSD1306        | I²C       | 128×64 pixels, 0.96"         |

---

## 🔌 Wiring Diagrams

### Flight Computer Wiring

```
                    ┌──────────────────────┐
                    │     ESP32 DevKit      │
                    │                       │
    ┌───────┐       │                       │       ┌───────────┐
    │BMP280 │       │                       │       │  MPU6050  │
    │       │       │                       │       │           │
    │  VCC──┼───────┤ 3V3             3V3 ──┼───────┤──VCC      │
    │  GND──┼───────┤ GND             GND ──┼───────┤──GND      │
    │  SCL──┼───────┤ GPIO 22 (SCL)   GPIO 22 (SCL)─┤──SCL      │
    │  SDA──┼───────┤ GPIO 21 (SDA)   GPIO 21 (SDA)─┤──SDA      │
    │  CSB──┼─ NC   │                       │       │  AD0──GND │
    │  SDO──┼─ GND  │                       │       │           │
    └───────┘       │                       │       └───────────┘
                    │                       │
    ┌───────┐       │                       │       ┌───────────┐
    │NEO-6M │       │                       │       │  STATUS   │
    │  GPS  │       │                       │       │   LED     │
    │       │       │                       │       │           │
    │  VCC──┼───────┤ 3V3                   │       │    (+)    │
    │  GND──┼───────┤ GND             GPIO 2├───┬───┤──Anode    │
    │   TX──┼───────┤ GPIO 16 (RX2)        │   │   │           │
    │   RX──┼───────┤ GPIO 17 (TX2)        │  [R]  │  330Ω     │
    └───────┘       │                       │   │   │           │
                    │                       │   └───┤──Cathode  │
                    │                       │       │    (-)    │
                    │                       │       └───────────┘
                    │                       │
                    │   BATTERY MONITOR     │
                    │                       │
    ┌───────┐       │                       │
    │ LiPo  │       │                       │
    │ 3.7V  │       │                       │
    │       │       │                       │
    │  (+)──┼──┬────┤                       │
    │       │  │    │                       │
    │       │ [R1]  │  100kΩ               │
    │       │  │    │                       │
    │       │  ├────┤ GPIO 34 (ADC)        │
    │       │  │    │                       │
    │       │ [R2]  │  100kΩ               │
    │       │  │    │                       │
    │  (-)──┼──┴────┤ GND                   │
    └───────┘       │                       │
                    └──────────────────────┘
```

> **Note:** BMP280 and MPU6050 share the same I²C bus (GPIO 21/22).
> The MPU6050 AD0 pin is connected to GND to set its address to 0x68.
> The BMP280 SDO pin is connected to GND to set its address to 0x76.

### Ground Station Wiring

```
                    ┌──────────────────────┐
                    │     ESP32 DevKit      │
                    │                       │
    ┌───────────┐   │                       │   ┌───────────┐
    │  SX1276   │   │                       │   │  SSD1306  │
    │  LoRa     │   │                       │   │  OLED     │
    │           │   │                       │   │           │
    │  VCC  ────┼───┤ 3V3             3V3 ──┼───┤── VCC     │
    │  GND  ────┼───┤ GND             GND ──┼───┤── GND     │
    │  SCK  ────┼───┤ GPIO 18 (SCK)        │   │           │
    │  MISO ────┼───┤ GPIO 19 (MISO)       │   │           │
    │  MOSI ────┼───┤ GPIO 23 (MOSI)       │   │           │
    │  NSS  ────┼───┤ GPIO  5 (CS)    GPIO 22 (SCL)─┤── SCL     │
    │  RST  ────┼───┤ GPIO 14         GPIO 21 (SDA)─┤── SDA     │
    │  DIO0 ────┼───┤ GPIO 26              │   │           │
    └───────────┘   │                       │   └───────────┘
                    │                       │
                    │   STATUS LED          │
                    │                       │
                    │  GPIO 2 ──[330Ω]──LED │
                    │                       │
                    └──────────────────────┘
```

---

## 🚀 Getting Started

### Prerequisites

1. **Install PlatformIO** — Available as a VS Code extension or CLI:
   - VS Code: Install "PlatformIO IDE" from the Extensions marketplace
   - CLI: `pip install platformio`

2. **Install USB Drivers** — Your ESP32 board likely uses a CP2102 or CH340 USB chip.
   Download the appropriate driver for your OS.

3. **HiveMQ Cloud Account** — Sign up at https://www.hivemq.com/cloud/
   - Create a free cluster
   - Note down the broker URL, username, and password

### Flashing the Flight Computer

```bash
# Navigate to the flight computer project
cd firmware/cansat-flight

# ⚠️ First, edit src/config.h with your settings:
#   - WiFi SSID and password
#   - MQTT broker URL, username, password
#   - Device ID

# Build the firmware
pio run

# Flash to your ESP32 (connect via USB)
pio run --target upload

# Open serial monitor to see debug output
pio device monitor --baud 115200
```

### Flashing the Ground Station

```bash
# Navigate to the ground station project
cd firmware/ground-station

# ⚠️ First, edit src/config.h with your settings

# Build and flash
pio run --target upload

# Monitor serial output
pio device monitor --baud 115200
```

---

## 📡 MQTT Topics

| Topic Pattern                      | Direction | QoS | Description              |
|------------------------------------|-----------|-----|--------------------------|
| `cansat/{DEVICE_ID}/telemetry`     | Publish   | 1   | Full sensor data (10 Hz) |
| `cansat/{DEVICE_ID}/gps`          | Publish   | 1   | GPS-only updates         |
| `cansat/{DEVICE_ID}/status`       | Publish   | 1   | Device health & state    |
| `cansat/{DEVICE_ID}/command`      | Subscribe | 2   | Incoming commands        |

### Telemetry JSON Example

```json
{
  "deviceId": "cansat-001",
  "timestamp": 1717084800000,
  "seq": 12345,
  "state": "ASCENDING",
  "sensors": {
    "pressure": 1013.2,
    "temperature": 21.5,
    "humidity": 0,
    "altitude": 856.3
  },
  "imu": {
    "acceleration": { "x": 0.02, "y": -0.01, "z": 9.81 },
    "gyroscope": { "x": 0.5, "y": -0.3, "z": 0.1 },
    "magnetometer": { "x": 0.0, "y": 0.0, "z": 0.0 }
  },
  "gps": {
    "latitude": 13.0827,
    "longitude": 80.2707,
    "altitude": 856.3,
    "speed": 12.5,
    "satellites": 8,
    "fix": true
  },
  "battery": {
    "voltage": 3.7,
    "percentage": 85
  },
  "rssi": -45
}
```

---

## 🔄 Flight State Machine

The firmware automatically detects the flight phase using sensor data:

```
    ┌──────┐   Arm Command    ┌────────────┐   Accel Spike   ┌───────────┐
    │ IDLE │ ───────────────► │ PRE_LAUNCH │ ──────────────► │ ASCENDING │
    └──────┘                  └────────────┘                 └─────┬─────┘
       ▲                                                          │
       │                                                   Altitude Peak
       │  Reset                                                   │
       │  Command              ┌────────┐    Alt Stable    ┌──────▼──────┐
       └───────────────────── │ LANDED │ ◄──────────────── │ DESCENDING │
                              └────────┘                   └─────────────┘
```

**Detection Thresholds (configurable in `config.h`):**
- **Launch:** Acceleration magnitude > 2.0 g for 100+ ms
- **Ascending → Descending:** Altitude decreases for 2+ seconds
- **Landing:** Altitude stable (±2m) for 5+ seconds

---

## 🛡️ Error Handling & Resilience

- **WiFi Reconnection**: Auto-reconnects if WiFi drops, with exponential backoff
- **MQTT Reconnection**: Auto-reconnects to MQTT broker with session persistence
- **Data Buffering**: Up to 50 telemetry packets buffered in RAM when offline
- **GPS Timeout**: Reports last known position if GPS fix is lost
- **Sensor Failure**: Reports NaN values; continues operation with available sensors

---

## ⚙️ Configuration Quick Reference

All configuration is in `src/config.h`. Key settings:

```cpp
// WiFi
#define WIFI_SSID          "YourWiFiName"
#define WIFI_PASSWORD      "YourWiFiPassword"

// MQTT (HiveMQ Cloud)
#define MQTT_BROKER        "your-cluster.s1.eu.hivemq.cloud"
#define MQTT_PORT          8883
#define MQTT_USERNAME      "your-username"
#define MQTT_PASSWORD      "your-password"

// Device
#define DEVICE_ID          "cansat-001"
```

---

## 🐛 Troubleshooting

| Problem                        | Solution                                                  |
|-------------------------------|-----------------------------------------------------------|
| No serial output              | Check baud rate is 115200; try pressing RST button        |
| WiFi won't connect            | Verify SSID/password; ESP32 supports 2.4 GHz only        |
| MQTT connection fails         | Check broker URL, port 8883, and TLS certificate          |
| BMP280 not found              | Check I²C wiring; verify address 0x76 (SDO → GND)        |
| MPU6050 not found             | Check I²C wiring; verify address 0x68 (AD0 → GND)        |
| GPS no fix                    | Move outdoors; GPS needs clear sky view; wait 1-2 minutes |
| Battery reads wrong voltage   | Verify voltage divider resistor values; calibrate ADC     |
| Upload fails                  | Hold BOOT button during upload; check USB cable           |

---

## 📜 License

This project is part of the CanSat Astra Maven educational program.
Free to use and modify for educational purposes.
