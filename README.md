# 🎮 Game Device API Documentation

Interactive web-based documentation for the HugeWins crash game device integration. Complete REST API and Socket.IO event reference with real-time examples, payload structures, and implementation guides for multi-mouse gaming terminals.

## Features

- 📡 **REST API Reference** - Complete HTTP endpoint documentation with JWT authentication
- 🔌 **Socket.IO Events** - Real-time WebSocket event documentation for game state management
- 🎯 **Device Lifecycle Flow** - Step-by-step integration guide from activation to gameplay
- 📱 **Mobile Responsive** - Optimized for all screen sizes with sticky navigation
- 🎨 **Beautiful UI** - Gradient design with dark theme
- 💻 **Code Examples** - Live examples for every endpoint and event

## PushVault Provider Games

- Game Catalogue tab documents Aviator, Pilot, Chicken Crash, and Spank.
- Catalogue requests require both X-Api-Key and X-Api-Secret.
- Catalogue and launch requests must be made from a trusted backend.
- Real-money and demo launches use the same token exchange.
- Demo passes isDemo: true in the server-to-server request.
- Currency and demo state are carried in the signed JWT, not iframe query parameters.
- Never expose the partner API secret in browser or mobile code.

## Tech Stack

- React 18
- Vite
- Tailwind CSS v4

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

## Network Access

The dev server is configured to listen on all network interfaces (`0.0.0.0`), allowing you to access the documentation from other devices on your local network:

```
Local:   http://localhost:5173/
Network: http://192.168.x.x:5173/
```

## Documentation Structure

### REST API Tab
- Request Activation Code
- Login Device (JWT authentication)
- Get Device Info
- Add/Remove Mouse
- Logout Device

### Socket Events Tab
- Device connection flow
- Game loop events (betting, flight, crash)
- Jackpot system (3-tier)
- Balance updates
- Mouse management events

## Production Server

**Base URL:** `https://server.pushvault.shop`

**Authentication:** Bearer Token (JWT)

## License

© 2026 PushVault Gaming Platform. All rights reserved.
