/**
 * =============================================================================
 * CanSat Astra Maven — Flight Computer Configuration
 * =============================================================================
 *
 * This file contains ALL configurable settings for the flight computer.
 * Edit the values below before flashing to your ESP32.
 *
 * ⚠️  IMPORTANT: Update WiFi, MQTT, and Device settings before first use!
 * =============================================================================
 */

#ifndef CONFIG_H
#define CONFIG_H

// =============================================================================
// 🔑 DEVICE IDENTITY
// =============================================================================
// Give your CanSat a unique ID. This is used in MQTT topics and telemetry.
#define DEVICE_ID          "cansat-001"

// =============================================================================
// 📶 WiFi CONFIGURATION
// =============================================================================
// Your WiFi network credentials. ESP32 only supports 2.4 GHz networks!
#define WIFI_SSID          "YourWiFiName"
#define WIFI_PASSWORD      "YourWiFiPassword"

// WiFi reconnection settings
#define WIFI_CONNECT_TIMEOUT_MS   15000   // Max time to wait for WiFi (ms)
#define WIFI_RETRY_DELAY_MS       5000    // Delay between reconnection attempts

// =============================================================================
// 🌐 MQTT CONFIGURATION (HiveMQ Cloud)
// =============================================================================
// Get these from your HiveMQ Cloud dashboard:
//   1. Go to https://console.hivemq.cloud/
//   2. Create a free cluster
//   3. Copy the broker URL (e.g., "abc123.s1.eu.hivemq.cloud")
//   4. Create credentials under "Access Management"
#define MQTT_BROKER        "your-cluster.s1.eu.hivemq.cloud"
#define MQTT_PORT          8883          // TLS port (don't change this)
#define MQTT_USERNAME      "your-mqtt-username"
#define MQTT_PASSWORD      "your-mqtt-password"

// MQTT topics — {id} will be replaced with DEVICE_ID
#define MQTT_TOPIC_TELEMETRY  "cansat/" DEVICE_ID "/telemetry"
#define MQTT_TOPIC_GPS        "cansat/" DEVICE_ID "/gps"
#define MQTT_TOPIC_STATUS     "cansat/" DEVICE_ID "/status"
#define MQTT_TOPIC_COMMAND    "cansat/" DEVICE_ID "/command"

// MQTT Quality of Service levels
//   0 = At most once (fire and forget)
//   1 = At least once (guaranteed delivery)
//   2 = Exactly once (highest reliability, more overhead)
#define MQTT_QOS_TELEMETRY    1
#define MQTT_QOS_COMMAND      2

// MQTT reconnection
#define MQTT_RECONNECT_DELAY_MS   5000
#define MQTT_KEEPALIVE_SEC        60

// Maximum MQTT packet size (bytes) — needs to be large for our JSON
#define MQTT_MAX_PACKET_SIZE      1024

// =============================================================================
// 📊 TELEMETRY SETTINGS
// =============================================================================
// How often to publish telemetry data (in milliseconds)
// 100ms = 10 Hz publishing rate
#define TELEMETRY_INTERVAL_MS     100

// How often to publish status updates (in milliseconds)
#define STATUS_INTERVAL_MS        5000

// How often to publish GPS-only updates (in milliseconds)
#define GPS_PUBLISH_INTERVAL_MS   1000

// Number of telemetry packets to buffer when offline
#define TELEMETRY_BUFFER_SIZE     50

// =============================================================================
// 📌 PIN DEFINITIONS — Flight Computer
// =============================================================================
//
// I²C Bus (shared by BMP280 and MPU6050):
//   ESP32 GPIO 21 → SDA (data line)
//   ESP32 GPIO 22 → SCL (clock line)
//
#define PIN_I2C_SDA        21
#define PIN_I2C_SCL        22

// GPS Module (NEO-6M) — connected to UART2
//   ESP32 GPIO 16 → GPS TX (ESP32 receives data)
//   ESP32 GPIO 17 → GPS RX (ESP32 sends data)
#define PIN_GPS_RX         16     // ESP32 RX2 ← GPS TX
#define PIN_GPS_TX         17     // ESP32 TX2 → GPS RX
#define GPS_BAUD_RATE      9600   // NEO-6M default baud rate

