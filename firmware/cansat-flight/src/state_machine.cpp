/**
 * =============================================================================
 * CanSat Astra Maven — Flight State Machine (Implementation)
 * =============================================================================
 *
 * Implements automatic flight phase detection using acceleration and altitude.
 *
 * State Transitions:
 * ─────────────────
 *
 *   IDLE ──[arm command]──► PRE_LAUNCH
 *     The CanSat is powered on but not yet armed for flight.
 *     Transition: Ground station sends "arm" command via MQTT.
 *
 *   PRE_LAUNCH ──[accel spike]──► ASCENDING
 *     Armed and waiting on the launch pad.
 *     Transition: Acceleration exceeds threshold (e.g., >2g for >100ms).
 *
 *   ASCENDING ──[altitude peak]──► DESCENDING
 *     The rocket is going up! Maximum data collection rate.
 *     Transition: Altitude decreases consistently for 2+ seconds.
 *
 *   DESCENDING ──[altitude stable]──► LANDED
 *     Coming down under parachute or free-fall.
 *     Transition: Altitude stable within ±2m for 5+ seconds.
 *
 *   LANDED ──[reset command]──► IDLE
 *     Safely on the ground. Awaiting recovery.
 *     Transition: Ground station sends "reset" command via MQTT.
 *
 * =============================================================================
 */

#include "state_machine.h"
#include "config.h"

// =============================================================================
// Module-level variables
// =============================================================================

// Current flight state
static FlightState currentState = STATE_IDLE;

// Timing variables for state transition detection
static unsigned long launchDetectStart = 0;     // When acceleration first exceeded threshold
static unsigned long descentDetectStart = 0;    // When altitude first started decreasing
static unsigned long landingDetectStart = 0;    // When altitude first became stable

// Altitude tracking
static float previousAltitude = 0;             // Altitude from previous update
static float maxAltitudeReached = 0;           // Highest altitude recorded (apogee)
static float landingReferenceAlt = 0;          // Reference altitude for landing detection
static float maxAccelReached = 0;              // Maximum acceleration recorded

// State transition flags
static bool launchAccelDetected = false;       // True when accel exceeds threshold

// =============================================================================
// Human-readable state names
// =============================================================================

static const char* stateNames[] = {
    "IDLE",
    "PRE_LAUNCH",
    "ASCENDING",
    "DESCENDING",
    "LANDED"
};

// =============================================================================
// Public Functions
// =============================================================================

void stateMachineInit() {
    currentState = STATE_IDLE;
    launchDetectStart = 0;
    descentDetectStart = 0;
    landingDetectStart = 0;
    previousAltitude = 0;
    maxAltitudeReached = 0;
    landingReferenceAlt = 0;
    maxAccelReached = 0;
    launchAccelDetected = false;

    Serial.println("[STATE] Flight state machine initialized → IDLE");
    Serial.println("[STATE] Thresholds:");
    Serial.println("[STATE]   Launch accel:    " + String(LAUNCH_ACCEL_THRESHOLD_G) + " g");
    Serial.println("[STATE]   Launch confirm:  " + String(LAUNCH_CONFIRM_TIME_MS) + " ms");
    Serial.println("[STATE]   Descent confirm: " + String(DESCENT_CONFIRM_TIME_MS) + " ms");
    Serial.println("[STATE]   Landing tolerance: ±" + String(LANDING_ALTITUDE_TOLERANCE_M) + " m");
    Serial.println("[STATE]   Landing confirm: " + String(LANDING_CONFIRM_TIME_MS) + " ms");
}

