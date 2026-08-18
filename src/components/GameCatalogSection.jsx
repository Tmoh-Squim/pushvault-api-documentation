import EndpointCard from './EndpointCard'

const games = [
  { title: 'Aviator', gameId: 'aviator', providerGameId: 'aviator', gameKey: 'AVIATOR', configGameKey: 'AVIATOR', category: 'crash', rtp: 97 },
  { title: 'Pilot', gameId: 'crash', providerGameId: 'pilot', gameKey: 'PILOT', configGameKey: 'CRASH', category: 'crash', rtp: 99 },
  { title: 'Chicken Crash', gameId: 'chicken-crash', providerGameId: 'chickencrash', gameKey: 'CHICKEN', configGameKey: 'CHICKEN', category: 'crash', rtp: 97 },
  { title: 'Spank', gameId: 'spank', providerGameId: 'spank', gameKey: 'SPANK', configGameKey: 'SPANK', category: 'mini-games', rtp: 97 },
]

const backendExample = [
  "const response = await fetch(",
  "  'https://app.pushvault.shop/api/v1/catalog/games',",
  "  {",
  "    headers: {",
  "      Accept: 'application/json',",
  "      'X-Api-Key': process.env.PUSHVAULT_API_KEY,",
  "      'X-Api-Secret': process.env.PUSHVAULT_API_SECRET",
  "    }",
  "  }",
  ");",
  "if (!response.ok) throw new Error('Catalogue request failed');",
  "",
  "const catalogue = await response.json();",
  "for (const game of catalogue.games) {",
  "  await games.upsert(",
  "    { provider: game.provider, gameId: game.gameId },",
  "    game",
  "  );",
  "}",
].join('\n')

function GameCatalogSection() {
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border border-emerald-500/30 rounded-lg p-6">
        <h2 className="text-2xl font-bold text-emerald-300 mb-3">PushVault Game Catalogue</h2>
        <p className="text-gray-300">
          Fetch the current PushVault games from your trusted backend. The catalogue is the source of truth for stable identities, artwork, launch URLs, flags, ordering, and RTP metadata.
        </p>
      </div>

      <div className="bg-red-500/10 border border-red-500/40 rounded-lg p-5">
        <h3 className="text-lg font-bold text-red-300 mb-2">Server-to-server authentication required</h3>
        <p className="text-gray-300 text-sm">
          Every catalogue request must include both <code className="text-white">X-Api-Key</code> and <code className="text-white">X-Api-Secret</code>. Missing or invalid credentials return HTTP 401. Never expose the secret in browser or mobile code.
        </p>
      </div>

      <EndpointCard
        title="Fetch game catalogue"
        method="GET"
        path="https://app.pushvault.shop/api/v1/catalog/games"
        description="Returns every active PushVault catalogue record. The compatibility endpoint /api/v1/games/catalog returns the same response."
        protected={true}
        headers={{
          'X-Api-Key': 'opk_your_partner_api_key',
          'X-Api-Secret': 'your_partner_api_secret',
          Accept: 'application/json',
        }}
        request="?gameKey=SPANK (optional)"
        response={{
          success: true,
          provider: 'PUSHVAULT',
          version: '1.0',
          total: 4,
          games: [
            {
              gameId: 'spank',
              providerGameId: 'spank',
              gameKey: 'SPANK',
              configGameKey: 'SPANK',
              demoUrl: '',
              demoSupported: true,
            },
          ],
          launch: {
            realMoney: { method: 'POST', path: '/api/v1/launch/token' },
            demo: { method: 'POST', path: '/api/v1/launch/token', requestFlag: { isDemo: true } },
          },
        }}
        notes={[
          'Both partner credentials are mandatory',
          'Requests must originate from your trusted backend',
          'Private responses may be cached for 60 seconds and served stale for up to 300 seconds',
          'Supported aliases: AVIATOR, PILOT/CRASH, CHICKEN/CHICKENCRASH, and SPANK',
          'demoUrl is empty because demo sessions use the signed token exchange',
        ]}
      />

      <div className="overflow-x-auto rounded-lg border border-slate-700">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-800 text-gray-200">
            <tr>
              {['Game', 'gameId', 'providerGameId', 'gameKey', 'configGameKey', 'Category', 'RTP'].map((heading) => (
                <th key={heading} className="p-3 whitespace-nowrap">{heading}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {games.map((game) => (
              <tr key={game.gameId} className="bg-black/20 text-gray-300">
                <td className="p-3 font-semibold text-white">{game.title}</td>
                <td className="p-3 font-mono">{game.gameId}</td>
                <td className="p-3 font-mono">{game.providerGameId}</td>
                <td className="p-3 font-mono">{game.gameKey}</td>
                <td className="p-3 font-mono">{game.configGameKey}</td>
                <td className="p-3">{game.category}</td>
                <td className="p-3">{game.rtp}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-slate-900/60 border border-slate-700 rounded-lg p-5">
          <h3 className="text-lg font-bold text-cyan-300 mb-3">Fields returned per game</h3>
          <p className="text-sm text-gray-300 font-mono leading-7">
            gameId, providerGameId, gameKey, configGameKey, title, provider, category, thumbnail, iframeBaseUrl, demoUrl, demoSupported, sortOrder, isActive, isFeatured, isHot, isNew, isLive, rtp, players
          </p>
        </div>
        <div className="bg-slate-900/60 border border-slate-700 rounded-lg p-5">
          <h3 className="text-lg font-bold text-cyan-300 mb-3">Partner catalogue rules</h3>
          <ul className="text-sm text-gray-300 space-y-2">
            <li>Upsert using the stable pair <code className="text-cyan-300">(provider, gameId)</code>.</li>
            <li>Refresh mutable metadata after every successful response.</li>
            <li>Do not delete games because one catalogue request failed.</li>
            <li>Fetch during onboarding/startup and periodically thereafter.</li>
            <li>Preserve Pilot&apos;s legacy <code className="text-cyan-300">configGameKey: CRASH</code>.</li>
          </ul>
        </div>
      </div>

      <div className="bg-black/30 border border-slate-700 rounded-lg p-5">
        <h3 className="text-lg font-bold text-white mb-3">Trusted-backend example</h3>
        <pre className="overflow-x-auto text-xs text-green-400"><code>{backendExample}</code></pre>
      </div>
    </div>
  )
}

export default GameCatalogSection
