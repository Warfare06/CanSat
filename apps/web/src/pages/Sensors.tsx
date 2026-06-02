import { useState, useEffect, useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import * as echarts from 'echarts/core';
import { LineChart } from 'echarts/charts';
import { GridComponent, TooltipComponent, LegendComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import './Sensors.css';

echarts.use([LineChart, GridComponent, TooltipComponent, LegendComponent, CanvasRenderer]);

interface SensorConfig {
  id: string;
  title: string;
  unit: string;
  color: string;
  generateValue: (t: number, prev: number) => number;
  initial: number;
  axes?: string[];
}

const sensors: SensorConfig[] = [
  {
    id: 'pressure', title: 'Pressure', unit: 'hPa', color: '#00d4ff',
    generateValue: (_, prev) => prev + (Math.random() - 0.5) * 2,
    initial: 1013.2,
  },
  {
    id: 'temperature', title: 'Temperature', unit: '°C', color: '#ff8c00',
    generateValue: (_, prev) => prev + (Math.random() - 0.5) * 0.4,
    initial: 21.5,
  },
  {
    id: 'acceleration', title: 'Acceleration', unit: 'g', color: '#00ff88',
    generateValue: (_, prev) => prev + (Math.random() - 0.5) * 0.05,
    initial: 0.02, axes: ['X', 'Y', 'Z'],
  },
  {
    id: 'gyroscope', title: 'Gyroscope', unit: '°/s', color: '#ff3366',
    generateValue: (_, prev) => prev + (Math.random() - 0.5) * 1,
    initial: 0.5, axes: ['X', 'Y', 'Z'],
  },
  {
    id: 'magnetometer', title: 'Magnetometer', unit: 'µT', color: '#aa66ff',
    generateValue: (_, prev) => prev + (Math.random() - 0.5) * 2,
    initial: 23.5,
  },
];

function SensorChart({ sensor }: { sensor: SensorConfig }) {
  const [data, setData] = useState<number[][]>([]);
  const [axisData, setAxisData] = useState<number[][][]>([[], [], []]);

  useEffect(() => {
    // Generate initial data
    let val = sensor.initial;
    const initial: number[][] = [];
    for (let i = 0; i < 60; i++) {
      val = sensor.generateValue(i, val);
      initial.push([i, +val.toFixed(3)]);
    }
    setData(initial);

    if (sensor.axes) {
      const initAxes = sensor.axes.map(() => {
        const d: number[][] = [];
        let v = sensor.initial;
        for (let i = 0; i < 60; i++) {
          v = sensor.generateValue(i, v);
          d.push([i, +v.toFixed(3)]);
        }
        return d;
      });
      setAxisData(initAxes);
    }

    let tick = 60;
    const interval = setInterval(() => {
      tick++;
      if (sensor.axes) {
        setAxisData(prev => prev.map(axData => {
          const last = axData[axData.length - 1]?.[1] ?? sensor.initial;
          const newVal = sensor.generateValue(tick, last);
          return [...axData.slice(-100), [tick, +newVal.toFixed(3)]];
        }));
      } else {
        setData(prev => {
          const last = prev[prev.length - 1]?.[1] ?? sensor.initial;
          const newVal = sensor.generateValue(tick, last);
          return [...prev.slice(-100), [tick, +newVal.toFixed(3)]];
        });
      }
    }, 500);

    return () => clearInterval(interval);
  }, [sensor]);

  const option = useMemo(() => {
    const axisColors = ['#00d4ff', '#ff8c00', '#00ff88'];
    const series = sensor.axes
      ? sensor.axes.map((axis, i) => ({
          name: `${axis} Axis`,
          type: 'line' as const,
          smooth: true,
          symbol: 'none',
          lineStyle: { color: axisColors[i], width: 1.5 },
          data: axisData[i],
        }))
      : [{
          name: sensor.title,
          type: 'line' as const,
          smooth: true,
          symbol: 'none',
          lineStyle: { color: sensor.color, width: 2 },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: sensor.color + '30' },
              { offset: 1, color: sensor.color + '00' },
            ]),
          },
          data,
        }];

    return {
      backgroundColor: 'transparent',
      grid: { top: 10, right: 12, bottom: 24, left: 45 },
      tooltip: {
        trigger: 'axis' as const,
        backgroundColor: 'rgba(10, 14, 26, 0.9)',
        borderColor: 'rgba(0, 212, 255, 0.2)',
        textStyle: { color: '#e0e6ed', fontFamily: 'Space Grotesk', fontSize: 10 },
      },
      legend: sensor.axes ? {
        data: sensor.axes.map(a => `${a} Axis`),
        textStyle: { color: '#7a8599', fontFamily: 'Orbitron', fontSize: 8 },
        top: 0,
        right: 0,
      } : undefined,
      xAxis: {
        type: 'value' as const,
        axisLine: { lineStyle: { color: 'rgba(255,255,255,0.06)' } },
        axisLabel: { color: '#4a5568', fontFamily: 'JetBrains Mono', fontSize: 8 },
        splitLine: { lineStyle: { color: 'rgba(255,255,255,0.03)' } },
      },
      yAxis: {
        type: 'value' as const,
        axisLine: { lineStyle: { color: 'rgba(255,255,255,0.06)' } },
        axisLabel: { color: '#4a5568', fontFamily: 'JetBrains Mono', fontSize: 8 },
        splitLine: { lineStyle: { color: 'rgba(255,255,255,0.03)' } },
      },
      series,
      animation: true,
      animationDuration: 200,
    };
  }, [data, axisData, sensor]);

  return (
    <ReactECharts
      option={option}
      style={{ height: '100%', width: '100%' }}
      opts={{ renderer: 'canvas' }}
      notMerge={false}
      lazyUpdate={true}
    />
  );
}

