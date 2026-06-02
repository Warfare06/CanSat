/**
 * =============================================================================
 * CanSat Astra Maven — MQTT Handler (Header)
 * =============================================================================
 *
 * This module manages the MQTT connection to HiveMQ Cloud.
 * It handles:
 *   - Secure TLS connection using WiFiClientSecure
 *   - MQTT connection, reconnection, and keepalive
 *   - Publishing telemetry, GPS, and status data
 *   - Subscribing to command topics
 *   - Buffering telemetry when offline
 *
 * MQTT is the protocol we use to send sensor data to the cloud.
 * Think of it like a postal service:
 *   - Topics are like addresses
 *   - Messages are like letters
 *   - The broker (HiveMQ) is like the post office
 *   - QoS levels are like delivery confirmation options
 * =============================================================================
 */

#ifndef MQTT_HANDLER_H
#define MQTT_HANDLER_H

#include <Arduino.h>

// Callback type for incoming commands
// When the ground station sends a command, this function is called
typedef void (*CommandCallback)(const char* topic, const char* payload);

/**
 * Initialize the MQTT handler.
 * Sets up TLS certificates and configures the MQTT client.
 * Call this once in setup(), AFTER WiFi is connected.
 *
 * @param onCommand  Callback function for incoming commands (can be nullptr)
 */
void mqttInit(CommandCallback onCommand);

/**
 * Maintain the MQTT connection.
 * Call this in every loop() iteration. It handles:
 *   - Reconnecting if disconnected
 *   - Processing incoming messages
 *   - Sending keepalive pings
 */
void mqttLoop();

/**
 * Check if MQTT is currently connected.
 * @return true if connected to the broker
 */
bool mqttIsConnected();

/**
 * Publish a full telemetry packet (JSON).
 * If not connected, the packet is buffered for later transmission.
 *
 * @param jsonPayload  The JSON string to publish
 * @return true if published successfully (or buffered)
 */
bool mqttPublishTelemetry(const char* jsonPayload);

/**
 * Publish a GPS-only update (JSON).
 * @param jsonPayload  The GPS JSON string
 * @return true if published successfully
 */
bool mqttPublishGPS(const char* jsonPayload);

/**
 * Publish a status update (JSON).
 * @param jsonPayload  The status JSON string
 * @return true if published successfully
 */
bool mqttPublishStatus(const char* jsonPayload);

/**
 * Get the current RSSI (WiFi signal strength).
 * @return RSSI value in dBm (typically -30 to -90)
 */
int mqttGetRSSI();

/**
 * Get the number of buffered (unsent) telemetry packets.
 * @return Number of packets waiting to be sent
 */
int mqttGetBufferedCount();

#endif // MQTT_HANDLER_H
