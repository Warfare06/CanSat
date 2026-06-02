/**
 * =============================================================================
 * CanSat Astra Maven — MQTT Handler (Implementation)
 * =============================================================================
 *
 * Manages secure MQTT communication with HiveMQ Cloud:
 *   - Uses WiFiClientSecure for TLS encryption
 *   - PubSubClient for MQTT protocol
 *   - Automatic reconnection with backoff
 *   - Telemetry buffering when offline
 *
 * Data Flow:
 *   Sensors → JSON → MQTT → HiveMQ Cloud → Dashboard
 *
 * Security:
 *   All data is encrypted using TLS 1.2+. The root CA certificate
 *   in config.h verifies the broker's identity.
 * =============================================================================
 */

#include "mqtt_handler.h"
#include "config.h"

#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <PubSubClient.h>

// =============================================================================
// Module-level variables
// =============================================================================

// TLS-enabled WiFi client (encrypts all MQTT traffic)
static WiFiClientSecure wifiSecureClient;

// MQTT client built on top of the secure WiFi client
static PubSubClient mqttClient(wifiSecureClient);

// User-provided callback for incoming commands
static CommandCallback commandCallback = nullptr;

// Reconnection timing
static unsigned long lastReconnectAttempt = 0;
static int reconnectAttempts = 0;

// =============================================================================
// Telemetry Buffer
// =============================================================================
// When WiFi/MQTT is down, we store telemetry packets in RAM.
// Once reconnected, buffered packets are sent automatically.
// This prevents data loss during brief connectivity interruptions.

struct BufferedPacket {
    char payload[MQTT_MAX_PACKET_SIZE];
    bool occupied;  // true if this slot contains unsent data
};

static BufferedPacket telemetryBuffer[TELEMETRY_BUFFER_SIZE];
static int bufferWriteIndex = 0;   // Next slot to write to
static int bufferedCount = 0;       // Number of packets waiting

// =============================================================================
// Private Functions
// =============================================================================

/**
 * MQTT message callback — called when a message arrives on a subscribed topic.
 * This is how we receive commands from the ground station.
 */
static void mqttCallback(char* topic, byte* payload, unsigned int length) {
    // Convert payload bytes to a null-terminated string
    char message[length + 1];
    memcpy(message, payload, length);
    message[length] = '\0';

    Serial.print("[MQTT] 📨 Message received on topic: ");
    Serial.println(topic);
    Serial.print("[MQTT]    Payload: ");
    Serial.println(message);

    // Forward to user callback if registered
    if (commandCallback != nullptr) {
        commandCallback(topic, message);
    }
}

/**
 * Attempt to connect to the MQTT broker.
 * Returns true if connection was successful.
 */
static bool mqttConnect() {
    Serial.print("[MQTT] Connecting to ");
    Serial.print(MQTT_BROKER);
    Serial.print(":");
    Serial.print(MQTT_PORT);
    Serial.println("...");

    // Create a unique client ID using the device ID and a random number
    String clientId = String(DEVICE_ID) + "-" + String(random(0xffff), HEX);

    // Attempt connection with credentials
    // Parameters: clientId, username, password
    if (mqttClient.connect(clientId.c_str(), MQTT_USERNAME, MQTT_PASSWORD)) {
        Serial.println("[MQTT] ✅ Connected to HiveMQ Cloud!");
        reconnectAttempts = 0;

        // Subscribe to the command topic to receive instructions
        mqttClient.subscribe(MQTT_TOPIC_COMMAND, MQTT_QOS_COMMAND);
        Serial.println("[MQTT] 📡 Subscribed to: " + String(MQTT_TOPIC_COMMAND));

        // Publish a "connected" status message
        String statusMsg = "{\"deviceId\":\"" + String(DEVICE_ID) +
                          "\",\"status\":\"online\",\"uptime\":" +
                          String(millis() / 1000) + "}";
        mqttClient.publish(MQTT_TOPIC_STATUS, statusMsg.c_str(), true);  // retained

        // Flush any buffered telemetry packets
        flushBuffer();

        return true;
    } else {
        // Connection failed — print the error code for debugging
        int state = mqttClient.state();
        Serial.print("[MQTT] ❌ Connection failed! Error code: ");
        Serial.println(state);

        // Decode common error codes
        switch (state) {
            case -4: Serial.println("[MQTT]    → Connection timeout"); break;
            case -3: Serial.println("[MQTT]    → Connection lost"); break;
            case -2: Serial.println("[MQTT]    → Connect failed"); break;
            case -1: Serial.println("[MQTT]    → Disconnected"); break;
            case  1: Serial.println("[MQTT]    → Bad protocol version"); break;
            case  2: Serial.println("[MQTT]    → Bad client ID"); break;
            case  3: Serial.println("[MQTT]    → Unavailable"); break;
            case  4: Serial.println("[MQTT]    → Bad credentials"); break;
            case  5: Serial.println("[MQTT]    → Unauthorized"); break;
        }

        reconnectAttempts++;
        return false;
    }
}

/**
 * Send all buffered telemetry packets.
 * Called automatically when MQTT reconnects.
 */
