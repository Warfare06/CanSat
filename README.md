# 🛰 CanSat Astra Maven — Mission Control Platform

A full-stack real-time telemetry platform for a miniature satellite (CanSat) mission, featuring a React web dashboard, Node.js backend, React Native Android app, and ESP32 firmware.

![CanSat](https://img.shields.io/badge/CanSat-Astra%20Maven-00d4ff?style=for-the-badge&labelColor=060a14)
![Stack](https://img.shields.io/badge/Stack-React%20%7C%20Node.js%20%7C%20ESP32-ff8c00?style=for-the-badge&labelColor=060a14)
![License](https://img.shields.io/badge/License-MIT-00ff88?style=for-the-badge&labelColor=060a14)

---

## 📋 Overview

Astra Maven is a soda-can-sized satellite (CanSat) with sensors for pressure, temperature, GPS, and accelerometer data. The satellite is launched via rocket or drone and transmits real-time telemetry during descent. This platform provides:

- **Web Dashboard** — Real-time telemetry visualization with 3D model, charts, and gauges
- **Android App** — Companion mobile app for field monitoring
- **Backend Server** — REST API + WebSocket + MQTT data pipeline
- **ESP32 Firmware** — Flight computer and ground station code

## 🏗 Architecture

```
ESP32 (CanSat)            Cloud                        Clients
┌─────────────┐    ┌─────────────────┐    ┌───────────────────────┐
│ BMP280      │    │ HiveMQ Cloud    │    │ React Web Dashboard   │
│ MPU6050     │───▶│ (MQTT Broker)   │───▶│   - 3D CanSat Model   │
│ NEO-6M GPS  │    │                 │    │   - Live Charts        │
│ ESP32-S3    │    └────────┬────────┘    │   - Sensor Gauges      │
└─────────────┘             │             │   - Data Terminal       │
                   ┌────────▼────────┐    ├───────────────────────┤
                   │ Node.js Server  │    │ React Native App      │
                   │   - MQTT Sub    │───▶│   - Live Gauges        │
                   │   - Socket.IO   │    │   - GPS Map            │
                   │   - REST API    │    │   - Mission Status      │
                   │   - JWT Auth    │    │   - Admin Login         │
                   └────────┬────────┘    └───────────────────────┘
                   ┌────────▼────────┐
                   │ PostgreSQL      │
                   │ + TimescaleDB   │
                   │ + Redis Cache   │
                   └─────────────────┘
```

## 📁 Project Structure

```
cansat-astra-maven/
├── apps/
│   ├── web/                    # React web dashboard (Vite + TypeScript)
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   ├── charts/     # SensorGauge, TrajectoryChart
│   │   │   │   ├── dashboard/  # CountdownTimer, DataTerminal
│   │   │   │   ├── layout/     # Navbar, Footer
│   │   │   │   └── three/      # CanSat3D (Three.js wireframe)
│   │   │   └── pages/          # Overview, TheCanSat, Technology, Sensors, Team, Sponsors, Contact
│   │   └── index.html
│   └── mobile/                 # React Native Android app (Expo)
│       ├── app/
│       │   ├── (tabs)/         # Dashboard, Sensors, Map, Status
│       │   └── login.tsx       # Admin auth screen
│       └── src/
│           ├── config/         # API URLs, colors
│           └── store/          # Zustand state management
├── server/                     # Node.js backend (Express + Socket.IO)
│   ├── prisma/                 # Database schema + migrations
│   └── src/
│       ├── config/             # Environment config
│       ├── middleware/         # Auth, rate limiter, error handler
│       ├── routes/             # Auth, missions, telemetry, team, sponsors, contact
│       ├── services/           # MQTT, Socket.IO, auth, telemetry, mock data
│       └── utils/              # Zod validation schemas
├── firmware/                   # ESP32 Arduino code
│   ├── cansat-flight/          # Flight computer firmware
│   ├── ground-station/         # LoRa ground receiver
│   └── README.md               # Wiring diagrams
├── packages/
│   └── shared/                 # Shared TypeScript types
├── docker-compose.yml          # PostgreSQL + Redis + API containers
├── vercel.json                 # Web deployment config
└── package.json                # Root workspace config
```

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- PostgreSQL 16 (or Docker)
- Android Studio (for mobile app)

### 1. Install Dependencies

```bash
cd CanSat
npm install
```

### 2. Start Web Dashboard (Development)

```bash
npm run dev:web
# → http://localhost:5173
```

### 3. Start Backend Server

```bash
# Option A: With Docker (recommended)
docker-compose up -d postgres redis

# Option B: Manual PostgreSQL setup
# Create database 'cansat_db' and update .env

# Then start the server
cd server
cp ../.env.example .env    # Edit with your credentials
npx prisma generate
npx prisma db push
npm run dev
# → http://localhost:3001
```

### 4. Start Mobile App

```bash
npm run dev:mobile
# Scan QR code with Expo Go app on your Android device
```

## 🌐 Web Pages

| Page | Route | Description |
|------|-------|-------------|
| **Overview** | `/` | Dashboard with 3D model, countdown, gauges, trajectory chart, data terminal |
| **The CanSat** | `/the-cansat` | Design specs, component breakdown, manufacturing process |
| **Technology** | `/technology` | Flight computer, power management, communication suite, data pipeline |
| **Sensors** | `/sensors` | 5 live-updating sensor charts with calibration methodology |
| **Team** | `/team` | Team placeholder with recruitment roles |
| **Sponsors** | `/sponsors` | Tiered sponsor grid (Platinum/Gold/Silver/Bronze) |
| **Contact** | `/contact` | Contact form with validation and info cards |

## 📱 Mobile App Screens

| Screen | Description |
|--------|-------------|
| **Dashboard** | SVG circular gauges, mission stats |
| **Sensors** | All sensor readings list with trend indicators |
| **Map** | GPS coordinates + map placeholder |
| **Status** | Mission timeline with phase tracking |
| **Login** | Admin JWT authentication |

## 🔌 API Endpoints

```
GET  /api/health               — Server health check
POST /api/auth/login            — JWT login
POST /api/auth/register         — User registration
POST /api/auth/refresh          — Token rotation
GET  /api/missions              — List missions
POST /api/missions/:id/mock     — Start mock telemetry
GET  /api/telemetry             — Query telemetry data
GET  /api/telemetry/latest/:id  — Latest telemetry packet
GET  /api/telemetry/stats/:id   — Aggregated statistics
GET  /api/team                  — List team members
GET  /api/sponsors              — List sponsors
POST /api/contact               — Submit contact form
```

## ⚡ ESP32 Firmware

See [firmware/README.md](firmware/README.md) for detailed wiring diagrams and setup instructions.

**Flight Computer** — BMP280 + MPU6050 + NEO-6M GPS → MQTT publish to HiveMQ Cloud
**Ground Station** — LoRa receiver → MQTT bridge → Backend

## 🚢 Deployment

### Web (Vercel)
```bash
# Push to GitHub, then:
vercel --prod
```

### Backend (Docker)
```bash
docker-compose up -d
```

## 📄 Environment Variables

Copy `.env.example` to `.env` and configure:

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `REDIS_URL` | Redis connection string |
| `JWT_ACCESS_SECRET` | JWT signing secret |
| `MQTT_BROKER_URL` | HiveMQ Cloud broker URL |
| `MQTT_USERNAME` | MQTT auth username |
| `MQTT_PASSWORD` | MQTT auth password |

## 📜 License

MIT License — Built for the stars. Engineered on Earth. 🌍
