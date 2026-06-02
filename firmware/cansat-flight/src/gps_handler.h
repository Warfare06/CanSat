/**
 * =============================================================================
 * CanSat Astra Maven — GPS Handler (Header)
 * =============================================================================
 *
 * This module handles communication with the NEO-6M GPS module.
 * The GPS sends NMEA sentences over UART, which we parse using TinyGPS++.
 *
 * GPS provides:
 *   - Latitude & longitude (position on Earth)
 *   - Altitude (height above sea level)
 *   - Speed (ground speed in km/h)
 *   - Satellite count (more satellites = better accuracy)
 *   - Fix status (whether we have a valid position)
 * =============================================================================
 */

#ifndef GPS_HANDLER_H
#define GPS_HANDLER_H

#include <Arduino.h>

/**
 * GPS position and status data
 */
struct GPSData {
    double latitude;     // Decimal degrees (e.g., 13.0827 for Chennai)
    double longitude;    // Decimal degrees (e.g., 80.2707 for Chennai)
    float  altitude;     // Altitude in meters above sea level
    float  speed;        // Ground speed in km/h
    int    satellites;   // Number of satellites in view
    bool   fix;          // True if GPS has a valid position fix
    bool   valid;        // True if GPS module is responding
    unsigned long lastFixTime;  // millis() when last fix was obtained
};

/**
 * Initialize the GPS module.
 * Sets up UART2 communication at the configured baud rate.
 * Call this once in setup().
 */
void gpsInit();

/**
 * Process incoming GPS data.
 * Must be called frequently (every loop iteration) to read serial data
 * from the GPS module. NMEA sentences are parsed character by character.
 */
void gpsUpdate();

/**
 * Get the latest GPS data.
 * @return GPSData struct with position, speed, and status
 */
GPSData getGPSData();

/**
 * Check if GPS has a recent fix (within the last 5 seconds).
 * @return true if GPS data is fresh and reliable
 */
bool gpsHasRecentFix();

#endif // GPS_HANDLER_H
