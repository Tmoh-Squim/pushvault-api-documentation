import EndpointCard from './EndpointCard'

const commonHeaders = {
  'Content-Type': 'application/json',
  'X-Api-Key': 'your_configured_pushvault_key',
  'X-Partner-Code': 'YOUR_PARTNER_CODE',
}

const endpoints = [
  {
    title: 'Validate launch token',
    method: 'POST',
    path: '{walletBaseUrl}/validate',
    description: 'PushVault calls this during a real-money launch. Validate the one-time token and return the player identity.',
    headers: commonHeaders,
    request: { token: 'YOUR_ONE_TIME_PLAYER_TOKEN' },
    response: { externalPlayerId: 'player-123', username: 'john_doe', currency: 'KES' },
    notes: [
      'Reject missing, expired, reused, or unknown tokens with a non-2xx response',
      'externalPlayerId must be stable and unique inside your platform',
      'currency must be the player wallet currency using an ISO-style uppercase code',
    ],
  },
  {
    title: 'Get player balance',
    method: 'POST',
    path: '{walletBaseUrl}/balance',
    description: 'Return the player’s current authoritative wallet balance.',
    headers: commonHeaders,
    request: { externalPlayerId: 'player-123' },
    response: { balance: 1000, currency: 'KES' },
    notes: [
      'Return a numeric balance, not a formatted string',
      'The returned currency should match the player currency from validation',
      'Return a non-2xx response when the player does not exist or is blocked',
    ],
  },
  {
    title: 'Debit bet amount',
    method: 'POST',
    path: '{walletBaseUrl}/debit',
    description: 'Atomically deduct a real-money wager from the player wallet.',
    headers: commonHeaders,
    request: {
      externalPlayerId: 'player-123',
      amount: 100,
      roundId: 'round-456',
      transactionId: 'SPANK-BET-round-456',
      gameType: 'SPANK',
      gameName: 'spank',
    },
    response: { balance: 900, transactionId: 'SPANK-BET-round-456' },
    notes: [
      'Perform the balance check and deduction atomically',
      'Reject insufficient funds with a non-2xx response and do not change the balance',
      'Repeated transactionId values must return the original result without another deduction',
    ],
  },
  {
    title: 'Credit win or refund',
    method: 'POST',
    path: '{walletBaseUrl}/credit',
    description: 'Atomically credit a game win or refund to the player wallet.',
    headers: commonHeaders,
    request: {
      externalPlayerId: 'player-123',
      amount: 250,
      roundId: 'round-456',
      transactionId: 'SPANK-WIN-round-456',
      reason: 'GAME_WIN',
      gameType: 'SPANK',
      gameName: 'spank',
    },
    response: { balance: 1150, transactionId: 'SPANK-WIN-round-456' },
    notes: [
      'Repeated transactionId values must return the original result without another credit',
      'The response balance must be the balance after the credit',
      'Store roundId and transactionId for reconciliation and support investigations',
    ],
  },
]

const identities = [
  ['Aviator', 'AVIATOR', 'aviator'],
  ['Pilot', 'PILOT', 'pilot'],
  ['Chicken Crash', 'CHICKEN', 'chickencrash'],
  ['Spank', 'SPANK', 'spank'],
]

function WalletApiSection() {
  return (
    <div className="space-y-6">
      <section className="bg-gradient-to-r from-green-500/10 to-cyan-500/10 border border-green-500/30 rounded-lg p-6">
        <h2 className="text-2xl font-bold text-green-300 mb-3">Seamless Wallet API</h2>
        <p className="text-gray-300 leading-7">
          These four HTTPS endpoints are implemented by your backend. PushVault calls them for authenticated real-money sessions. Demo sessions never call your wallet API.
        </p>
      </section>

      <section className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-5">
        <h3 className="text-lg font-bold text-yellow-300 mb-2">Availability and idempotency</h3>
        <p className="text-sm text-gray-300 leading-6">
          PushVault may retry an ambiguous timeout or server failure using the same transaction ID. Your debit and credit handlers must be atomic and idempotent. A retry must return the stored original result and must never move money twice.
        </p>
      </section>

      {endpoints.map((endpoint) => <EndpointCard key={endpoint.title} {...endpoint} />)}

      <section className="overflow-x-auto rounded-lg border border-slate-700">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-800 text-gray-200"><tr><th className="p-3">Game</th><th className="p-3">gameType</th><th className="p-3">gameName</th></tr></thead>
          <tbody className="divide-y divide-slate-800">
            {identities.map(([title, gameType, gameName]) => (
              <tr key={gameType} className="bg-black/20 text-gray-300"><td className="p-3 text-white">{title}</td><td className="p-3 font-mono">{gameType}</td><td className="p-3 font-mono">{gameName}</td></tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="bg-red-500/10 border border-red-500/30 rounded-lg p-5">
        <h3 className="text-lg font-bold text-red-300 mb-2">Wallet response rules</h3>
        <ul className="text-sm text-gray-300 space-y-2">
          <li>Return HTTP 2xx only when the requested operation succeeded or an idempotent replay was found.</li>
          <li>Return HTTP 4xx for invalid input, invalid player, invalid token, or insufficient balance.</li>
          <li>Return HTTP 5xx only for temporary server failures; PushVault may safely retry.</li>
          <li>Do not return secrets, internal database IDs, or formatted monetary strings.</li>
        </ul>
      </section>
    </div>
  )
}

export default WalletApiSection
