/**
 * =============================================================================
 * CanSat Astra Maven — Ground Station Relay
 * =============================================================================
 * Receives LoRa telemetry from CanSat and bridges it to HiveMQ Cloud via WiFi.
 */

#include <Arduino.h>
#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <PubSubClient.h>

// Configuration
#define WIFI_SSID          "YourWiFiName"
#define WIFI_PASSWORD      "YourWiFiPassword"
#define MQTT_BROKER        "your-cluster.s1.eu.hivemq.cloud"
#define MQTT_PORT          8883
#define MQTT_USERNAME      "your-mqtt-username"
#define MQTT_PASSWORD      "your-mqtt-password"

// HiveMQ root certificate
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

WiFiClientSecure secureClient;
PubSubClient mqttClient(secureClient);

void connectWiFi() {
  Serial.print("Connecting to WiFi");
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWiFi connected!");
}

void connectMQTT() {
  while (!mqttClient.connected()) {
    Serial.print("Connecting to MQTT...");
    if (mqttClient.connect("cansat-ground-station", MQTT_USERNAME, MQTT_PASSWORD)) {
      Serial.println("connected");
    } else {
      Serial.print("failed, rc=");
      Serial.print(mqttClient.state());
      Serial.println(" retrying in 5 seconds");
      delay(5000);
    }
  }
}

void setup() {
  Serial.begin(115200);
  secureClient.setCACert(HIVEMQ_ROOT_CA);
  mqttClient.setServer(MQTT_BROKER, MQTT_PORT);
  connectWiFi();
  connectMQTT();
}

void loop() {
  if (!mqttClient.connected()) {
    connectMQTT();
  }
  mqttClient.loop();

  // TODO: Add LoRa SX1276 reading logic here
  // For now, it simply connects to HiveMQ. 
}