export default function Sensors() {
  return (
    <div className="sensors-page page-container">
      <section className="sensors-hero">
        <h1 className="section-title">
          Sensor Suite & <span className="text-primary">Instrumentation</span>
        </h1>
        <p className="section-desc">
          Real-time telemetry from our multi-sensor array. Each sensor is sampled at 10Hz 
          with onboard calibration and Kalman filtering for maximum data fidelity.
        </p>
      </section>

      {/* Sensor Charts Grid */}
      <section className="sensor-charts-grid">
        {sensors.map((sensor) => (
          <div key={sensor.id} className="card sensor-chart-card" id={`sensor-${sensor.id}`}>
            <div className="card-header">
              <div>
                <div className="card-title" style={{ color: sensor.color }}>{sensor.title} ({sensor.unit})</div>
              </div>
              <div className="sensor-live-dot">
                <span className="status-dot status-dot--live" />
              </div>
            </div>
            <div className="sensor-chart-container">
              <SensorChart sensor={sensor} />
            </div>
          </div>
        ))}
      </section>

      {/* Methodology */}
      <section className="sensor-methodology">
        <div className="grid-2">
          <div className="card">
            <h3 className="card-subtitle" style={{ marginBottom: 16 }}>Sensor Fusion Methodology</h3>
            <p className="methodology-text">
              Extended Kalman Filter (EKF) combines accelerometer, gyroscope, and magnetometer 
              data for accurate attitude estimation. GPS-aided altitude correction compensates 
              for barometric drift during rapid pressure changes.
            </p>
            <ul className="tech-list" style={{ marginTop: 16 }}>
              <li>9-DOF IMU fusion at 100Hz internal rate</li>
              <li>Complementary filter for orientation backup</li>
              <li>Adaptive noise estimation per flight phase</li>
              <li>Automatic sensor fault detection</li>
            </ul>
          </div>
          <div className="card">
            <h3 className="card-subtitle" style={{ marginBottom: 16 }}>Calibration Protocols</h3>
            <p className="methodology-text">
              All sensors undergo multi-point calibration before each flight. Calibration data 
              is stored in non-volatile memory and applied in real-time during data acquisition.
            </p>
            <ul className="tech-list" style={{ marginTop: 16 }}>
              <li>Barometric: 3-point pressure reference calibration</li>
              <li>Temperature: Ice/boiling water verification</li>
              <li>IMU: 6-position static calibration + mag hard/soft iron</li>
              <li>GPS: SBAS/WAAS differential correction when available</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
