/**
 * =============================================================================
 * CanSat Astra Maven — Sensor Interface (Implementation)
 * =============================================================================
 *
 * Implements sensor initialization and reading for:
 *   - BMP280 (I²C) — pressure, temperature, altitude
 *   - MPU6050 (I²C) — accelerometer, gyroscope
 *   - Battery ADC — voltage monitoring through voltage divider
 *
 * Both I²C sensors share the same bus (GPIO 21 = SDA, GPIO 22 = SCL).
 * =============================================================================
 */

#include "sensors.h"
#include "config.h"

// --- Library includes ---
#include <Wire.h>                    // I²C communication
#include <Adafruit_BMP280.h>         // BMP280 barometric sensor
#include <MPU6050.h>                 // MPU6050 IMU sensor

// =============================================================================
// Module-level variables (private to this file)
// =============================================================================

// Sensor objects
static Adafruit_BMP280 bmp;         // BMP280 sensor instance
static MPU6050 mpu;                 // MPU6050 sensor instance

// Latest sensor readings (updated by sensorsRead())
static BaroData    currentBaro    = {0, 0, 0, false};
static IMUData     currentIMU     = {0, 0, 0, 0, 0, 0, 0, 0, 0, 0, false};
static BatteryData currentBattery = {0, 0, false};

// Sensor status flags
static bool bmpInitialized = false;
static bool mpuInitialized = false;

// Sea-level pressure for altitude calculation (default: standard atmosphere)
static float seaLevelPressure = 1013.25;  // hPa

// Battery voltage smoothing (simple moving average)
static const int   BATTERY_SAMPLES = 10;
static float       batteryReadings[10];
static int         batteryReadIndex = 0;
static bool        batteryBufferFull = false;

// =============================================================================
// Private Helper Functions
// =============================================================================

/**
 * Read the raw ADC value from the battery pin and convert to voltage.
 * Uses a voltage divider, so we multiply by the divider ratio.
 *
 * How it works:
 *   1. ESP32 ADC reads 0-4095 (12-bit) corresponding to 0-3.3V
 *   2. Voltage at ADC pin = (ADC_reading / 4095) × 3.3V
 *   3. Actual battery voltage = ADC voltage × divider ratio (2.0)
 */
static float readBatteryVoltageRaw() {
    int rawADC = analogRead(PIN_BATTERY_ADC);

    // Convert ADC reading to voltage at the pin
    float adcVoltage = (rawADC / BATTERY_ADC_RESOLUTION) * BATTERY_ADC_VREF;

    // Scale up by voltage divider ratio to get actual battery voltage
    float batteryVoltage = adcVoltage * BATTERY_DIVIDER_RATIO;

    return batteryVoltage;
}

/**
 * Smooth battery voltage readings using a simple moving average.
 * This reduces noise from the ADC and gives more stable readings.
 */
static float smoothBatteryVoltage(float newReading) {
    batteryReadings[batteryReadIndex] = newReading;
    batteryReadIndex = (batteryReadIndex + 1) % BATTERY_SAMPLES;
    if (batteryReadIndex == 0) batteryBufferFull = true;

    int count = batteryBufferFull ? BATTERY_SAMPLES : batteryReadIndex;
    float sum = 0;
    for (int i = 0; i < count; i++) {
        sum += batteryReadings[i];
    }

    return sum / count;
}

/**
 * Convert battery voltage to percentage (0-100%).
 * Uses a simple linear mapping between empty and full voltages.
 *
 * Note: Real LiPo discharge curves are non-linear, but this
 * approximation is good enough for our purposes.
 */
static int voltageToPercentage(float voltage) {
    if (voltage >= BATTERY_FULL_VOLTAGE) return 100;
    if (voltage <= BATTERY_EMPTY_VOLTAGE) return 0;

    float percentage = (voltage - BATTERY_EMPTY_VOLTAGE) /
                       (BATTERY_FULL_VOLTAGE - BATTERY_EMPTY_VOLTAGE) * 100.0;
    return (int)percentage;
}

// =============================================================================
// Public Functions
// =============================================================================

