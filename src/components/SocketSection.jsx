import SocketEventCard from './SocketEventCard'

function SocketSection() {
  const deviceEmits = [
    {
      event: 'joinDevice',
      direction: 'emit',
      description: 'Device connects and joins its room',
      payload: 'deviceId (string)',
      example: `socket.emit('joinDevice', 'DEVICE_UUID_001')`,
      serverResponse: 'deviceJoined',
      responseData: { deviceId: 'DEVICE_UUID_001', message: 'Connected successfully' },
      notes: [
        'Marks device as online in Redis',
        'Sets up heartbeat interval (10s)',
        'Required before any game activity'
      ]
    },
    {
      event: 'joinDeviceSession',
      direction: 'emit',
      description: 'Join game session and start crash loop',
      payload: { deviceId: 'string', stationId: 'string' },
      example: `socket.emit('joinDeviceSession', {
  deviceId: 'DEVICE_UUID_001',
  stationId: 'STATION_ID_001'
})`,
      serverResponse: 'Multiple events',
      responseData: 'initialHistory, deviceConfig, jackpot:stats, bettingPhase/flightStarted',
      notes: [
        'Fetches and sends crash history (last 30 rounds)',
        'Sends device configuration (maxStake, bonusPercentage, currency)',
        'Initializes jackpot pools (Device, Silver, Gold)',
        'Recovers ongoing round if player joins mid-game',
        'Starts crash loop if no active game'
      ]
    },
    {
      event: 'placeBet',
      direction: 'emit',
      description: 'Place a bet during betting phase',
      payload: { deviceId: 'string', mouseId: 'string', amount: 'number', roundId: 'string' },
      example: `socket.emit('placeBet', {
  deviceId: 'DEVICE_UUID_001',
  mouseId: '001',
  amount: 100,
  roundId: '507f1f77bcf86cd799439011'
}, (response) => {
  console.log(response.success)
})`,
      serverResponse: 'Callback + Events',
      responseData: 'balanceUpdate, bet:placed',
      notes: [
        'Validates betting window is open (Redis lock)',
        'Minimum bet: 10 (or all-in if balance < 10)',
        'Maximum bet: device.maxStake',
        'Deducts balance atomically',
        'Prevents duplicate bets',
        'Emits to station room for cashier dashboards'
      ]
    },
    {
      event: 'cashoutBet',
      direction: 'emit',
      description: 'Cash out active bet before crash',
      payload: { deviceId: 'string', mouseId: 'string', multiplier: 'number', roundId: 'string' },
      example: `socket.emit('cashoutBet', {
  deviceId: 'DEVICE_UUID_001',
  mouseId: '001',
  multiplier: 2.50,
  roundId: '507f1f77bcf86cd799439011'
}, (response) => {
  console.log(response.winAmount)
})`,
      serverResponse: 'Callback + Events',
      responseData: 'balanceUpdate, player:won',
      notes: [
        'Uses distributed lock to prevent race conditions',
        'Validates multiplier < crashPoint',
        'Allows 1s grace period after crash',
        'Updates transaction status to WON',
        'Adds balance atomically',
        'Contributes 0.50 to jackpot pools'
      ]
    },
    {
      event: 'cancelBet',
      direction: 'emit',
      description: 'Cancel bet during betting phase',
      payload: { deviceId: 'string', mouseId: 'string', roundId: 'string' },
      example: `socket.emit('cancelBet', {
  deviceId: 'DEVICE_UUID_001',
  mouseId: '001',
  roundId: '507f1f77bcf86cd799439011'
})`,
      serverResponse: 'balanceUpdate, bet:canceled',
      responseData: { mouseId: '001', newBalance: 1100, isCancellation: true },
      notes: [
        'Only works during betting phase',
        'Deletes transaction from database',
        'Refunds bet amount immediately',
        'Updates Redis cache'
      ]
    }
  ]

  const deviceListens = [
    {
      event: 'deviceJoined',
      direction: 'listen',
      description: 'Confirmation that device joined its room',
      payload: { deviceId: 'string', message: 'string' },
      example: `socket.on('deviceJoined', (data) => {
  console.log('Connected:', data.message)
})`,
      emittedBy: 'Server (response to joinDevice)',
      notes: ['Confirms successful socket connection', 'First response after joinDevice emit']
    },
    {
      event: 'deviceActivated',
      direction: 'listen',
      description: 'Cashier activated the terminal - Ready to login!',
      payload: { success: 'boolean', stationName: 'string', stationId: 'string' },
      example: `socket.on('deviceActivated', (data) => {
  console.log('Activated at:', data.stationName)
  // Now call /login-device REST API
})`,
      emittedBy: 'Server (after cashier uses activation code)',
      notes: [
        'Triggered when cashier calls /api/v1/cashier/activate-terminal',
        'Device receives this after waiting for cashier activation',
        'After this event, call /login-device REST API to get JWT token'
      ]
    },
    {
      event: 'deviceConfig',
      direction: 'listen',
      description: 'Device configuration from server',
      payload: { maxStake: 'number', bonusPercentage: 'number', country: 'string', currency: 'object' },
      example: `socket.on('deviceConfig', (config) => {
  setMaxBet(config.maxStake)
  setCurrency(config.currency.code)
})`,
      emittedBy: 'Server (on joinDeviceSession)',
      notes: ['Configure UI limits and currency display', 'Bonus percentage for cashback system']
    },
    {
      event: 'initialHistory',
      direction: 'listen',
      description: 'Last 30 crash results',
      payload: 'Array of rounds: [{ _id, crashPoint, completedAt, hash, seed }]',
      example: `socket.on('initialHistory', (history) => {
  displayCrashHistory(history)
})`,
      emittedBy: 'Server (on joinDeviceSession and after each round)',
      notes: ['Display crash history', 'Used for pattern analysis']
    },
    {
      event: 'jackpot:stats',
      direction: 'listen',
      description: 'Current jackpot pool amounts and statistics',
      payload: `{
  device: {
    poolAmount: number,        // Current pool (e.g., 5000.50)
    threshold: number,         // Drop threshold (e.g., 10000)
    lastWonAt: Date | null,
    lastWinner: {
      mouseId: string,
      deviceId: string,
      amount: number,
      wonAt: Date
    } | null,
    totalPaidOut: number       // Total ever paid
  },
  silver: {
    poolAmount: number,
    threshold: number,
    lastWonAt: Date | null,
    lastWinner: {
      mouseId: string,
      stationId: string,       // Station-wide jackpot
      amount: number,
      wonAt: Date
    } | null,
    totalPaidOut: number
  },
  gold: {
    poolAmount: number,
    threshold: number,
    lastWonAt: Date | null,
    lastWinner: {
      mouseId: string,
      stationId: string,       // Global jackpot
      amount: number,
      wonAt: Date
    } | null,
    totalPaidOut: number
  }
}`,
      example: `socket.on('jackpot:stats', (data) => {
  // Device Jackpot (this terminal only)
  console.log('Device Pool:', data.device.poolAmount)
  console.log('Will drop at:', data.device.threshold)
  
  // Silver Jackpot (station-wide)
  console.log('Silver Pool:', data.silver.poolAmount)
  
  // Gold Jackpot (global/all stations)
  console.log('Gold Pool:', data.gold.poolAmount)
  
  // Check last winner
  if (data.device.lastWinner) {
    console.log('Last winner:', data.device.lastWinner.mouseId)
    console.log('Won amount:', data.device.lastWinner.amount)
  }
  
  // Update UI displays
  updateJackpotDisplay({
    device: data.device.poolAmount,
    silver: data.silver.poolAmount,
    gold: data.gold.poolAmount
  })
})`,
      emittedBy: 'Server (on joinDeviceSession and after jackpot drops)',
      notes: [
        'Three jackpot levels: DEVICE (terminal), SILVER (station), GOLD (global)',
        'DEVICE: Only players on this terminal can win',
        'SILVER: Any player at this station can win',
        'GOLD: Any player across all stations can win',
        'poolAmount increases with every cashout (0.50 contribution)',
        'Jackpot drops when pool reaches threshold during a round',
        'All values in station currency (e.g., TSh, KSh)'
      ]
    },
    {
      event: 'deviceInfoUpdate',
      direction: 'listen',
      description: 'Device or mice data updated',
      payload: { success: 'boolean', mice: 'array', activated: 'boolean' },
      example: `socket.on('deviceInfoUpdate', (data) => {
  // Update mice list in UI
  updateMiceDisplay(data.mice)
})`,
      emittedBy: 'Server (when mouse added/removed)',
      notes: ['Update UI with current mice state', 'Shows only active mice']
    },
    {
      event: 'deviceDeactivated',
      direction: 'listen',
      description: 'Cashier deactivated the terminal',
      payload: { success: 'boolean', message: 'string' },
      example: `socket.on('deviceDeactivated', (data) => {
  // Lock UI, end session
  console.log(data.message)
})`,
      emittedBy: 'Server (when cashier deactivates)',
      notes: ['Device should logout and clear session', 'UI should be locked/disabled']
    },
    {
      event: 'bettingPhase',
      direction: 'listen',
      description: 'Betting window is open - countdown timer',
      payload: { roundId: 'string', timer: 'number', status: 'string', liveBets: 'array' },
      example: `socket.on('bettingPhase', (data) => {
  updateCountdown(data.timer) // 10, 9, 8...
  showLiveBets(data.liveBets)
})`,
      emittedBy: 'Server (every second during 10s countdown)',
      notes: [
        'Timer counts down from 10 to 0',
        'liveBets includes real players + bots',
        'Place bets before timer reaches 0'
      ]
    },
    {
      event: 'bettingStatus',
      direction: 'listen',
      description: 'Betting window status change',
      payload: { open: 'boolean', roundId: 'string' },
      example: `socket.on('bettingStatus', (data) => {
  if (!data.open) {
    disableBettingUI()
  }
})`,
      emittedBy: 'Server (when betting closes)',
      notes: ['Lock betting UI when open: false']
    },
    {
      event: 'flightStarted',
      direction: 'listen',
      description: 'Plane takeoff - round begins',
      payload: { roundId: 'string', startTime: 'number', hash: 'string', liveBets: 'array' },
      example: `socket.on('flightStarted', (data) => {
  startPlaneAnimation()
  showAllBets(data.liveBets)
})`,
      emittedBy: 'Server (immediately after betting closes)',
      notes: [
        'Start plane animation',
        'hash is for provably fair verification',
        'Listen for multiplier events'
      ]
    },
    {
      event: 'multiplier',
      direction: 'listen',
      description: 'Current multiplier tick (100ms intervals)',
      payload: { multiplier: 'number', elapsed: 'number' },
      example: `socket.on('multiplier', (data) => {
  updateMultiplierDisplay(data.multiplier)
  // 1.00, 1.01, 1.02... 2.50, 2.51...
})`,
      emittedBy: 'Server (every 100ms during flight)',
      notes: [
        'Updates 10 times per second',
        'Use for smooth animation',
        'Cashout before it crashes'
      ]
    },
    {
      event: 'crashed',
      direction: 'listen',
      description: 'Plane crashed - round ended',
      payload: { finalMultiplier: 'string', roundId: 'string', seed: 'string', hash: 'string' },
      example: `socket.on('crashed', (data) => {
  showExplosion()
  displayFinalMultiplier(data.finalMultiplier)
})`,
      emittedBy: 'Server (when round completes)',
      notes: [
        'All uncashed bets are lost',
        'seed revealed for fair verification',
        'Next round starts after delay'
      ]
    },
    {
      event: 'balanceUpdate',
      direction: 'listen',
      description: 'Mouse balance changed',
      payload: { mouseId: 'string', newBalance: 'number', isBetConfirmation: 'boolean', reason: 'string' },
      example: `socket.on('balanceUpdate', (data) => {
  updateMouseBalance(data.mouseId, data.newBalance)
})`,
      emittedBy: 'Server (bet, cashout, deposit, bonus)',
      notes: [
        'Update UI immediately',
        'Reasons: BET_PLACED, BET_WON, JACKPOT_WIN, DEPOSIT, BONUS_AWARD'
      ]
    },
    {
      event: 'bet:placed',
      direction: 'listen',
      description: 'Bet successfully placed confirmation',
      payload: { mouseId: 'string', roundId: 'string' },
      example: `socket.on('bet:placed', (data) => {
  showBetPlacedAnimation(data.mouseId)
})`,
      emittedBy: 'Server (after successful bet)',
      notes: ['Visual feedback for bet placement']
    },
    {
      event: 'bet:canceled',
      direction: 'listen',
      description: 'Bet cancelled confirmation',
      payload: { mouseId: 'string', newBalance: 'number', isCancellation: true },
      example: `socket.on('bet:canceled', (data) => {
  removeBetFromUI(data.mouseId)
})`,
      emittedBy: 'Server (after bet cancellation)',
      notes: ['Remove bet from UI']
    },
    {
      event: 'player:won',
      direction: 'listen',
      description: 'Player successfully cashed out',
      payload: { mouseId: 'string', amount: 'string', multiplier: 'string', winAmount: 'string', roundId: 'string' },
      example: `socket.on('player:won', (data) => {
  showWinAnimation(data.mouseId, data.winAmount)
})`,
      emittedBy: 'Server (successful cashout)',
      notes: ['Display win celebration', 'Amount includes multiplier']
    },
    {
      event: 'player:lost',
      direction: 'listen',
      description: 'Player did not cashout - bet lost',
      payload: { mouseId: 'string', amount: 'string', multiplier: 'string', roundId: 'string' },
      example: `socket.on('player:lost', (data) => {
  showLossAnimation(data.mouseId)
})`,
      emittedBy: 'Server (after crash for uncashed bets)',
      notes: ['Display loss feedback']
    },
    {
      event: 'playerCashedOut',
      direction: 'listen',
      description: 'Bot or other player cashed out',
      payload: { mouseId: 'string', multiplier: 'string', winAmount: 'string', isBot: 'boolean' },
      example: `socket.on('playerCashedOut', (data) => {
  if (data.isBot) {
    updateBotsList(data.mouseId, 'CASHED_OUT')
  }
})`,
      emittedBy: 'Server (when any player/bot cashes out)',
      notes: ['Used to show other players cashing out', 'isBot identifies computer players']
    },
    {
      event: 'jackpotDropped',
      direction: 'listen',
      description: 'Jackpot will drop at this multiplier',
      payload: { type: 'string', amount: 'number', multiplier: 'number' },
      example: `socket.on('jackpotDropped', (data) => {
  showJackpotIndicator(data.type, data.multiplier)
  // Type: DEVICE, SILVER, or GOLD
})`,
      emittedBy: 'Server (during flight when jackpot triggers)',
      notes: ['Shows target multiplier for jackpot', 'Winner announced after round']
    },
    {
      event: 'jackpot:won',
      direction: 'listen',
      description: 'Jackpot winner announced',
      payload: { type: 'string', winner: 'string', amount: 'string', multiplier: 'string', roundId: 'string' },
      example: `socket.on('jackpot:won', (data) => {
  showJackpotWinCelebration(
    data.winner,
    data.amount,
    data.type
  )
})`,
      emittedBy: 'Server (after round completes with jackpot)',
      notes: ['Major celebration animation', 'Winner gets balance update separately']
    },
    {
      event: 'bonusAwarded',
      direction: 'listen',
      description: 'Cashback bonus given to player',
      payload: { mouseId: 'string', bonusAmount: 'number', newBalance: 'number', bonusPercentage: 'number' },
      example: `socket.on('bonusAwarded', (data) => {
  showBonusNotification(
    data.mouseId,
    data.bonusAmount
  )
})`,
      emittedBy: 'Server (when player loses all money)',
      notes: [
        'Triggers when balance reaches 0 after having deposits',
        'Percentage based on device.bonusPercentage',
        'One-time per deposit cycle'
      ]
    }
  ]

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/30 rounded-lg p-6">
        <h2 className="text-2xl font-bold text-blue-300 mb-3">🔌 Socket.IO Events</h2>
        <p className="text-gray-300 mb-4">
          Real-time bidirectional communication for game state, betting, and crash round events.
        </p>
        <div className="bg-black/30 rounded p-4 font-mono text-sm space-y-2">
          <p className="text-blue-400">Connection URL: <span className="text-white">wss://server.pushvault.shop</span></p>
          <p className="text-blue-400">Transport: <span className="text-white">websocket, polling</span></p>
          <p className="text-blue-400">Library: <span className="text-white">socket.io-client</span></p>
        </div>
      </div>

      {/* Device Emits Section */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <div className="h-10 w-1 bg-gradient-to-b from-green-400 to-green-600 rounded"></div>
          <h3 className="text-2xl font-bold text-green-400">Device Emits (Frontend → Server)</h3>
        </div>
        <div className="space-y-4">
          {deviceEmits.map((event, index) => (
            <SocketEventCard key={index} {...event} />
          ))}
        </div>
      </div>

      {/* Device Listens Section */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <div className="h-10 w-1 bg-gradient-to-b from-purple-400 to-pink-600 rounded"></div>
          <h3 className="text-2xl font-bold text-purple-400">Device Listens (Server → Frontend)</h3>
        </div>
        <div className="space-y-4">
          {deviceListens.map((event, index) => (
            <SocketEventCard key={index} {...event} />
          ))}
        </div>
      </div>

      {/* Connection Flow */}
      <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 rounded-lg p-6">
        <h3 className="text-xl font-bold text-yellow-400 mb-4">📋 Complete Device Lifecycle Flow</h3>
        <div className="space-y-3 text-gray-300">
          <div className="bg-blue-500/10 border-l-4 border-blue-500 p-3 rounded">
            <p className="text-blue-300 font-semibold mb-2">🔷 Initial Setup (One-time)</p>
          </div>
          <div className="flex items-start gap-3 ml-4">
            <span className="text-yellow-400 font-bold">1.</span>
            <p>Device calls REST API <code className="bg-black/50 px-2 py-1 rounded text-orange-400">POST /request-activation</code> → Gets activation code</p>
          </div>
          <div className="flex items-start gap-3 ml-4">
            <span className="text-yellow-400 font-bold">2.</span>
            <p>Device emits <code className="bg-black/50 px-2 py-1 rounded text-green-400">joinDevice</code> (deviceId) → Establishes socket connection</p>
          </div>
          <div className="flex items-start gap-3 ml-4">
            <span className="text-yellow-400 font-bold">3.</span>
            <p>Server responds <code className="bg-black/50 px-2 py-1 rounded text-purple-400">deviceJoined</code> → Connection confirmed</p>
          </div>
          <div className="flex items-start gap-3 ml-4">
            <span className="text-yellow-400 font-bold">4.</span>
            <p>Wait for cashier to enter activation code...</p>
          </div>
          <div className="flex items-start gap-3 ml-4">
            <span className="text-yellow-400 font-bold">5.</span>
            <p>Server emits <code className="bg-black/50 px-2 py-1 rounded text-purple-400">deviceActivated</code> → Terminal is now activated! ✅</p>
          </div>
          
          <div className="bg-green-500/10 border-l-4 border-green-500 p-3 rounded mt-4">
            <p className="text-green-300 font-semibold mb-2">🔷 Every App Launch (Required)</p>
          </div>
          <div className="flex items-start gap-3 ml-4">
            <span className="text-yellow-400 font-bold">6.</span>
            <p>Device calls REST API <code className="bg-black/50 px-2 py-1 rounded text-orange-400">POST /login-device</code> → Gets JWT token</p>
          </div>
          <div className="flex items-start gap-3 ml-4">
            <span className="text-yellow-400 font-bold">7.</span>
            <p>Device emits <code className="bg-black/50 px-2 py-1 rounded text-green-400">joinDeviceSession</code> → Start game session</p>
          </div>
          <div className="flex items-start gap-3 ml-4">
            <span className="text-yellow-400 font-bold">8.</span>
            <p>Server sends <code className="bg-black/50 px-2 py-1 rounded text-purple-400">initialHistory</code>, <code className="bg-black/50 px-2 py-1 rounded text-purple-400">deviceConfig</code>, <code className="bg-black/50 px-2 py-1 rounded text-purple-400">jackpot:stats</code></p>
          </div>
          
          <div className="bg-pink-500/10 border-l-4 border-pink-500 p-3 rounded mt-4">
            <p className="text-pink-300 font-semibold mb-2">🔷 Game Loop (Continuous)</p>
          </div>
          <div className="flex items-start gap-3 ml-4">
            <span className="text-yellow-400 font-bold">9.</span>
            <p>Server emits <code className="bg-black/50 px-2 py-1 rounded text-purple-400">bettingPhase</code> every 1s (10s countdown)</p>
          </div>
          <div className="flex items-start gap-3 ml-4">
            <span className="text-yellow-400 font-bold">10.</span>
            <p>Device emits <code className="bg-black/50 px-2 py-1 rounded text-green-400">placeBet</code> during countdown</p>
          </div>
          <div className="flex items-start gap-3 ml-4">
            <span className="text-yellow-400 font-bold">11.</span>
            <p>Server emits <code className="bg-black/50 px-2 py-1 rounded text-purple-400">flightStarted</code> when countdown ends</p>
          </div>
          <div className="flex items-start gap-3 ml-4">
            <span className="text-yellow-400 font-bold">12.</span>
            <p>Server continuously emits <code className="bg-black/50 px-2 py-1 rounded text-purple-400">multiplier</code> every 100ms</p>
          </div>
          <div className="flex items-start gap-3 ml-4">
            <span className="text-yellow-400 font-bold">13.</span>
            <p>Device emits <code className="bg-black/50 px-2 py-1 rounded text-green-400">cashoutBet</code> to win before crash</p>
          </div>
          <div className="flex items-start gap-3 ml-4">
            <span className="text-yellow-400 font-bold">14.</span>
            <p>Server emits <code className="bg-black/50 px-2 py-1 rounded text-purple-400">crashed</code> when round ends</p>
          </div>
          <div className="flex items-start gap-3 ml-4">
            <span className="text-yellow-400 font-bold">15.</span>
            <p>Wait 3-8 seconds, then loop returns to step 9 ♻️</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SocketSection
