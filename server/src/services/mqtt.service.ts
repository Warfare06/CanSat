// ============================================
// CanSat Astra Maven — MQTT Service (HiveMQ Cloud)
// ============================================

import mqtt from 'mqtt';
import type { MqttClient } from 'mqtt';
import type { TelemetryPacket } from '@cansat/shared';
import { config } from '../config/index.js';
import { prisma } from '../config/database.js';
import { telemetryService } from './telemetry.service.js';
import { socketService } from './socket.service.js';

let client: MqttClient | null = null;

class MqttService {
  /**
   * Connect to the MQTT broker and subscribe to telemetry topics.
   */
  async connect(): Promise<void> {
    if (!config.mqtt.brokerUrl || !config.mqtt.username) {
      console.warn('[MQTT] No broker configured — skipping MQTT connection');
      return;
    }

    try {
      client = mqtt.connect(config.mqtt.brokerUrl, {
        port: config.mqtt.port,
        username: config.mqtt.username,
        password: config.mqtt.password,
        protocol: config.mqtt.brokerUrl.startsWith('mqtts') ? 'mqtts' : 'mqtt',
        rejectUnauthorized: true,
        reconnectPeriod: 5000,
        connectTimeout: 30000,
        clientId: `cansat-server-${Date.now()}`,
      });

      client.on('connect', () => {
        console.log('[MQTT] Connected to broker');
        this.subscribeToTopics();
      });

      client.on('message', (topic, payload) => {
        void this.handleMessage(topic, payload);
      });

      client.on('error', (err) => {
        console.error('[MQTT] Connection error:', err.message);
      });

      client.on('reconnect', () => {
        console.log('[MQTT] Reconnecting to broker...');
      });

      client.on('close', () => {
        console.log('[MQTT] Connection closed');
      });
    } catch (err) {
      console.error('[MQTT] Failed to connect:', err);
    }
  }

  /**
   * Subscribe to all CanSat telemetry topics (wildcard).
   */
  private subscribeToTopics(): void {
    if (!client) return;

    // Subscribe to all device telemetry: cansat/+/telemetry
    client.subscribe('cansat/+/telemetry', { qos: 1 }, (err) => {
      if (err) {
        console.error('[MQTT] Subscription error:', err);
      } else {
        console.log('[MQTT] Subscribed to cansat/+/telemetry');
      }
    });

    // Subscribe to status updates
    client.subscribe('cansat/+/status', { qos: 1 }, (err) => {
      if (err) {
        console.error('[MQTT] Status subscription error:', err);
      } else {
        console.log('[MQTT] Subscribed to cansat/+/status');
      }
    });
  }

  /**
   * Handle incoming MQTT messages.
   */
  private async handleMessage(topic: string, payload: Buffer): Promise<void> {
    try {
      const parts = topic.split('/');
      // topic format: cansat/{deviceId}/{type}
      if (parts.length !== 3 || parts[0] !== 'cansat') return;

      const deviceId = parts[1];
      const messageType = parts[2];

      if (messageType === 'telemetry') {
        await this.handleTelemetry(deviceId, payload);
      } else if (messageType === 'status') {
        await this.handleStatus(deviceId, payload);
      }
    } catch (err) {
      console.error('[MQTT] Message processing error:', err);
    }
  }

  /**
   * Process an incoming telemetry packet from a device.
   */
  private async handleTelemetry(deviceId: string, payload: Buffer): Promise<void> {
    const packet: TelemetryPacket = JSON.parse(payload.toString());
    packet.deviceId = deviceId; // ensure deviceId is set

    // Find the active mission for this device
    const mission = await prisma.mission.findFirst({
      where: {
        deviceId,
        status: {
          in: ['PRE_LAUNCH', 'ASCENDING', 'APOGEE', 'DESCENDING'],
        },
      },
    });

    if (!mission) {
      console.warn(`[MQTT] No active mission for device ${deviceId}`);
      return;
    }

    // Enqueue for batch database insert
    telemetryService.enqueue(mission.id, packet);

    // Broadcast in real-time via Socket.IO
    socketService.broadcastTelemetry(mission.id, packet);
    socketService.broadcastGPS(mission.id, packet.gps);
  }

  /**
   * Handle device status messages.
   */
  private async handleStatus(deviceId: string, payload: Buffer): Promise<void> {
    const data = JSON.parse(payload.toString());
    const connected = data.connected === true;
    socketService.broadcastConnectionStatus(deviceId, connected);
  }

  /**
   * Publish a command to a device.
   */
  publish(deviceId: string, command: string, data: unknown = {}): void {
    if (!client) {
      console.warn('[MQTT] Client not connected — cannot publish');
      return;
    }

    const topic = `cansat/${deviceId}/command`;
    client.publish(topic, JSON.stringify({ command, ...data as object }), { qos: 1 });
    console.log(`[MQTT] Published command "${command}" to ${topic}`);
  }

  /**
   * Disconnect from the MQTT broker.
   */
  async disconnect(): Promise<void> {
    if (client) {
      client.end(true);
      client = null;
      console.log('[MQTT] Disconnected from broker');
    }
  }

  /**
   * Check if MQTT is connected.
   */
  isConnected(): boolean {
    return client?.connected ?? false;
  }
}

export const mqttService = new MqttService();
