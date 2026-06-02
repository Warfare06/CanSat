import { useState, useEffect, useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import * as echarts from 'echarts/core';
import { LineChart } from 'echarts/charts';
import {
  GridComponent,
  TooltipComponent,
  DataZoomComponent,
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';

echarts.use([LineChart, GridComponent, TooltipComponent, DataZoomComponent, CanvasRenderer]);

interface DataPoint {
  time: number;
  altitude: number;
}

export default function TrajectoryChart() {
  const [data, setData] = useState<DataPoint[]>([]);

  useEffect(() => {
    // Generate initial mock descent data
    const initial: DataPoint[] = [];
    for (let i = 0; i <= 300; i++) {
      const t = i * 2; // seconds
      // Simulate ascent then descent profile
      let alt: number;
      if (t < 120) {
        // Ascent phase - parabolic rise
        alt = (1000 / (120 * 120)) * t * t + Math.random() * 10;
      } else if (t < 180) {
        // Near apogee
        const dt = t - 120;
        alt = 1000 - (dt * dt * 0.1) + Math.random() * 8;
      } else {
        // Descent with parachute - slower descent
        const dt = t - 180;
        alt = Math.max(0, 1000 - 0.1 * (180 - 120) * (180 - 120) - dt * 2.5 + Math.random() * 5);
      }
      initial.push({ time: t, altitude: Math.max(0, alt) });
    }
    setData(initial);

    // Simulate live data additions
    let elapsed = 600;
    const interval = setInterval(() => {
      elapsed += 2;
      const alt = Math.max(0, 100 + Math.random() * 20 - (elapsed - 600) * 0.3);
      setData((prev) => {
        const updated = [...prev, { time: elapsed, altitude: Math.max(0, alt) }];
        return updated.slice(-400);
      });
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const option = useMemo(
    () => ({
      backgroundColor: 'transparent',
      grid: {
        top: 12,
        right: 16,
        bottom: 30,
        left: 50,
      },
      tooltip: {
        trigger: 'axis' as const,
        backgroundColor: 'rgba(10, 14, 26, 0.9)',
        borderColor: 'rgba(0, 212, 255, 0.2)',
        textStyle: {
          color: '#e0e6ed',
          fontFamily: 'Space Grotesk',
          fontSize: 11,
        },
        formatter: (params: any) => {
          const p = params[0];
          return `<span style="color:#7a8599">Time:</span> ${p.data[0]}s<br/><span style="color:#00d4ff">Alt:</span> ${p.data[1].toFixed(1)}m`;
        },
      },
      xAxis: {
        type: 'value' as const,
        name: 'Time (seconds)',
        nameTextStyle: {
          color: '#4a5568',
          fontFamily: 'Orbitron',
          fontSize: 8,
          padding: [8, 0, 0, 0],
        },
        axisLine: { lineStyle: { color: 'rgba(255,255,255,0.08)' } },
        axisLabel: {
          color: '#4a5568',
          fontFamily: 'JetBrains Mono',
          fontSize: 9,
        },
        splitLine: { lineStyle: { color: 'rgba(255,255,255,0.03)' } },
      },
      yAxis: {
        type: 'value' as const,
        name: 'Altitude (m)',
        nameTextStyle: {
          color: '#4a5568',
          fontFamily: 'Orbitron',
          fontSize: 8,
        },
        axisLine: { lineStyle: { color: 'rgba(255,255,255,0.08)' } },
        axisLabel: {
          color: '#4a5568',
          fontFamily: 'JetBrains Mono',
          fontSize: 9,
        },
        splitLine: { lineStyle: { color: 'rgba(255,255,255,0.04)' } },
      },
      series: [
        {
          type: 'line',
          smooth: true,
          symbol: 'none',
          lineStyle: {
            color: '#ff8c00',
            width: 2,
          },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(255, 140, 0, 0.25)' },
              { offset: 0.5, color: 'rgba(255, 140, 0, 0.08)' },
              { offset: 1, color: 'rgba(255, 140, 0, 0)' },
            ]),
          },
          data: data.map((d) => [d.time, d.altitude]),
        },
      ],
      animation: true,
      animationDuration: 300,
    }),
    [data]
  );

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