// Battery voltage monitoring via ADC
//   Connect battery through a voltage divider (100kΩ + 100kΩ)
//   This halves the voltage so 4.2V battery → 2.1V at ADC pin
#define PIN_BATTERY_ADC    34     // ADC1_CH6 (input-only pin, perfect for ADC)

// Status LED — indicates connection state
//   Solid ON   = Connected to WiFi + MQTT
//   Blinking   = Connecting / reconnecting
//   OFF        = No power or deep error
#define PIN_STATUS_LED     2      // Built-in LED on most ESP32 DevKits

// =============================================================================
// 🔋 BATTERY MONITORING
// =============================================================================
// Voltage divider configuration:
//   Vbat ──[R1]──┬──[R2]── GND
//                │
//            ADC Pin
//
// With R1 = R2 = 100kΩ: divider ratio = 2.0
// ESP32 ADC range: 0-3.3V (12-bit = 0-4095)
#define BATTERY_DIVIDER_RATIO     2.0     // Vbat = Vadc × ratio
#define BATTERY_ADC_RESOLUTION    4095.0  // 12-bit ADC
#define BATTERY_ADC_VREF          3.3     // ADC reference voltage
#define BATTERY_FULL_VOLTAGE      4.2     // Fully charged LiPo voltage
#define BATTERY_EMPTY_VOLTAGE     3.0     // Empty LiPo voltage (don't go lower!)

// =============================================================================
// 🎯 SENSOR ADDRESSES (I²C)
// =============================================================================
// BMP280: SDO pin to GND = 0x76, SDO pin to VCC = 0x77
#define BMP280_I2C_ADDRESS        0x76

// MPU6050: AD0 pin to GND = 0x68, AD0 pin to VCC = 0x69
#define MPU6050_I2C_ADDRESS       0x68

// =============================================================================
// 🚀 FLIGHT STATE MACHINE THRESHOLDS
// =============================================================================
// These thresholds control automatic flight phase detection.
// Tune them based on your rocket/launch vehicle characteristics.

// Launch detection: acceleration magnitude must exceed this (in g)
#define LAUNCH_ACCEL_THRESHOLD_G       2.0

// How long acceleration must stay above threshold to confirm launch (ms)
#define LAUNCH_CONFIRM_TIME_MS         100

// Ascending → Descending: altitude must decrease for this long (ms)
#define DESCENT_CONFIRM_TIME_MS        2000

// Landing detection: altitude must be stable within this range (meters)
#define LANDING_ALTITUDE_TOLERANCE_M   2.0

// How long altitude must be stable to confirm landing (ms)
#define LANDING_CONFIRM_TIME_MS        5000

