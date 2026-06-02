import './TheCanSat.css';

const specs = [
  { icon: '⚖', label: 'Mass Budget', value: '350g', desc: 'Total payload mass within CanSat competition limit' },
  { icon: '⚡', label: 'Power', value: '250mW', desc: 'Average power consumption during mission' },
  { icon: '🔋', label: 'Battery', value: '3.7V Li-Po', desc: '1000mAh capacity, >2hr operational life' },
  { icon: '📡', label: 'Telemetry', value: '915MHz', desc: 'LoRa + 4G LTE backup data link' },
];

const components = [
  { name: 'Avionics Bay', desc: 'Houses the ESP32 MCU, IMU, and barometric pressure sensor. Central processing unit for all flight data.', color: '#00d4ff' },
  { name: 'Primary Battery Pack', desc: '3.7V 1000mAh Li-Po battery with voltage regulator and protection circuit.', color: '#ff8c00' },
  { name: 'Payload Module', desc: 'Custom sensor array including BMP280, MPU6050, and NEO-6M GPS. Modular design for easy swapping.', color: '#00ff88' },
  { name: 'Antenna Module', desc: '915MHz LoRa antenna with SMA connector. Omnidirectional pattern for reliable descent communication.', color: '#ff3366' },
  { name: 'Parachute Vacuum Hull', desc: 'Deployable parachute system with servo-actuated release mechanism. Descent rate: 2.5 m/s.', color: '#aa66ff' },
  { name: 'Structural Shell', desc: 'Fiberglass composite outer shell. 66mm diameter × 115mm height. Impact resistant to 15g.', color: '#ffaa00' },
];

export default function TheCanSat() {
  return (
    <div className="cansat-page page-container">
      {/* Hero */}
      <section className="cansat-hero">
        <h1 className="section-title">
          The CanSat Unit: <span className="text-primary">Design & Structure</span>
        </h1>
        <p className="section-desc">
          The CanSat unit represents the culmination of advanced miniature satellite technology, 
          high-fidelity sensing, and micro-manufacturing processes. Our design prioritizes 
          reliability, modularity, and data quality within the competition's 350g mass constraint.
        </p>
      </section>

      {/* Specs Cards */}
      <section className="cansat-specs">
        <div className="grid-4">
          {specs.map((s) => (
            <div key={s.label} className="card spec-card">
              <div className="spec-icon">{s.icon}</div>
              <div className="spec-value">{s.value}</div>
              <div className="spec-label">{s.label}</div>
              <p className="spec-desc">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Components Breakdown */}
      <section className="cansat-components">
        <h2 className="section-title text-center">
          Component <span className="text-primary">Breakdown</span>
        </h2>
        <div className="components-grid">
          {components.map((c, i) => (
            <div key={c.name} className="card component-card" style={{ animationDelay: `${i * 0.1}s` }}>
              <div className="component-indicator" style={{ background: c.color }} />
              <h3 className="component-name" style={{ color: c.color }}>{c.name}</h3>
              <p className="component-desc">{c.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Manufacturing Process */}
      <section className="cansat-process">
        <h2 className="section-title text-center">
          Manufacturing <span className="text-secondary-accent">Process</span>
        </h2>
        <div className="process-timeline">
          {[
            { step: '01', title: 'CAD Design', desc: 'Parametric modeling in SolidWorks with FEA stress analysis' },
            { step: '02', title: '3D Prototyping', desc: 'Rapid prototyping using SLA resin printing for fit testing' },
            { step: '03', title: 'PCB Layout', desc: 'Custom 4-layer PCB designed in KiCad with EMI shielding' },
            { step: '04', title: 'Assembly', desc: 'Hand-assembled in cleanroom conditions with conformal coating' },
            { step: '05', title: 'Integration', desc: 'Full system integration testing with vibration and thermal cycling' },
            { step: '06', title: 'Qualification', desc: 'Drop tests, spin balance, and radio range verification' },
          ].map((p) => (
            <div key={p.step} className="process-step">
              <div className="process-number">{p.step}</div>
              <div className="process-content">
                <h4 className="process-title">{p.title}</h4>
                <p className="process-desc">{p.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
