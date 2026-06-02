import './Technology.css';

const flightComputer = [
  { label: 'CPU', value: 'ESP32-S3' },
  { label: 'IMU', value: 'MPU6050' },
  { label: 'BARO', value: 'BMP280' },
  { label: 'GPS', value: 'NEO-6M' },
  { label: 'MCU', value: 'STM32F4' },
  { label: 'Memory', value: '8MB Flash' },
];

const powerSystem = [
  { label: 'Battery', value: '3.7V Li-Po 1000mAh' },
  { label: 'Regulator', value: 'Buck/Boost 3.3V' },
  { label: 'Protection', value: 'Over-current + Undervoltage' },
  { label: 'Monitoring', value: 'INA219 Current Sensor' },
];

const commSuite = [
  { label: 'Primary', value: '915MHz LoRa (SX1276)' },
  { label: 'Backup', value: '4G LTE IoT Module' },
  { label: 'Protocol', value: 'MQTT over TLS' },
  { label: 'Data Rate', value: '10 Hz telemetry' },
  { label: 'Range', value: '> 5km line-of-sight' },
];

export default function Technology() {
  return (
    <div className="tech-page page-container">
      <section className="tech-hero">
        <h1 className="section-title">
          Systems Architecture & <span className="text-primary">Communication</span>
        </h1>
        <p className="section-desc">
          Our CanSat integrates cutting-edge embedded systems with robust communication 
          protocols to ensure reliable data acquisition and real-time telemetry during all 
          mission phases.
        </p>
      </section>

      {/* Architecture Diagrams */}
      <section className="tech-diagrams">
        <div className="grid-3">
          {/* Flight Computer */}
          <div className="card tech-card">
            <div className="card-header">
              <div>
                <div className="card-title">FLIGHT COMPUTER</div>
                <div className="card-subtitle">System Architecture</div>
              </div>
              <span className="card-icon" style={{ color: '#00d4ff' }}>🖥</span>
            </div>
            <div className="tech-diagram-box">
              <div className="diagram-node diagram-node--central">
                <span>CPU</span>
                <small>ESP32-S3</small>
              </div>
              <div className="diagram-peripherals">
                {flightComputer.slice(1).map((item) => (
                  <div key={item.label} className="diagram-node diagram-node--peripheral">
                    <span>{item.label}</span>
                    <small>{item.value}</small>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Power Management */}
          <div className="card tech-card">
            <div className="card-header">
              <div>
                <div className="card-title">POWER MANAGEMENT</div>
                <div className="card-subtitle">Power System</div>
              </div>
              <span className="card-icon" style={{ color: '#ff8c00' }}>⚡</span>
            </div>
            <div className="tech-specs-list">
              {powerSystem.map((item) => (
                <div key={item.label} className="tech-spec-row">
                  <span className="tech-spec-label">{item.label}</span>
                  <span className="tech-spec-value">{item.value}</span>
                </div>
              ))}
              <div className="power-flow">
                <div className="power-flow-node">Battery</div>
                <div className="power-flow-arrow">→</div>
                <div className="power-flow-node">Regulator</div>
                <div className="power-flow-arrow">→</div>
                <div className="power-flow-node">MCU + Sensors</div>
              </div>
            </div>
          </div>

          {/* Communication */}
          <div className="card tech-card">
            <div className="card-header">
              <div>
                <div className="card-title">COMMUNICATION SUITE</div>
                <div className="card-subtitle">Data Links</div>
              </div>
              <span className="card-icon" style={{ color: '#00ff88' }}>📡</span>
            </div>
            <div className="tech-specs-list">
              {commSuite.map((item) => (
                <div key={item.label} className="tech-spec-row">
                  <span className="tech-spec-label">{item.label}</span>
                  <span className="tech-spec-value">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Data Pipeline */}
      <section className="tech-pipeline">
        <h2 className="section-title text-center">
          Data Handling <span className="text-secondary-accent">Pipeline</span>
        </h2>
        <div className="pipeline-flow">
          {[
            { step: 'Sensor Sampling', detail: '10 Hz multi-sensor acquisition', icon: '📊' },
            { step: 'Data Fusion', detail: 'Kalman filter & calibration', icon: '🔬' },
            { step: 'Packet Assembly', detail: 'JSON serialization with CRC', icon: '📦' },
            { step: 'MQTT Publish', detail: 'QoS 1 over TLS to HiveMQ', icon: '📡' },
            { step: 'Cloud Ingestion', detail: 'Node.js worker batch insert', icon: '☁' },
            { step: 'Dashboard', detail: 'WebSocket broadcast < 200ms', icon: '📱' },
          ].map((p, i) => (
            <div key={p.step} className="pipeline-step">
              <div className="pipeline-icon">{p.icon}</div>
              <div className="pipeline-step-content">
                <h4 className="pipeline-step-title">{p.step}</h4>
                <p className="pipeline-step-detail">{p.detail}</p>
              </div>
              {i < 5 && <div className="pipeline-connector" />}
            </div>
          ))}
        </div>
      </section>

      {/* Firmware & Software */}
      <section className="tech-software">
        <h2 className="section-title text-center">
          Software <span className="text-primary">Stack</span>
        </h2>
        <div className="grid-2" style={{ maxWidth: 800, margin: '0 auto', marginTop: 'var(--space-xl)' }}>
          <div className="card">
            <h3 className="card-subtitle" style={{ marginBottom: 16 }}>Firmware (ESP32)</h3>
            <ul className="tech-list">
              <li>Arduino framework + PlatformIO</li>
              <li>FreeRTOS task scheduling</li>
              <li>PubSubClient (MQTT)</li>
              <li>ArduinoJson serialization</li>
              <li>Flight state machine</li>
              <li>OTA update capability</li>
            </ul>
          </div>
          <div className="card">
            <h3 className="card-subtitle" style={{ marginBottom: 16 }}>Ground Station</h3>
            <ul className="tech-list">
              <li>Node.js + Express + Socket.IO</li>
              <li>PostgreSQL + TimescaleDB</li>
              <li>React + TypeScript dashboard</li>
              <li>ECharts real-time visualization</li>
              <li>JWT authentication (jose)</li>
              <li>Docker containerized deployment</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