static void flushBuffer() {
    if (bufferedCount == 0) return;

    Serial.println("[MQTT] 📤 Flushing " + String(bufferedCount) + " buffered packets...");

    int flushed = 0;
    for (int i = 0; i < TELEMETRY_BUFFER_SIZE; i++) {
        if (telemetryBuffer[i].occupied) {
            if (mqttClient.publish(MQTT_TOPIC_TELEMETRY,
                                   telemetryBuffer[i].payload)) {
                telemetryBuffer[i].occupied = false;
                flushed++;
            } else {
                // If publish fails, stop flushing (connection may be lost)
                break;
            }
            // Small delay to avoid overwhelming the broker
            delay(10);
        }
    }

    bufferedCount -= flushed;
    if (bufferedCount < 0) bufferedCount = 0;

    Serial.println("[MQTT] 📤 Flushed " + String(flushed) + " packets. " +
                   String(bufferedCount) + " remaining.");
}

/**
 * Buffer a telemetry packet for later transmission.
 * Uses a circular buffer — oldest packets are overwritten if full.
 */
static void bufferTelemetry(const char* payload) {
    // Copy payload into the buffer slot
    strncpy(telemetryBuffer[bufferWriteIndex].payload, payload,
            MQTT_MAX_PACKET_SIZE - 1);
    telemetryBuffer[bufferWriteIndex].payload[MQTT_MAX_PACKET_SIZE - 1] = '\0';

    if (!telemetryBuffer[bufferWriteIndex].occupied) {
        bufferedCount++;
    }
    telemetryBuffer[bufferWriteIndex].occupied = true;

    // Advance write pointer (circular)
    bufferWriteIndex = (bufferWriteIndex + 1) % TELEMETRY_BUFFER_SIZE;

    Serial.println("[MQTT] 💾 Buffered packet (" + String(bufferedCount) +
                   "/" + String(TELEMETRY_BUFFER_SIZE) + ")");
}

// =============================================================================
// Public Functions
// =============================================================================

void mqttInit(CommandCallback onCommand) {
    Serial.println("[MQTT] Initializing MQTT handler...");

    commandCallback = onCommand;

    // Configure TLS — load the root CA certificate
    // This certificate verifies that we're really talking to HiveMQ
    wifiSecureClient.setCACert(HIVEMQ_ROOT_CA);
    Serial.println("[MQTT] ✅ TLS certificate loaded");

    // Configure the MQTT client
    mqttClient.setServer(MQTT_BROKER, MQTT_PORT);
    mqttClient.setCallback(mqttCallback);
    mqttClient.setKeepAlive(MQTT_KEEPALIVE_SEC);
    mqttClient.setBufferSize(MQTT_MAX_PACKET_SIZE);
    Serial.println("[MQTT] ✅ MQTT client configured");
    Serial.println("[MQTT]    Broker: " + String(MQTT_BROKER));
    Serial.println("[MQTT]    Port:   " + String(MQTT_PORT));
    Serial.println("[MQTT]    Client: " + String(DEVICE_ID));

    // Initialize buffer
    for (int i = 0; i < TELEMETRY_BUFFER_SIZE; i++) {
        telemetryBuffer[i].occupied = false;
    }
    bufferedCount = 0;
    bufferWriteIndex = 0;

    Serial.println("[MQTT] ✅ Telemetry buffer ready (" +
                   String(TELEMETRY_BUFFER_SIZE) + " slots)");
}

void mqttLoop() {
    if (mqttClient.connected()) {
        // Process incoming messages and send keepalive
        mqttClient.loop();
    } else {
        // Not connected — try to reconnect with backoff
        unsigned long now = millis();

        // Calculate backoff delay: starts at 5s, doubles each attempt, max 60s
        unsigned long backoffDelay = MQTT_RECONNECT_DELAY_MS *
                                     (1 << min(reconnectAttempts, 4));
        if (backoffDelay > 60000) backoffDelay = 60000;

        if (now - lastReconnectAttempt >= backoffDelay) {
            lastReconnectAttempt = now;

            Serial.println("[MQTT] Reconnection attempt " +
                           String(reconnectAttempts + 1) +
                           " (backoff: " + String(backoffDelay / 1000) + "s)");

            if (mqttConnect()) {
                Serial.println("[MQTT] ✅ Reconnected successfully!");
            }
        }
    }
}

bool mqttIsConnected() {
    return mqttClient.connected();
}

bool mqttPublishTelemetry(const char* jsonPayload) {
    if (mqttClient.connected()) {
        bool success = mqttClient.publish(MQTT_TOPIC_TELEMETRY, jsonPayload);
        if (!success) {
            Serial.println("[MQTT] ⚠️ Telemetry publish failed, buffering...");
            bufferTelemetry(jsonPayload);
        }
        return success;
    } else {
        // Not connected — buffer the packet
        bufferTelemetry(jsonPayload);
        return false;
    }
}

bool mqttPublishGPS(const char* jsonPayload) {
    if (mqttClient.connected()) {
        return mqttClient.publish(MQTT_TOPIC_GPS, jsonPayload);
    }
    return false;
}

bool mqttPublishStatus(const char* jsonPayload) {
    if (mqttClient.connected()) {
        return mqttClient.publish(MQTT_TOPIC_STATUS, jsonPayload, true);  // retained
    }
    return false;
}

int mqttGetRSSI() {
    return WiFi.RSSI();
}

int mqttGetBufferedCount() {
    return bufferedCount;
}
