const steps = [
  ['1', 'Configure credentials', 'Receive your partner code, API key, API secret, and production API URL from PushVault.'],
  ['2', 'Implement wallet endpoints', 'Expose validate, balance, debit, and credit endpoints on your trusted backend.'],
  ['3', 'Sync the catalogue', 'Fetch active games server-to-server and store the returned identifiers, artwork, and iframe URL.'],
  ['4', 'Launch a game', 'Exchange your one-time player token for a signed PushVault token, then load the selected hosted game in an iframe.'],
  ['5', 'Pass certification', 'Run the real-money, demo, currency, idempotency, error, and browser test cases before production.'],
]

function IntegrationOverviewSection({ onNavigate }) {
  return (
    <div className="space-y-6">
      <section className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-lg p-6">
        <h2 className="text-2xl font-bold text-purple-300 mb-3">Integration overview</h2>
        <p className="text-gray-300 leading-7">
          PushVault provides complete hosted games. Your platform does not implement game logic or realtime game events. Your responsibilities are to expose the seamless-wallet API, sync the game catalogue, request launch tokens from your backend, and display the returned game URL.
        </p>
      </section>

      <section className="grid md:grid-cols-2 gap-4">
        <div className="bg-slate-900/60 border border-slate-700 rounded-lg p-5">
          <h3 className="text-lg font-bold text-cyan-300 mb-3">Production endpoints</h3>
          <dl className="text-sm space-y-3">
            <div><dt className="text-gray-400">API base</dt><dd className="text-white font-mono break-all">https://app.pushvault.shop</dd></div>
            <div><dt className="text-gray-400">Catalogue</dt><dd className="text-white font-mono break-all">GET /api/v1/catalog/games</dd></div>
            <div><dt className="text-gray-400">Launch</dt><dd className="text-white font-mono break-all">POST /api/v1/launch/token</dd></div>
          </dl>
        </div>
        <div className="bg-slate-900/60 border border-slate-700 rounded-lg p-5">
          <h3 className="text-lg font-bold text-cyan-300 mb-3">Credentials supplied to you</h3>
          <ul className="text-sm text-gray-300 space-y-2">
            <li><code className="text-cyan-300">partnerId</code> — your PushVault partner code</li>
            <li><code className="text-cyan-300">X-Api-Key</code> — server API identifier</li>
            <li><code className="text-cyan-300">X-Api-Secret</code> — server API secret</li>
            <li>Never expose either credential in browser or mobile application code.</li>
          </ul>
        </div>
      </section>

      <section className="bg-black/25 border border-slate-700 rounded-lg p-6">
        <h3 className="text-xl font-bold text-white mb-5">Integration flow</h3>
        <div className="space-y-4">
          {steps.map(([number, title, detail]) => (
            <div key={number} className="flex gap-4 items-start">
              <span className="w-8 h-8 rounded-full bg-purple-500/20 text-purple-300 grid place-items-center font-bold flex-shrink-0">{number}</span>
              <div><h4 className="text-white font-semibold">{title}</h4><p className="text-gray-400 text-sm mt-1">{detail}</p></div>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-5">
        <h3 className="text-lg font-bold text-yellow-300 mb-2">Required security rules</h3>
        <ul className="text-sm text-gray-300 space-y-2">
          <li>Make catalogue and launch requests only from your backend.</li>
          <li>Treat player launch tokens as one-time, short-lived credentials.</li>
          <li>Validate PushVault headers on every wallet request.</li>
          <li>Make debit and credit idempotent by <code className="text-yellow-200">transactionId</code>.</li>
          <li>Use HTTPS for every production endpoint and iframe URL.</li>
        </ul>
      </section>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          ['game-catalog', 'Open catalogue'],
          ['game-launch', 'Open launch API'],
          ['wallet-api', 'Open wallet API'],
          ['certification', 'Run certification'],
        ].map(([target, label]) => (
          <button key={target} type="button" onClick={() => onNavigate(target)} className="rounded-lg border border-purple-500/30 bg-purple-500/10 px-4 py-3 text-purple-200 font-semibold hover:bg-purple-500/20">
            {label}
          </button>
        ))}
      </div>
    </div>
  )
}

export default IntegrationOverviewSection