bool sensorsInit() {
    Serial.println("[SENSORS] Initializing sensors...");

    // -------------------------------------------------------------------------
    // Initialize I²C bus
    // -------------------------------------------------------------------------
    Wire.begin(PIN_I2C_SDA, PIN_I2C_SCL);
    Wire.setClock(400000);  // 400 kHz fast mode (both sensors support this)
    Serial.println("[SENSORS] I²C bus initialized (SDA=" +
                   String(PIN_I2C_SDA) + ", SCL=" + String(PIN_I2C_SCL) + ")");

    // -------------------------------------------------------------------------
    // Initialize BMP280 — Barometric Pressure Sensor
    // -------------------------------------------------------------------------
    Serial.print("[SENSORS] Looking for BMP280 at 0x");
    Serial.print(BMP280_I2C_ADDRESS, HEX);
    Serial.println("...");

    if (bmp.begin(BMP280_I2C_ADDRESS)) {
        bmpInitialized = true;
        Serial.println("[SENSORS] ✅ BMP280 found and initialized!");

        // Configure BMP280 for weather monitoring mode
        // - Temperature oversampling ×2 (reduces noise)
        // - Pressure oversampling ×16 (high precision)
        // - Filter coefficient 16 (smooth out short-term fluctuations)
        // - Normal mode (continuous measurement)
        bmp.setSampling(
            Adafruit_BMP280::MODE_NORMAL,     // Operating mode
            Adafruit_BMP280::SAMPLING_X2,     // Temperature oversampling
            Adafruit_BMP280::SAMPLING_X16,    // Pressure oversampling
            Adafruit_BMP280::FILTER_X16,      // IIR filter coefficient
            Adafruit_BMP280::STANDBY_MS_63    // Standby time between measurements
        );
    } else {
        Serial.println("[SENSORS] ❌ BMP280 not found! Check wiring:");
        Serial.println("          - VCC → 3.3V");
        Serial.println("          - GND → GND");
        Serial.println("          - SCL → GPIO 22");
        Serial.println("          - SDA → GPIO 21");
        Serial.println("          - SDO → GND (for address 0x76)");
    }

    // -------------------------------------------------------------------------
    // Initialize MPU6050 — Inertial Measurement Unit
    // -------------------------------------------------------------------------
    Serial.print("[SENSORS] Looking for MPU6050 at 0x");
    Serial.print(MPU6050_I2C_ADDRESS, HEX);
    Serial.println("...");

    mpu.initialize();

    if (mpu.testConnection()) {
        mpuInitialized = true;
        Serial.println("[SENSORS] ✅ MPU6050 found and initialized!");

        // Configure MPU6050 ranges:
        // Accelerometer: ±8g (good range for rocket flights)
        //   0 = ±2g, 1 = ±4g, 2 = ±8g, 3 = ±16g
        mpu.setFullScaleAccelRange(MPU6050_ACCEL_FS_8);

        // Gyroscope: ±500°/s (captures fast rotations)
        //   0 = ±250°/s, 1 = ±500°/s, 2 = ±1000°/s, 3 = ±2000°/s
        mpu.setFullScaleGyroRange(MPU6050_GYRO_FS_500);

        // Digital Low Pass Filter: ~44 Hz bandwidth
        // Reduces high-frequency vibration noise
        mpu.setDLPFMode(MPU6050_DLPF_BW_44);

    } else {
        Serial.println("[SENSORS] ❌ MPU6050 not found! Check wiring:");
        Serial.println("          - VCC → 3.3V");
        Serial.println("          - GND → GND");
        Serial.println("          - SCL → GPIO 22");
        Serial.println("          - SDA → GPIO 21");
        Serial.println("          - AD0 → GND (for address 0x68)");
    }

    // -------------------------------------------------------------------------
    // Initialize Battery ADC
    // -------------------------------------------------------------------------
    // Configure the ADC pin for reading
    analogReadResolution(12);           // 12-bit resolution (0-4095)
    analogSetAttenuation(ADC_11db);     // Full 0-3.3V range
    pinMode(PIN_BATTERY_ADC, INPUT);

    // Take a few initial readings to fill the smoothing buffer
    for (int i = 0; i < BATTERY_SAMPLES; i++) {
        batteryReadings[i] = readBatteryVoltageRaw();
        delay(10);
    }
    batteryBufferFull = true;
    Serial.println("[SENSORS] ✅ Battery ADC initialized on GPIO " + String(PIN_BATTERY_ADC));

    // -------------------------------------------------------------------------
    // Summary
    // -------------------------------------------------------------------------
    Serial.println("[SENSORS] ──────────────────────────────");
    Serial.println("[SENSORS] Initialization complete:");
    Serial.println("[SENSORS]   BMP280:  " + String(bmpInitialized ? "OK ✅" : "FAILED ❌"));
    Serial.println("[SENSORS]   MPU6050: " + String(mpuInitialized ? "OK ✅" : "FAILED ❌"));
    Serial.println("[SENSORS]   Battery: OK ✅");
    Serial.println("[SENSORS] ──────────────────────────────");

    // Return true if at least one sensor works
    return (bmpInitialized || mpuInitialized);
}