// =============================================================================
// 🔒 TLS CERTIFICATE — HiveMQ Cloud Root CA
// =============================================================================
// This is the ISRG Root X1 certificate used by HiveMQ Cloud.
// It enables secure TLS connections to the MQTT broker.
// This certificate is valid until 2035-06-04.
//
// If connection fails, you may need to update this certificate.
// Download from: https://letsencrypt.org/certs/isrgrootx1.pem
// =============================================================================
static const char* HIVEMQ_ROOT_CA PROGMEM = R"EOF(
-----BEGIN CERTIFICATE-----
MIIFazCCA1OgAwIBAgIRAIIQz7DSQONZRGPgu2OCiwAwDQYJKoZIhvcNAQELBQAw
TzELMAkGA1UEBhMCVVMxKTAnBgNVBAoTIEludGVybmV0IFNlY3VyaXR5IFJlc2Vh
cmNoIEdyb3VwMRUwEwYDVQQDEwxJU1JHIFJvb3QgWDEwHhcNMTUwNjA0MTEwNDM4
WhcNMzUwNjA0MTEwNDM4WjBPMQswCQYDVQQGEwJVUzEpMCcGA1UEChMgSW50ZXJu
ZXQgU2VjdXJpdHkgUmVzZWFyY2ggR3JvdXAxFTATBgNVBAMTDElTUkcgUm9vdCBY
MTCCAiIwDQYJKoZIhvcNAQEBBQADggIPADCCAgoCggIBAK3oJHP0FDfzm54rVygc
h77ct984kIxuPOZXoHj3dcKi/vVqbvYATyjb3miGbESTtrFj/RQSa78f0uoxmyF+
0TM8ukj13Xnfs7j/EvEhmkvBioZxaUpmZmyPfjxwv60pIgbz5MDmgK7iS4+3mX6U
A5/TR5d8mUgjU+g4rk8Kb4Mu0UlXjIB0ttov0DiNewNwIRt18jA8+o+u3dpjq+sW
T8KOEUt+zwvo/7V3LvSye0rgTBIlDHCNAymg4VMk7BPZ7hm/ELNKjD+Jo2FR3qyH
B5T0Y3HsLuJvW5iB4YlcNHlsdu87kGJ55tukmi8mxdAQ4Q7e2RCOFvu396j3x+UC
B5iPNgiV5+I3lg02dZ77DnKxHZu8A/lJBdiB3QW0KtZB6awBdpUKD9jf1b0SHzUv
KBds0pjBqAlkd25HN7rOrFleaJ1/ctaJxQZBKT5ZPt0m9STJEadao0xAH0ahmbWn
OlFuhjuefXKnEgV4We0+UXgVCwOPjdAvBbI+e0ocS3MFEvzG6uBQE3xDk3SzynTn
jh8BCNAw1FtxNrQHusEwMFxIt4I7mKZ9YIqioymCzLq9gwQbooMDQaHWBfEbwrbw
qHyGO0aoSCqI3Haadr8faqU9GY/rOPNk3sgrDQoo//fb4hVC1CLQJ13hef4Y53CI
rU7m2Ys6xt0nUW7/vGT1M0NPAgMBAAGjQjBAMA4GA1UdDwEB/wQEAwIBBjAPBgNV
HRMBAf8EBTADAQH/MB0GA1UdDgQWBBR5tFnme7bl5AFzgAiIyBpY9umbbjANBgkq
hkiG9w0BAQsFAAOCAgEAVR9YqbyyqFDQDLHYGmkgJykIrGF1XIpu+ILlaS/V9lZL
ubhzEFnTIZd+50xx+7LSYK05qAvqFyFWhfFQDlnrzuBZ6brJFe+GnY+EgPbk6ZGQ
3BebYhtF8GaV0nxvwuo77x/Py9auJ/GpsMiu/X1+mvoiBOv/2X/qkSsisRcOj/KK
NFtY2PwByVS5uCbMiogZiUvsNG/HWP+uBRew7lr5kHSgUTdHc8BayWXJnX+CGES5
b2ifyHuGOKIgHxrU2oNElkGaO9tFa7GNwjkEjyMsH9MBwgFYAlx2vTs9Uwap75HG
Dq7eMXRiwmNcjCVMlZBnJJiNACcILiB+QdD+Tp+2nKdMcVGxWIVr6HKRjJ1oVtGs
qwXGFdj6SasBeQksKgg//kEGyyBE63pMz5bRHMLiGr0/B7KDTXE+IolJO1jXaRIj
JaJDDgBViShGjl7ly/4yx8BUH3CC7xCJAH0EuOa4FjjnL5qr73tDf+FGvJgeqBM2
3D+B4xMlSb7lp8wdXCofblwjhNzhhJiCOi6MKBBp8G2P2Dt4P3jBETMSJni9S9+K
xlIVGM+uAFJqVY+sXaHmGeld4RQGEyLESbqokqOqKr45c9G5pQhJAG8TxoH7hKQu
d3MXK9KC16sTb8mtG7SO5n8fxD3+RToXzMNLqCXKNy20FURZBY3ms+AOvvMl
-----END CERTIFICATE-----
)EOF";

#endif // CONFIG_H
