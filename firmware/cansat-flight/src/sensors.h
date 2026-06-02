/**
 * =============================================================================
 * CanSat Astra Maven — Sensor Interface (Header)
 * =============================================================================
 *
 * This module handles initialization and reading of all onboard sensors:
 *   - BMP280: barometric pressure and temperature
 *   - MPU6050: 3-axis accelerometer and 3-axis gyroscope
 *   - Battery voltage via ADC
 *
 * The sensors are read as a group and their data is stored in structs
 * for easy access by other modules.
 * =============================================================================
 */

#ifndef SENSORS_H
#define SENSORS_H

#include <Arduino.h>

// =============================================================================
// Data Structures — These hold the latest sensor readings
// =============================================================================

/**
 * Barometric sensor data from BMP280
 */
struct BaroData {
    float pressure;      // Atmospheric pressure in hPa (hectopascals)
    float temperature;   // Temperature in °C
    float altitude;      // Calculated altitude in meters (from sea-level pressure)
    bool  valid;         // True if sensor is working and data is fresh
};

/**
 * Inertial Measurement Unit data from MPU6050
 * Contains acceleration (linear) and rotation (angular velocity)
 */
struct IMUData {
    // Acceleration in m/s² (1 g ≈ 9.81 m/s²)
    float accelX, accelY, accelZ;

    // Angular velocity in °/s (degrees per second)
    float gyroX, gyroY, gyroZ;

    // Magnetometer (placeholder — MPU6050 doesn't have one,
    // but we keep the fields for ICM20948 compatibility)
    float magX, magY, magZ;

    // Magnitude of acceleration vector (useful for launch detection)
    float accelMagnitude;

    bool valid;  // True if sensor is working
};

/**
 * Battery monitoring data
 */
struct BatteryData {
    float voltage;       // Battery voltage in volts
    int   percentage;    // Estimated charge percentage (0-100)
    bool  valid;
};

// =============================================================================
// Public Functions
// =============================================================================

/**
 * Initialize all sensors (BMP280, MPU6050, battery ADC).
 * Call this once in setup().
 *
 * @return true if at least one sensor initialized successfully
 */
bool sensorsInit();

/**
 * Read all sensors and update the data structures.
 * Call this in every loop() iteration.
 */
void sensorsRead();

/**
 * Get the latest barometric sensor data.
 * @return BaroData struct with pressure, temperature, and altitude
 */
BaroData getBaroData();

/**
 * Get the latest IMU sensor data.
 * @return IMUData struct with acceleration and gyroscope readings
 */
IMUData getIMUData();

/**
 * Get the latest battery monitoring data.
 * @return BatteryData struct with voltage and percentage
 */
BatteryData getBatteryData();

/**
 * Set the sea-level pressure for altitude calculation.
 * Default is 1013.25 hPa (standard atmosphere).
 * For more accurate altitude, set this to the local sea-level pressure.
 *
 * @param pressureHPa Sea-level pressure in hectopascals
 */
void setSeaLevelPressure(float pressureHPa);

#endif // SENSORS_H