void stateMachineUpdate(float accelMagnitude, float altitude) {
    unsigned long now = millis();

    // Track maximum values across the entire flight
    if (altitude > maxAltitudeReached) {
        maxAltitudeReached = altitude;
    }
    if (accelMagnitude > maxAccelReached) {
        maxAccelReached = accelMagnitude;
    }

    // Convert acceleration to g-force for threshold comparison
    // 1g = 9.81 m/s² (Earth's gravity)
    float accelG = accelMagnitude / 9.81;

    // =========================================================================
    // State Machine Logic
    // =========================================================================
    switch (currentState) {

        // ---------------------------------------------------------------------
        // IDLE: Waiting to be armed
        // ---------------------------------------------------------------------
        case STATE_IDLE:
            // Nothing to do — waiting for armFlight() to be called
            // Store initial altitude as reference
            previousAltitude = altitude;
            break;

        // ---------------------------------------------------------------------
        // PRE_LAUNCH: Armed and waiting for launch
        // ---------------------------------------------------------------------
        case STATE_PRE_LAUNCH:
            // Look for acceleration spike indicating launch
            if (accelG > LAUNCH_ACCEL_THRESHOLD_G) {
                if (!launchAccelDetected) {
                    // First time exceeding threshold — start the timer
                    launchDetectStart = now;
                    launchAccelDetected = true;
                    Serial.println("[STATE] 🔥 High acceleration detected! (" +
                                   String(accelG, 2) + "g)");
                } else if (now - launchDetectStart >= LAUNCH_CONFIRM_TIME_MS) {
                    // Acceleration sustained above threshold — LAUNCH CONFIRMED!
                    currentState = STATE_ASCENDING;
                    Serial.println("[STATE] 🚀🚀🚀 LAUNCH DETECTED! → ASCENDING");
                    Serial.println("[STATE] Peak acceleration: " +
                                   String(accelG, 2) + "g");
                }
            } else {
                // Acceleration dropped below threshold — reset timer
                // (This prevents false triggers from bumps/vibrations)
                launchAccelDetected = false;
                launchDetectStart = 0;
            }
            break;

        // ---------------------------------------------------------------------
        // ASCENDING: Going up!
        // ---------------------------------------------------------------------
        case STATE_ASCENDING:
            // Look for altitude decrease (we've passed apogee)
            if (altitude < previousAltitude - 1.0) {
                // Altitude is decreasing (with 1m hysteresis to avoid noise)
                if (descentDetectStart == 0) {
                    // First decrease detected — start timer
                    descentDetectStart = now;
                    Serial.println("[STATE] 📉 Altitude decreasing... monitoring");
                } else if (now - descentDetectStart >= DESCENT_CONFIRM_TIME_MS) {
                    // Altitude has been decreasing for long enough
                    currentState = STATE_DESCENDING;
                    landingReferenceAlt = altitude;
                    Serial.println("[STATE] ⬇️ APOGEE PASSED! → DESCENDING");
                    Serial.println("[STATE] Max altitude reached: " +
                                   String(maxAltitudeReached, 1) + "m");
                }
            } else {
                // Still going up or altitude noise — reset descent timer
                descentDetectStart = 0;
            }

            // Update previous altitude for next comparison
            previousAltitude = altitude;
            break;

        // ---------------------------------------------------------------------
        // DESCENDING: Coming down
        // ---------------------------------------------------------------------
        case STATE_DESCENDING:
            // Look for altitude stabilization (landing)
            if (abs(altitude - landingReferenceAlt) < LANDING_ALTITUDE_TOLERANCE_M) {
                // Altitude is stable within tolerance
                if (landingDetectStart == 0) {
                    landingDetectStart = now;
                    Serial.println("[STATE] 📍 Altitude stabilizing... monitoring");
                } else if (now - landingDetectStart >= LANDING_CONFIRM_TIME_MS) {
                    // Altitude has been stable long enough — LANDED!
                    currentState = STATE_LANDED;
                    Serial.println("[STATE] 🏁 LANDING DETECTED! → LANDED");
                    Serial.println("[STATE] ──── Flight Summary ────");
                    Serial.println("[STATE] Max altitude: " +
                                   String(maxAltitudeReached, 1) + "m");
                    Serial.println("[STATE] Max acceleration: " +
                                   String(maxAccelReached / 9.81, 2) + "g");
                    Serial.println("[STATE] ────────────────────────");
                }
            } else {
                // Altitude still changing — reset landing timer and update reference
                landingDetectStart = 0;
                landingReferenceAlt = altitude;
            }
            break;

        // ---------------------------------------------------------------------
        // LANDED: On the ground
        // ---------------------------------------------------------------------
        case STATE_LANDED:
            // Nothing to do — waiting for resetStateMachine() to be called
            break;
    }
}

FlightState getFlightState() {
    return currentState;
}

const char* getFlightStateString() {
    return stateNames[currentState];
}

void armFlight() {
    if (currentState == STATE_IDLE) {
        currentState = STATE_PRE_LAUNCH;
        Serial.println("[STATE] ⚡ Flight ARMED! → PRE_LAUNCH");
        Serial.println("[STATE] Waiting for launch acceleration...");
    } else {
        Serial.println("[STATE] ⚠️ Cannot arm: not in IDLE state (current: " +
                       String(getFlightStateString()) + ")");
    }
}

void resetStateMachine() {
    Serial.println("[STATE] 🔄 State machine RESET → IDLE");
    stateMachineInit();
}

float getMaxAltitude() {
    return maxAltitudeReached;
}

float getMaxAcceleration() {
    return maxAccelReached;
}