void sensorsRead() {
    // -------------------------------------------------------------------------
    // Read BMP280
    // -------------------------------------------------------------------------
    if (bmpInitialized) {
        currentBaro.temperature = bmp.readTemperature();    // °C
        currentBaro.pressure    = bmp.readPressure() / 100.0; // Pa → hPa
        currentBaro.altitude    = bmp.readAltitude(seaLevelPressure); // meters
        currentBaro.valid       = true;

        // Sanity check — BMP280 returns weird values if disconnected
        if (isnan(currentBaro.temperature) || isnan(currentBaro.pressure) ||
            currentBaro.pressure < 100 || currentBaro.pressure > 1200) {
            currentBaro.valid = false;
        }
    }

    // -------------------------------------------------------------------------
    // Read MPU6050
    // -------------------------------------------------------------------------
    if (mpuInitialized) {
        int16_t ax, ay, az, gx, gy, gz;
        mpu.getMotion6(&ax, &ay, &az, &gx, &gy, &gz);

        // Convert raw accelerometer values to m/s²
        // Raw range for ±8g: -32768 to +32767 maps to -8g to +8g
        // 1g = 9.81 m/s²
        float accelScale = 9.81 / 4096.0;  // 4096 LSB/g for ±8g range
        currentIMU.accelX = ax * accelScale;
        currentIMU.accelY = ay * accelScale;
        currentIMU.accelZ = az * accelScale;

        // Convert raw gyroscope values to °/s
        // Raw range for ±500°/s: -32768 to +32767 maps to -500 to +500°/s
        float gyroScale = 1.0 / 65.5;  // 65.5 LSB/(°/s) for ±500°/s range
        currentIMU.gyroX = gx * gyroScale;
        currentIMU.gyroY = gy * gyroScale;
        currentIMU.gyroZ = gz * gyroScale;

        // MPU6050 has no magnetometer — set to zero
        // (Replace with actual readings if using ICM20948)
        currentIMU.magX = 0.0;
        currentIMU.magY = 0.0;
        currentIMU.magZ = 0.0;

        // Calculate acceleration magnitude (for launch detection)
        // |a| = sqrt(ax² + ay² + az²)
        currentIMU.accelMagnitude = sqrt(
            currentIMU.accelX * currentIMU.accelX +
            currentIMU.accelY * currentIMU.accelY +
            currentIMU.accelZ * currentIMU.accelZ
        );

        currentIMU.valid = true;
    }

    // -------------------------------------------------------------------------
    // Read Battery Voltage
    // -------------------------------------------------------------------------
    float rawVoltage = readBatteryVoltageRaw();
    float smoothedVoltage = smoothBatteryVoltage(rawVoltage);

    currentBattery.voltage    = smoothedVoltage;
    currentBattery.percentage = voltageToPercentage(smoothedVoltage);
    currentBattery.valid      = true;
}

BaroData getBaroData() {
    return currentBaro;
}

IMUData getIMUData() {
    return currentIMU;
}

BatteryData getBatteryData() {
    return currentBattery;
}

void setSeaLevelPressure(float pressureHPa) {
    seaLevelPressure = pressureHPa;
    Serial.println("[SENSORS] Sea-level pressure set to " + String(pressureHPa) + " hPa");
}
