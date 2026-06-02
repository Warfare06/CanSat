#include <Arduino.h>
#include <Wire.h>
#include "config.h"
#include "sensors.h"
#include "gps_handler.h"
#include "mqtt_handler.h"
#include "state_machine.h"

// Task handles for FreeRTOS
TaskHandle_t SensorTask;
TaskHandle_t MqttTask;

// Core 0: WiFi/MQTT handling
// Core 1: Sensor reading and state machine

void sensorTaskFunction(void *pvParameters) {
  TickType_t xLastWakeTime = xTaskGetTickCount();
  const TickType_t xFrequency = pdMS_TO_TICKS(TELEMETRY_INTERVAL_MS);

  for (;;) {
    // 1. Read sensors
    Sensors::readAll();
    GpsHandler::update();
    
    // 2. Update state machine
    StateMachine::update();
    
    // 3. Queue telemetry for MQTT task
    if (StateMachine::getCurrentState() != StateMachine::PRE_LAUNCH) {
      MqttHandler::queueTelemetry(
        Sensors::getTelemetry(),
        GpsHandler::getData(),
        StateMachine::getCurrentStateString()
      );
    }
    
    // Wait for next cycle
    vTaskDelayUntil(&xLastWakeTime, xFrequency);
  }
}

void mqttTaskFunction(void *pvParameters) {
  for (;;) {
    MqttHandler::loop();
    vTaskDelay(pdMS_TO_TICKS(10)); // Yield to watchdog
  }
}

void setup() {
  Serial.begin(115200);
  Serial.println("\n\n--- CanSat Astra Maven: Flight Computer ---");

  // Initialize status LED
  pinMode(PIN_STATUS_LED, OUTPUT);
  digitalWrite(PIN_STATUS_LED, HIGH); // Turn on during init

  // Initialize I2C
  Wire.begin(PIN_I2C_SDA, PIN_I2C_SCL);
  Wire.setClock(400000); // 400kHz fast mode

  // Initialize subsystems
  if (!Sensors::begin()) {
    Serial.println("CRITICAL: Sensor initialization failed!");
    // Blink SOS
    while (1) {
      digitalWrite(PIN_STATUS_LED, !digitalRead(PIN_STATUS_LED));
      delay(100);
    }
  }

  GpsHandler::begin();
  StateMachine::begin();
  MqttHandler::begin();

  // Create FreeRTOS tasks
  xTaskCreatePinnedToCore(
    sensorTaskFunction,   // Function
    "SensorTask",         // Name
    8192,                 // Stack size
    NULL,                 // Parameters
    2,                    // Priority (high)
    &SensorTask,          // Handle
    1                     // Core 1
  );

  xTaskCreatePinnedToCore(
    mqttTaskFunction,     // Function
    "MqttTask",           // Name
    16384,                // Stack size
    NULL,                 // Parameters
    1,                    // Priority (lower)
    &MqttTask,            // Handle
    0                     // Core 0
  );

  digitalWrite(PIN_STATUS_LED, LOW); // Turn off after init
  Serial.println("Initialization complete. RTOS Scheduler started.");
}

void loop() {
  // Empty - Everything is handled by FreeRTOS tasks
  vTaskDelete(NULL);
}
