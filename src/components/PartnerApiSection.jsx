import EndpointCard from './EndpointCard'

function PartnerApiSection() {
  const endpoints = [
    {
      title: '1. Register Device',
      method: 'POST',
      path: '/api/v1/partner/devices/register',
      description: 'Pre-register a device ID so it belongs to your partner account. Optional — activation will auto-assign if not pre-registered.',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': 'pk_your_api_key_here'
      },
      request: { deviceId: 'DEVICE_UUID_001' },
      response: {
        success: true,
        message: 'Device registered successfully',
        deviceId: 'DEVICE_UUID_001'
      },
      notes: [
        'X-API-Key header is required for all partner endpoints',
        'Device limit is enforced per partner (default: 100)',
        'If device already exists and is unclaimed, it gets assigned to your account',
        'If device belongs to another partner, request is rejected'
      ]
    },
    {
      title: '2. Activate Device',
      method: 'POST',
      path: '/api/v1/partner/devices/activate',
      description: 'Activate a device using the activation code displayed on its screen. Your cashier enters the code in your system, your backend calls this endpoint.',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': 'pk_your_api_key_here'
      },
      request: {
        code: '123456',
        stationRef: 'SHOP_NAIROBI_01',
        stationName: 'BetKing Nairobi CBD'
      },
      response: {
        success: true,
        message: 'Device DEVICE_UUID_001 activated',
        stationId: 'P-BETKING-SHOP_NAIROBI_01',
        stationName: 'BetKing Nairobi CBD'
      },
      notes: [
        'The device displays a 6-digit activation code on screen',
        'Your cashier enters this code in YOUR dashboard, your backend calls us',
        'stationRef groups devices by shop — same ref = same station',
        'stationName is the display name (auto-generated if not provided)',
        'Code expires after a set time period',
        'Device screen updates instantly via WebSocket on successful activation'
      ]
    },
    {
      title: '3. Deactivate Device',
      method: 'POST',
      path: '/api/v1/partner/devices/deactivate',
      description: 'Deactivate a device. Clears all active mice/sessions. Device returns to activation code screen.',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': 'pk_your_api_key_here'
      },
      request: { deviceId: 'DEVICE_UUID_001' },
      response: {
        success: true,
        message: 'Device DEVICE_UUID_001 deactivated'
      },
      notes: [
        'All mice are flushed — balances are cleared',
        'Device must belong to your partner account',
        'Device UI updates instantly via WebSocket'
      ]
    },
    {
      title: '4. List Devices',
      method: 'GET',
      path: '/api/v1/partner/devices',
      description: 'List all devices registered to your partner account with activation status and station info.',
      headers: {
        'X-API-Key': 'pk_your_api_key_here'
      },
      response: {
        success: true,
        data: [
          {
            deviceId: 'DEVICE_UUID_001',
            isActivated: true,
            customName: 'Terminal 1',
            station: {
              stationId: 'P-BETKING-SHOP_01',
              name: 'BetKing Nairobi CBD',
              ref: 'SHOP_01'
            },
            activeMice: 3,
            country: 'kenya',
            registeredAt: '2026-03-01T10:00:00.000Z'
          }
        ]
      },
      notes: [
        'Returns all devices regardless of activation status',
        'activeMice shows how many players are currently connected',
        'station.ref matches the stationRef you sent during activation'
      ]
    },
    {
      title: '5. Deposit (Player Top-up)',
      method: 'POST',
      path: '/api/v1/partner/deposit',
      description: 'Credit a player\'s balance on a device. Called by your backend when your cashier processes a deposit.',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': 'pk_your_api_key_here'
      },
      request: {
        deviceId: 'DEVICE_UUID_001',
        mouseId: '001',
        amount: 500,
        cashierRef: 'cashier_john_123'
      },
      response: {
        success: true,
        message: 'Deposited 500 to 001',
        newMouseBalance: 1500,
        cashierRef: 'cashier_john_123'
      },
      notes: [
        'Minimum deposit: 10',
        'Device must be activated and belong to your partner account',
        'mouseId is the hardware mouse identifier on the device',
        'cashierRef is optional — pass your own cashier ID for your records',
        'Player balance updates instantly on the game screen via WebSocket',
        'Blocked if partner is SUSPENDED or DISABLED',
        'Blocked if outstanding balance exceeds credit limit — settle first',
        'Transaction is recorded with fundingSource: "PARTNER"'
      ]
    },
    {
      title: '6. Withdraw (Player Cash-out)',
      method: 'POST',
      path: '/api/v1/partner/withdraw',
      description: 'Debit a player\'s balance on a device. Called by your backend when your cashier processes a withdrawal.',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': 'pk_your_api_key_here'
      },
      request: {
        deviceId: 'DEVICE_UUID_001',
        mouseId: '001',
        amount: 200,
        cashierRef: 'cashier_john_123'
      },
      response: {
        success: true,
        message: 'Withdrew 200 from 001',
        newMouseBalance: 1300,
        cashierRef: 'cashier_john_123'
      },
      notes: [
        'Fails if player balance is insufficient',
        'Withdrawals are always allowed even if partner is SUSPENDED (players can cash out)',
        'Device must be activated and belong to your partner account',
        'Player balance updates instantly on the game screen via WebSocket',
        'If player hasn\'t played any game since last deposit, totalDeposited is adjusted'
      ]
    },
    {
      title: '7. Get Transactions',
      method: 'GET',
      path: '/api/v1/partner/transactions',
      description: 'Get your partner transaction history with filters and pagination.',
      headers: {
        'X-API-Key': 'pk_your_api_key_here'
      },
      request: '?type=DEBIT&status=SUCCESS&startDate=2026-03-01&endDate=2026-03-08&page=1&limit=50',
      response: {
        success: true,
        data: [
          {
            _id: '...',
            type: 'DEBIT',
            amount: 500,
            deviceId: 'DEVICE_UUID_001',
            mouseId: '001',
            status: 'SUCCESS',
            createdAt: '2026-03-08T12:00:00.000Z'
          }
        ],
        pagination: { page: 1, limit: 50, total: 120 }
      },
      notes: [
        'Filter by type: DEBIT, CREDIT, SETTLEMENT, ADJUSTMENT',
        'Filter by status: SUCCESS, FAILED, TIMEOUT, PENDING',
        'Date range filtering with startDate and endDate (ISO format)',
        'Paginated — default 50 per page',
        'Excludes raw request/response payloads for performance'
      ]
    },
    {
      title: '8. Get Summary',
      method: 'GET',
      path: '/api/v1/partner/summary',
      description: 'Get aggregated stats for your partner account — period totals and lifetime figures.',
      headers: {
        'X-API-Key': 'pk_your_api_key_here'
      },
      request: '?startDate=2026-03-01&endDate=2026-03-08',
      response: {
        success: true,
        data: {
          period: {
            totalBets: 250000,
            totalPayouts: 200000,
            netRevenue: 50000,
            totalTransactions: 1240,
            apiHealth: { successful: 1230, failed: 10 }
          },
          lifetime: {
            totalBetVolume: 1500000,
            totalPayouts: 1200000,
            grossGameRevenue: 300000,
            ourCommission: 45000,
            outstandingBalance: 12000,
            commissionRate: 15,
            commissionType: 'REVENUE_SHARE'
          },
          devices: { total: 25, active: 18 }
        }
      },
      notes: [
        'Period stats are filtered by startDate/endDate (optional)',
        'Lifetime stats show all-time totals from your partner record',
        'outstandingBalance = what you owe us (commission accumulated)',
        'apiHealth tracks how many webhook calls succeeded vs failed',
        'commissionType: REVENUE_SHARE (% of profit) or BET_VOLUME (% of bets)'
      ]
    }
  ]

  const webhookEvents = [
    {
      title: 'Webhook: BET_PLACED',
      method: 'POST',
      path: 'YOUR_CALLBACK_URL/game/bet',
      description: 'Sent to your server when a player places a bet on one of your devices.',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': 'your_partner_api_key',
        'X-Signature': 'hmac_sha256_signature'
      },
      request: {
        event: 'BET_PLACED',
        deviceId: 'DEVICE_UUID_001',
        mouseId: '001',
        amount: 100,
        roundId: '65f1a2b3c4d5e6f7...',
        balanceAfter: 900,
        transactionId: 'DEBIT-DEVICE_UUID_001-65f1a2b3...',
        timestamp: '2026-03-08T12:00:00.000Z'
      },
      notes: [
        'Non-blocking — sent after bet is processed on our side',
        'Verify X-Signature using HMAC-SHA256 with your apiSecret',
        'transactionId is unique — use for idempotency',
        'Your server should return { success: true } on 200',
        'Failed deliveries are logged but DO NOT block gameplay'
      ]
    },
    {
      title: 'Webhook: CASHOUT',
      method: 'POST',
      path: 'YOUR_CALLBACK_URL/game/cashout',
      description: 'Sent when a player cashes out (wins) during a round.',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': 'your_partner_api_key',
        'X-Signature': 'hmac_sha256_signature'
      },
      request: {
        event: 'CASHOUT',
        deviceId: 'DEVICE_UUID_001',
        mouseId: '001',
        amount: 250,
        betAmount: 100,
        multiplier: 2.5,
        roundId: '65f1a2b3c4d5e6f7...',
        balanceAfter: 1150,
        transactionId: 'CREDIT-DEVICE_UUID_001-65f1a2b3...',
        timestamp: '2026-03-08T12:00:05.000Z'
      },
      notes: [
        'amount = total win (betAmount × multiplier)',
        'multiplier = the cashout multiplier the player chose',
        'Player\'s balance is already credited on our side'
      ]
    },
    {
      title: 'Webhook: BET_CANCELLED',
      method: 'POST',
      path: 'YOUR_CALLBACK_URL/game/cancel',
      description: 'Sent when a player cancels their bet before the round starts.',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': 'your_partner_api_key',
        'X-Signature': 'hmac_sha256_signature'
      },
      request: {
        event: 'BET_CANCELLED',
        deviceId: 'DEVICE_UUID_001',
        mouseId: '001',
        amount: 100,
        roundId: '65f1a2b3c4d5e6f7...',
        balanceAfter: 1000,
        transactionId: 'CREDIT-DEVICE_UUID_001-65f1a2b3...',
        timestamp: '2026-03-08T12:00:02.000Z'
      },
      notes: [
        'Full bet amount is refunded to player',
        'Only possible during betting phase (before plane takes off)'
      ]
    },
    {
      title: 'Webhook: ROUND_COMPLETED',
      method: 'POST',
      path: 'YOUR_CALLBACK_URL/game/round-result',
      description: 'Sent after a crash round completes. Includes round summary, lost bets, and triggers commission calculation.',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': 'your_partner_api_key',
        'X-Signature': 'hmac_sha256_signature'
      },
      request: {
        event: 'ROUND_COMPLETED',
        roundId: '65f1a2b3c4d5e6f7...',
        crashPoint: 2.34,
        totalBets: 1500,
        totalPayouts: 800,
        netProfit: 700,
        lostBets: [
          { mouseId: '002', deviceId: 'DEVICE_UUID_001', amount: 200 },
          { mouseId: '005', deviceId: 'DEVICE_UUID_002', amount: 500 }
        ],
        transactionId: 'DEBIT-sys-65f1a2b3...',
        timestamp: '2026-03-08T12:01:00.000Z'
      },
      notes: [
        'crashPoint = the multiplier where the plane crashed',
        'netProfit = totalBets - totalPayouts (house edge for this round)',
        'lostBets = players who didn\'t cash out before crash',
        'Commission is calculated automatically: our cut from netProfit (or betVolume)',
        'outstandingBalance increases by the commission amount after each profitable round'
      ]
    }
  ]

  return (
    <div className="space-y-6">
      {/* Auth Info */}
      <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-lg p-6">
        <h2 className="text-2xl font-bold text-purple-300 mb-3">🤝 Partner API</h2>
        <p className="text-gray-300 mb-4">
          White-label integration endpoints. Your backend calls these using your API key to manage devices, deposits, withdrawals, and view reports.
        </p>
        <div className="bg-black/30 rounded p-4 font-mono text-sm space-y-2">
          <p className="text-purple-400">Base URL: <span className="text-white">https://server.pushvault.shop</span></p>
          <p className="text-purple-400">Authentication: <span className="text-white">X-API-Key header</span></p>
          <p className="text-gray-500 text-xs">All endpoints require: X-API-Key: pk_your_api_key_here</p>
        </div>
      </div>

      {/* Integration Flow */}
      <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/30 rounded-lg p-6">
        <h3 className="text-lg font-bold text-blue-300 mb-3">📋 Integration Flow</h3>
        <div className="space-y-3 text-sm text-gray-300">
          <div className="flex items-start gap-3">
            <span className="bg-blue-500/20 text-blue-400 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold flex-shrink-0">1</span>
            <span><strong className="text-white">Setup:</strong> We create your partner account and give you an API key + secret</span>
          </div>
          <div className="flex items-start gap-3">
            <span className="bg-blue-500/20 text-blue-400 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold flex-shrink-0">2</span>
            <span><strong className="text-white">Activate:</strong> Device shows code → your cashier enters it → your backend calls <code className="text-purple-300">/devices/activate</code></span>
          </div>
          <div className="flex items-start gap-3">
            <span className="bg-blue-500/20 text-blue-400 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold flex-shrink-0">3</span>
            <span><strong className="text-white">Deposit:</strong> Your cashier tops up a player → your backend calls <code className="text-purple-300">/deposit</code> → player balance updates on game screen</span>
          </div>
          <div className="flex items-start gap-3">
            <span className="bg-blue-500/20 text-blue-400 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold flex-shrink-0">4</span>
            <span><strong className="text-white">Game runs:</strong> Players play on our game engine. We POST game events (bet, cashout, cancel, round result) to your callback URL</span>
          </div>
          <div className="flex items-start gap-3">
            <span className="bg-blue-500/20 text-blue-400 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold flex-shrink-0">5</span>
            <span><strong className="text-white">Withdraw:</strong> Player wants cash → your cashier calls <code className="text-purple-300">/withdraw</code> → balance debited on game screen</span>
          </div>
          <div className="flex items-start gap-3">
            <span className="bg-blue-500/20 text-blue-400 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold flex-shrink-0">6</span>
            <span><strong className="text-white">Settlement:</strong> Commission accumulates from game revenue. Settle periodically as agreed</span>
          </div>
        </div>
      </div>

      {/* HMAC Verification */}
      <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 rounded-lg p-6">
        <h3 className="text-lg font-bold text-yellow-300 mb-3">🔐 Webhook Signature Verification</h3>
        <p className="text-gray-300 mb-3 text-sm">
          All webhooks include an <code className="text-purple-300">X-Signature</code> header. Verify it to ensure the request came from us:
        </p>
        <pre className="bg-black/50 rounded p-4 overflow-x-auto">
          <code className="text-sm text-green-400">{`const crypto = require('crypto');

function verifySignature(body, signature, apiSecret) {
  const expected = crypto
    .createHmac('sha256', apiSecret)
    .update(JSON.stringify(body))
    .digest('hex');
  return crypto.timingSafeEqual(
    Buffer.from(expected), 
    Buffer.from(signature)
  );
}

// In your webhook handler:
app.post('/game/bet', (req, res) => {
  const isValid = verifySignature(
    req.body, 
    req.headers['x-signature'], 
    process.env.PARTNER_API_SECRET
  );
  if (!isValid) return res.status(401).json({ error: 'Invalid signature' });
  
  // Process the event...
  res.json({ success: true });
});`}</code>
        </pre>
      </div>

      {/* API Endpoints */}
      <h2 className="text-xl font-bold text-purple-300 pt-4">📡 API Endpoints</h2>
      {endpoints.map((endpoint, index) => (
        <EndpointCard key={`api-${index}`} {...endpoint} />
      ))}

      {/* Webhook Events */}
      <h2 className="text-xl font-bold text-orange-300 pt-8">🔔 Webhook Callbacks (We → Your Server)</h2>
      <div className="bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/30 rounded-lg p-4 mb-4">
        <p className="text-gray-300 text-sm">
          These are events we POST to your <strong className="text-white">callbackUrl</strong> after game events occur. 
          Your server receives these — you don't call these endpoints.
        </p>
      </div>
      {webhookEvents.map((event, index) => (
        <EndpointCard key={`webhook-${index}`} {...event} />
      ))}

      {/* Error Codes */}
      <div className="bg-gradient-to-r from-red-500/10 to-pink-500/10 border border-red-500/30 rounded-lg p-6">
        <h3 className="text-lg font-bold text-red-300 mb-3">⚠️ Error Responses</h3>
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-4">
            <code className="text-red-400 bg-black/30 px-2 py-1 rounded w-12 text-center">400</code>
            <span className="text-gray-300">Bad request — missing or invalid parameters</span>
          </div>
          <div className="flex items-center gap-4">
            <code className="text-red-400 bg-black/30 px-2 py-1 rounded w-12 text-center">401</code>
            <span className="text-gray-300">Invalid or missing API key</span>
          </div>
          <div className="flex items-center gap-4">
            <code className="text-red-400 bg-black/30 px-2 py-1 rounded w-12 text-center">403</code>
            <span className="text-gray-300">Partner suspended, disabled, or credit limit exceeded</span>
          </div>
          <div className="flex items-center gap-4">
            <code className="text-red-400 bg-black/30 px-2 py-1 rounded w-12 text-center">404</code>
            <span className="text-gray-300">Device or mouse not found, or not owned by you</span>
          </div>
          <div className="flex items-center gap-4">
            <code className="text-red-400 bg-black/30 px-2 py-1 rounded w-12 text-center">500</code>
            <span className="text-gray-300">Internal server error</span>
          </div>
        </div>
        <pre className="bg-black/50 rounded p-3 mt-4 overflow-x-auto">
          <code className="text-sm text-red-400">{JSON.stringify({ success: false, message: "Description of what went wrong" }, null, 2)}</code>
        </pre>
      </div>
    </div>
  )
}

export default PartnerApiSection
