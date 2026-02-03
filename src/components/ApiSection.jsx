import EndpointCard from './EndpointCard'

function ApiSection() {
  const endpoints = [
    {
      title: '1. Request Activation Code',
      method: 'POST',
      path: '/api/v1/device/request-activation',
      description: 'Device requests an activation code from the server',
      headers: { 'Content-Type': 'application/json' },
      request: { deviceId: 'DEVICE_UUID_001' },
      response: {
        success: true,
        message: 'Activation code generated successfully',
        code: '123456'
      },
      notes: [
        'Device generates a unique deviceId (UUID)',
        'Code expires after a set time period',
        'If device is already activated, returns an error',
        'Code is stored in ActivationCode collection'
      ]
    },
    {
      title: '2. Login Device',
      method: 'POST',
      path: '/api/v1/device/login-device',
      description: 'Authenticate device and get fresh JWT token - MUST be called on every app launch',
      headers: { 'Content-Type': 'application/json' },
      request: { deviceId: 'DEVICE_UUID_001' },
      response: {
        success: true,
        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        data: {
          deviceId: 'DEVICE_UUID_001',
          stationName: 'Station Alpha',
          mice: [
            {
              mouseId: '001',
              customName: 'Player 1',
              balance: 1000,
              currency: 'TSh'
            }
          ]
        }
      },
      notes: [
        'IMPORTANT: Call this on EVERY app launch/restart to get fresh token',
        'Device must be activated first (isActivated: true)',
        'Returns new JWT token for authentication',
        'Tokens expire after inactivity - always login on app start',
        'Store token and include in Authorization header for protected endpoints',
        'Returns active mice and their balances',
        'Token format: Bearer <token>'
      ]
    },
    {
      title: '3. Get Device Info',
      method: 'GET',
      path: '/api/v1/device/info',
      description: 'Get current device information including active mice',
      protected: true,
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': 'Bearer <token>'
      },
      response: {
        success: true,
        activated: true,
        mice: [
          {
            mouseId: '001',
            customName: 'Player 1',
            balance: 1500.50,
            active: true
          },
          {
            mouseId: '002',
            customName: 'Player 2',
            balance: 2300.00,
            active: true
          }
        ]
      },
      notes: [
        'Requires JWT token in Authorization header (protectDevice middleware)',
        'Returns only active mice',
        'Mice are sorted by Player number'
      ]
    },
    {
      title: '4. Add Mouse',
      method: 'POST',
      path: '/api/v1/device/add-mouse',
      description: 'Register a new mouse to the device',
      protected: true,
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': 'Bearer <token>'
      },
      request: { mouseId: '003' },
      response: {
        success: true,
        data: {
          mouseId: '003',
          balance: 0,
          customName: 'Player 3',
          active: true,
          lastUsed: '2026-02-03T08:00:00.000Z'
        }
      },
      notes: [
        'Automatically removes mouse from other devices',
        'Preserves balance if mouse was previously on same device',
        'Auto-assigns "Player X" name based on order',
        'Maximum 8 mice per device',
        'IMPORTANT: Listen to "deviceInfoUpdate" socket event to update UI',
        'Do NOT use REST API response data - it may be stale',
        'Socket event contains fresh, accurate mice list'
      ]
    },
    {
      title: '5. Remove Mouse',
      method: 'POST',
      path: '/api/v1/device/remove-mouse',
      description: 'Deactivate/remove a mouse from the device',
      protected: true,
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': 'Bearer <token>'
      },
      request: { mouseId: '003' },
      response: {
        success: true,
        data: [
          {
            mouseId: '001',
            customName: 'Player 1',
            balance: 1500.50,
            active: true
          },
          {
            mouseId: '002',
            customName: 'Player 2',
            balance: 2300.00,
            active: true
          }
        ]
      },
      notes: [
        'Sets mouse active status to false',
        'If balance is 0, removes from array entirely',
        'Re-indexes remaining mice (Player 1, 2, 3...)',
        'IMPORTANT: Listen to "deviceInfoUpdate" socket event to update UI',
        'Do NOT use REST API response data - use socket event instead',
        'Socket event ensures all devices see consistent state'
      ]
    },
    {
      title: '6. Logout Device',
      method: 'POST',
      path: '/api/v1/device/logout',
      description: 'End device session',
      protected: true,
      headers: { 
        'Authorization': 'Bearer <token>'
      },
      response: {
        success: true,
        message: 'Session ended.'
      },
      notes: [
        'Invalidates the JWT token',
        'Does not deactivate the device',
        'Device can log back in without re-activation'
      ]
    }
  ]

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-lg p-6">
        <h2 className="text-2xl font-bold text-purple-300 mb-3">🔐 REST API Endpoints</h2>
        <p className="text-gray-300 mb-4">
          Complete HTTP API reference for device lifecycle management, authentication, and multi-mouse hardware control.
        </p>
        <div className="bg-black/30 rounded p-4 font-mono text-sm">
          <p className="text-purple-400">Base URL: <span className="text-white">https://server.pushvault.shop</span></p>
          <p className="text-purple-400 mt-2">Authentication: <span className="text-white">Bearer Token (JWT)</span></p>
          <p className="text-gray-500 text-xs mt-2">Protected endpoints require: Authorization: Bearer &lt;token&gt;</p>
        </div>
      </div>

      {endpoints.map((endpoint, index) => (
        <EndpointCard key={index} {...endpoint} />
      ))}
    </div>
  )
}

export default ApiSection
