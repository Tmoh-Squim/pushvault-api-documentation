import EndpointCard from './EndpointCard'

const gameUrls = {
  AVIATOR: 'https://online.pushvault.shop',
  PILOT: 'https://pilot.pushvault.shop',
  CHICKEN: 'https://chickencrash.pushvault.shop',
  SPANK: 'https://spank.pushvault.shop',
}

const iframeExample = [
  '// Use iframeBaseUrl from the selected catalogue record.',
  'const iframeUrl = new URL(selectedGame.iframeBaseUrl);',
  "iframeUrl.searchParams.set('token', launchResponse.token);",
  "iframeUrl.searchParams.set('gameId', selectedGame.providerGameId);",
  'gameFrame.src = iframeUrl.toString();',
  '',
  '// Do not add isDemo or currency to the iframe URL.',
  '// Both values are protected inside the signed JWT.',
].join('\n')

function GameLaunchSection() {
  const endpoints = [
    {
      title: 'Real-money token exchange',
      method: 'POST',
      path: 'https://app.pushvault.shop/api/v1/launch/token',
      description: 'Exchange a one-time player token for a signed PushVault game JWT. Call this endpoint only from your backend.',
      protected: true,
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': 'opk_your_partner_api_key',
        'X-Api-Secret': 'your_partner_api_secret',
      },
      request: {
        token: 'YOUR_ONE_TIME_PLAYER_TOKEN',
        partnerId: 'YOUR_PARTNER_CODE',
        gameKey: 'SPANK',
        currency: 'UGX',
        isDemo: false,
      },
      response: {
        success: true,
        token: 'eyJhbGciOiJIUzI1NiIs...',
        gameKey: 'SPANK',
        isDemo: false,
        player: { username: 'john_doe', currency: 'UGX' },
      },
      notes: [
        'Both X-Api-Key and X-Api-Secret are required',
        'partnerId must identify the same partner as the supplied credentials or the request returns HTTP 403',
        'PushVault validates the one-time token against your wallet API',
        'The validated player currency is authoritative; partner currency and KES are fallbacks',
        'Never perform this exchange directly from public browser code',
      ],
    },
    {
      title: 'Demo token exchange',
      method: 'POST',
      path: 'https://app.pushvault.shop/api/v1/launch/token',
      description: 'Demo uses the same endpoint and iframe construction as real play. Set isDemo to true in the server-to-server request.',
      protected: true,
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': 'opk_your_partner_api_key',
        'X-Api-Secret': 'your_partner_api_secret',
      },
      request: {
        token: 'FRESH_RANDOM_DEMO_TOKEN',
        partnerId: 'YOUR_PARTNER_CODE',
        gameKey: 'SPANK',
        currency: 'UGX',
        isDemo: true,
      },
      response: {
        success: true,
        token: 'eyJhbGciOiJIUzI1NiIs...',
        gameKey: 'SPANK',
        isDemo: true,
        player: { username: 'Demo Player', currency: 'UGX' },
      },
      notes: [
        'Generate a fresh random token for every demo launch',
        'Demo gameplay still runs through PushVault authenticated APIs, but PushVault does not call your validate, balance, debit, or credit wallet endpoints',
        'Opening SPANK without any token starts a local guest demo at the default 95% RTP; it is not associated with a partner or wallet',
        'Demo currency comes from this request, then falls back to the partner currency and KES',
        'isDemo is embedded in the signed JWT; never append it to the iframe URL',
        'Catalogue demoUrl is intentionally empty',
      ],
    },
  ]

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/30 rounded-lg p-6">
        <h2 className="text-2xl font-bold text-blue-300 mb-3">PushVault Game Launch</h2>
        <p className="text-gray-300">
          Aviator, Pilot, Chicken Crash, and Spank share one production launch contract. Fetch the selected game from the catalogue, exchange a token on your backend, then load the returned signed JWT in the game iframe.
        </p>
      </div>

      {endpoints.map((endpoint) => <EndpointCard key={endpoint.title} {...endpoint} />)}

      <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-lg p-6">
        <h3 className="text-lg font-bold text-purple-300 mb-3">Iframe construction</h3>
        <pre className="bg-black/50 rounded p-4 overflow-x-auto">
          <code className="text-xs text-green-400">{iframeExample}</code>
        </pre>
      </div>

      <div className="bg-slate-900/60 border border-slate-700 rounded-lg p-6">
        <h3 className="text-lg font-bold text-cyan-300 mb-3">Production game URLs</h3>
        <div className="grid sm:grid-cols-2 gap-3 text-sm">
          {Object.entries(gameUrls).map(([key, url]) => (
            <div key={key} className="bg-black/30 rounded p-3">
              <span className="text-white font-semibold">{key}</span>
              <code className="block text-cyan-300 mt-1 break-all">{url}</code>
            </div>
          ))}
        </div>
        <p className="text-gray-400 text-sm mt-4">The catalogue response is the runtime source of truth for launch URLs.</p>
      </div>
    </div>
  )
}

export default GameLaunchSection
