/**
 * =============================================================================
 * CanSat Astra Maven — Flight State Machine (Header)
 * =============================================================================
 *
 * Automatically detects the current flight phase of the CanSat:
 *
 *   IDLE → PRE_LAUNCH → ASCENDING → DESCENDING → LANDED
 *
 * Each state transition is detected using sensor data:
 *   - IDLE → PRE_LAUNCH:  Manual arm command
 *   - PRE_LAUNCH → ASCENDING:  Acceleration spike (launch detected)
 *   - ASCENDING → DESCENDING:  Altitude starts decreasing
 *   - DESCENDING → LANDED:  Altitude stabilizes near ground
 *
 * The flight state affects telemetry behavior:
 *   - IDLE/LANDED: Lower telemetry rate (saves power/bandwidth)
 *   - PRE_LAUNCH: Normal rate, waiting for launch
 *   - ASCENDING/DESCENDING: Full-rate telemetry (most critical phase)
 * =============================================================================
 */

#ifndef STATE_MACHINE_H
#define STATE_MACHINE_H

#include <Arduino.h>

/**
 * Flight states — represents the current phase of flight
 */
enum FlightState {
    STATE_IDLE,         // Not armed, sitting on the ground
    STATE_PRE_LAUNCH,   // Armed and waiting for launch
    STATE_ASCENDING,    // Launched! Going up
    STATE_DESCENDING,   // Passed apogee, coming down
    STATE_LANDED        // Back on the ground
};

/**
 * Initialize the flight state machine.
 * Starts in IDLE state. Call this once in setup().
 */
void stateMachineInit();

/**
 * Update the state machine with latest sensor data.
 * Call this every loop() iteration.
 *
 * @param accelMagnitude  Total acceleration magnitude (m/s²)
 * @param altitude        Current barometric altitude (meters)
 */
void stateMachineUpdate(float accelMagnitude, float altitude);

/**
 * Get the current flight state.
 * @return Current FlightState enum value
 */
FlightState getFlightState();

/**
 * Get the current flight state as a human-readable string.
 * @return State name string (e.g., "ASCENDING")
 */
const char* getFlightStateString();

/**
 * Arm the flight computer (transition from IDLE to PRE_LAUNCH).
 * Can be triggered by an MQTT command from the ground station.
 */
void armFlight();

/**
 * Reset the state machine back to IDLE.
 * Use after recovery to prepare for the next flight.
 */
void resetStateMachine();

/**
 * Get the maximum altitude reached during the flight (apogee).
 * @return Maximum altitude in meters
 */
float getMaxAltitude();

/**
 * Get the maximum acceleration experienced during the flight.
 * @return Maximum acceleration in m/s²
 */
float getMaxAcceleration();

#endif // STATE_MACHINE_H
