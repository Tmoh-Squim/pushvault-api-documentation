import SocketEventCard from './SocketEventCard'

function PartnerSocketSection() {
  const partnerSocketFlow = [
    {
      event: 'joinPartnerRoom',
      direction: 'emit',
      description: 'Join the partner cashier dashboard realtime room for one exact station using a backend-issued socket token.',
      payload: { token: 'string' },
      example: `const socket = io("https://server.pushvault.shop", {
  transports: ["websocket", "polling"],
  withCredentials: true,
});

socket.on("connect", () => {
  socket.emit("joinPartnerRoom", {
    token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  });
});`,
      serverResponse: 'partner:connected or partner:error',
      responseData: 'partner:connected includes the bound partner + station scope for this cashier session',
      notes: [
        'The token must come from POST /api/v1/partner/socket-token',
        'The token is already locked to one stationRef',
        'Do not expose the partner API key in the browser'
      ]
    },
    {
      event: 'partner:connected',
      direction: 'listen',
      description: 'Confirms that the cashier dashboard socket is bound to the expected partner station.',
      payload: {
        partnerId: 'string',
        partnerCode: 'string',
        partnerName: 'string',
        stationId: 'string',
        stationRef: 'string',
        stationName: 'string',
        cashierRef: 'string | null',
        message: 'string'
      },
      emittedBy: 'Server (after successful joinPartnerRoom)',
      example: `socket.on("partner:connected", (data) => {
  console.log("Realtime ready for station", data.stationRef);
});`,
      notes: [
        'Use this as the ready signal before relying on live dashboard events',
        'If stationRef is wrong, you will receive partner:error instead'
      ]
    },
    {
      event: 'partner:error',
      direction: 'listen',
      description: 'Signals that the partner cashier socket could not be joined or is no longer valid.',
      payload: { message: 'string', reason: 'string (optional)' },
      emittedBy: 'Server',
      example: `socket.on("partner:error", (err) => {
  console.error(err.message);
});`,
      notes: [
        'Returned for invalid or expired tokens',
        'Also returned for suspended or disabled partner accounts',
        'Also returned when the token station scope does not match a partner station'
      ]
    }
  ]

  const cashierListens = [
    {
      event: 'deviceActivated',
      direction: 'listen',
      description: 'A device in this station was activated and is now ready for use.',
      payload: { success: 'boolean', deviceId: 'string', stationName: 'string', stationId: 'string' },
      emittedBy: 'Server',
      example: `socket.on("deviceActivated", (data) => {
  refreshDevices();
});`,
      notes: ['Useful for bringing a newly activated terminal into the cashier device list immediately']
    },
    {
      event: 'deviceDeactivated',
      direction: 'listen',
      description: 'A device in this station was deactivated or removed.',
      payload: { success: 'boolean', deviceId: 'string', message: 'string' },
      emittedBy: 'Server',
      example: `socket.on("deviceDeactivated", (data) => {
  refreshDevices();
});`,
      notes: ['Remove or disable that device in the cashier dashboard immediately']
    },
    {
      event: 'device:update',
      direction: 'listen',
      description: 'A device summary changed, such as activation state or aggregate balance.',
      payload: {
        deviceId: 'string',
        isActivated: 'boolean',
        station: 'object',
        activatedBy: 'object | null',
        balance: 'number',
        timestamp: 'date'
      },
      emittedBy: 'Server',
      example: `socket.on("device:update", (data) => {
  updateDeviceRow(data.deviceId, data);
});`,
      notes: ['Use this to keep device cards or table rows in sync without a full reload']
    },
    {
      event: 'device:online',
      direction: 'listen',
      description: 'A station device came online and connected to the backend.',
      payload: { deviceId: 'string', stationId: 'string' },
      emittedBy: 'Server',
      example: `socket.on("device:online", ({ deviceId }) => {
  markDeviceOnline(deviceId);
});`,
      notes: ['Useful for live online/offline indicators in the cashier dashboard']
    },
    {
      event: 'device:offline',
      direction: 'listen',
      description: 'A station device went offline after the disconnect grace period.',
      payload: { deviceId: 'string', stationId: 'string', allMice: 'boolean' },
      emittedBy: 'Server',
      example: `socket.on("device:offline", ({ deviceId }) => {
  markDeviceOffline(deviceId);
});`,
      notes: ['Fired after the backend confirms the device did not reconnect in time']
    },
    {
      event: 'mouse:connected',
      direction: 'listen',
      description: 'A player mouse/session became active on a device in this station.',
      payload: { deviceId: 'string', mouseId: 'string', activeMiceCount: 'number' },
      emittedBy: 'Server',
      example: `socket.on("mouse:connected", (data) => {
  refreshDevicePlayers(data.deviceId);
});`,
      notes: ['Use to show new active player slots without polling']
    },
    {
      event: 'mouse:disconnected',
      direction: 'listen',
      description: 'A player mouse/session disconnected or all mice were cleared after device offline cleanup.',
      payload: { deviceId: 'string', mouseId: 'string (optional)', activeMiceCount: 'number (optional)', allMice: 'boolean (optional)' },
      emittedBy: 'Server',
      example: `socket.on("mouse:disconnected", (data) => {
  refreshDevicePlayers(data.deviceId);
});`,
      notes: ['If allMice is true, treat the device player list as cleared']
    },
    {
      event: 'deviceInfoUpdate',
      direction: 'listen',
      description: 'The active mice list for a device changed.',
      payload: { deviceId: 'string', mice: 'array', success: 'boolean (optional)', activated: 'boolean (optional)' },
      emittedBy: 'Server',
      example: `socket.on("deviceInfoUpdate", (data) => {
  setDeviceMice(data.deviceId, data.mice);
});`,
      notes: ['This is the main event for keeping the cashier player-slot view accurate']
    },
    {
      event: 'balanceUpdate',
      direction: 'listen',
      description: 'A player balance changed because of deposit or withdrawal.',
      payload: {
        deviceId: 'string',
        mouseId: 'string',
        portId: 'string',
        newBalance: 'number',
        totalDeposited: 'number',
        amount: 'number',
        reason: 'DEPOSIT | WITHDRAWAL'
      },
      emittedBy: 'Server',
      example: `socket.on("balanceUpdate", (data) => {
  updatePlayerBalance(data.deviceId, data.mouseId, data.newBalance);
});`,
      notes: ['Partners receive the same balance event surface their cashier dashboard needs for immediate balance sync']
    },
    {
      event: 'stationBalanceUpdate',
      direction: 'listen',
      description: 'Station financial summary changed for this cashier scope.',
      payload: { newStationBalance: 'number' },
      emittedBy: 'Server',
      example: `socket.on("stationBalanceUpdate", (data) => {
  setStationBalance(data.newStationBalance);
});`,
      notes: ['Use this if your cashier dashboard shows station aggregate totals']
    }
  ]

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border border-emerald-500/30 rounded-lg p-6">
        <h2 className="text-2xl font-bold text-emerald-300 mb-3">Partner Cashier Dashboard Sockets</h2>
        <p className="text-gray-300 mb-4">
          These are the realtime Socket.IO events a partner cashier dashboard uses. This section excludes internal game-engine device events.
        </p>
        <div className="bg-black/30 rounded p-4 font-mono text-sm space-y-2">
          <p className="text-emerald-400">Connection URL: <span className="text-white">https://server.pushvault.shop</span></p>
          <p className="text-emerald-400">Authentication: <span className="text-white">POST /api/v1/partner/socket-token → joinPartnerRoom({`{ token }`})</span></p>
          <p className="text-gray-500 text-xs">Every cashier socket must be bound to one stationRef.</p>
        </div>
      </div>

      <div>
        <div className="flex items-center gap-3 mb-4">
          <div className="h-10 w-1 bg-gradient-to-b from-green-400 to-green-600 rounded"></div>
          <h3 className="text-2xl font-bold text-green-400">Join Flow</h3>
        </div>
        <div className="space-y-4">
          {partnerSocketFlow.map((event, index) => (
            <SocketEventCard key={`flow-${index}`} {...event} />
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center gap-3 mb-4">
          <div className="h-10 w-1 bg-gradient-to-b from-purple-400 to-pink-600 rounded"></div>
          <h3 className="text-2xl font-bold text-purple-400">Events Received By Cashier Dashboard</h3>
        </div>
        <div className="space-y-4">
          {cashierListens.map((event, index) => (
            <SocketEventCard key={`listen-${index}`} {...event} />
          ))}
        </div>
      </div>
    </div>
  )
}

export default PartnerSocketSection
