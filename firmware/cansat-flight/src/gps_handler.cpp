/**
 * =============================================================================
 * CanSat Astra Maven — GPS Handler (Implementation)
 * =============================================================================
 *
 * Communicates with NEO-6M GPS module via UART2 (Serial2).
 * Parses NMEA sentences using the TinyGPS++ library.
 *
 * How GPS works in a CanSat:
 *   1. The GPS module continuously sends NMEA sentences over serial
 *   2. We read these characters one at a time using Serial2
 *   3. TinyGPS++ parses the sentences and extracts useful data
 *   4. We store the parsed data for other modules to access
 *
 * Important: GPS needs a clear view of the sky. It may take 1-2 minutes
 * to get a "cold start" fix when first powered on.
 * =============================================================================
 */

#include "gps_handler.h"
#include "config.h"
#include <TinyGPSPlus.h>

// =============================================================================
// Module-level variables
// =============================================================================

// TinyGPS++ parser instance
static TinyGPSPlus gps;

// Latest GPS data
static GPSData currentGPS = {0, 0, 0, 0, 0, false, false, 0};

// How long before we consider the GPS fix "stale" (in milliseconds)
static const unsigned long GPS_FIX_TIMEOUT_MS = 5000;

// =============================================================================
// Public Functions
// =============================================================================

void gpsInit() {
    Serial.println("[GPS] Initializing GPS on UART2...");
    Serial.println("[GPS] RX Pin: GPIO " + String(PIN_GPS_RX) +
                   " (← GPS TX)");
    Serial.println("[GPS] TX Pin: GPIO " + String(PIN_GPS_TX) +
                   " (→ GPS RX)");
    Serial.println("[GPS] Baud Rate: " + String(GPS_BAUD_RATE));

    // Initialize UART2 for GPS communication
    // Parameters: baud rate, config, RX pin, TX pin
    Serial2.begin(GPS_BAUD_RATE, SERIAL_8N1, PIN_GPS_RX, PIN_GPS_TX);

    Serial.println("[GPS] ✅ GPS UART initialized. Waiting for satellite fix...");
    Serial.println("[GPS] 💡 Tip: GPS needs clear sky view. First fix may take 1-2 min.");
}

void gpsUpdate() {
    // Read all available characters from the GPS serial port
    // Each character is fed to the TinyGPS++ parser
    while (Serial2.available() > 0) {
        char c = Serial2.read();
        gps.encode(c);  // Feed character to parser
    }

    // Update our data structure if the parser has new data
    currentGPS.valid = true;  // GPS module is at least communicating

    // Check if we have a valid location fix
    if (gps.location.isValid() && gps.location.isUpdated()) {
        currentGPS.latitude  = gps.location.lat();
        currentGPS.longitude = gps.location.lng();
        currentGPS.fix       = true;
        currentGPS.lastFixTime = millis();
    }

    // Altitude
    if (gps.altitude.isValid()) {
        currentGPS.altitude = gps.altitude.meters();
    }

    // Ground speed (convert from km/h)
    if (gps.speed.isValid()) {
        currentGPS.speed = gps.speed.kmph();
    }

    // Number of satellites
    if (gps.satellites.isValid()) {
        currentGPS.satellites = gps.satellites.value();
    }

    // If we haven't received a fix in a while, mark as no fix
    if (millis() - currentGPS.lastFixTime > GPS_FIX_TIMEOUT_MS) {
        currentGPS.fix = false;
    }

    // If no data received at all for 10 seconds, GPS module may be disconnected
    if (gps.charsProcessed() < 10 && millis() > 10000) {
        if (millis() % 30000 < 100) {  // Print warning every ~30 seconds
            Serial.println("[GPS] ⚠️ No GPS data received! Check wiring.");
        }
        currentGPS.valid = false;
    }
}

GPSData getGPSData() {
    return currentGPS;
}

bool gpsHasRecentFix() {
    return currentGPS.fix &&
           (millis() - currentGPS.lastFixTime < GPS_FIX_TIMEOUT_MS);
}
