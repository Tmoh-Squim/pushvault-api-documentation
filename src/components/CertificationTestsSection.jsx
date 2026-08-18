const smokeTest = `const assert = require('node:assert/strict');
const crypto = require('node:crypto');

const baseUrl = process.env.PUSHVAULT_API_URL || 'https://app.pushvault.shop';
const headers = {
  'Content-Type': 'application/json',
  'X-Api-Key': process.env.PUSHVAULT_API_KEY,
  'X-Api-Secret': process.env.PUSHVAULT_API_SECRET,
};

async function json(response) {
  const body = await response.json();
  assert.equal(response.ok, true, JSON.stringify(body));
  return body;
}

async function run() {
  const catalogue = await json(await fetch(
    baseUrl + '/api/v1/catalog/games',
    { headers }
  ));
  assert.equal(catalogue.success, true);
  assert.ok(catalogue.games.length >= 4);

  for (const game of catalogue.games) {
    assert.ok(game.gameId);
    assert.ok(game.gameKey);
    assert.ok(game.providerGameId);
    assert.ok(game.thumbnail);
    assert.ok(game.iframeBaseUrl);
  }

  const selectedGame = catalogue.games.find((game) => game.gameKey === 'SPANK');
  assert.ok(selectedGame);

  const launch = await json(await fetch(
    baseUrl + '/api/v1/launch/token',
    {
      method: 'POST',
      headers,
      body: JSON.stringify({
        token: crypto.randomUUID(),
        partnerId: process.env.PUSHVAULT_PARTNER_CODE,
        gameKey: selectedGame.gameKey,
        currency: 'KES',
        isDemo: true,
      }),
    }
  ));

  assert.equal(launch.success, true);
  assert.equal(launch.isDemo, true);
  assert.ok(launch.token);
  console.log('PushVault smoke test passed');
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});`

const cases = [
  ['AUTH-01', 'Catalogue credentials', 'Call the catalogue with both valid partner headers.', 'HTTP 200 and an active games array are returned.'],
  ['AUTH-02', 'Missing secret', 'Omit X-Api-Secret from a catalogue request.', 'HTTP 401 is returned and no catalogue data is exposed.'],
  ['AUTH-03', 'Wrong secret', 'Use a valid API key with an incorrect secret.', 'HTTP 401 is returned.'],
  ['CAT-01', 'Catalogue sync', 'Upsert all records using provider + gameId, then run the sync again.', 'No duplicates are created and mutable metadata is refreshed.'],
  ['CAT-02', 'Game filter', 'Request ?gameKey=SPANK and each supported game key.', 'Only the selected game is returned with its correct identifiers and assets.'],
  ['LAUNCH-01', 'Real launch', 'Create a valid one-time player token and request isDemo: false.', 'Your /validate endpoint is called and a signed launch token is returned.'],
  ['LAUNCH-02', 'Partner mismatch', 'Send credentials for partner A with partnerId for partner B.', 'HTTP 403 is returned.'],
  ['LAUNCH-03', 'Invalid player token', 'Request a real launch with an invalid or expired player token.', 'Launch returns a non-2xx response and the game is not opened.'],
  ['DEMO-01', 'Signed demo launch', 'Send a fresh random token with isDemo: true.', 'Launch succeeds and none of your four wallet endpoints is called.'],
  ['DEMO-02', 'Demo isolation', 'Launch two demos using two different random tokens.', 'Each demo starts with an independent demo session and balance.'],
  ['WALLET-01', 'Balance', 'Return a known balance and currency from /balance.', 'The same balance and currency appear in the launched game.'],
  ['WALLET-02', 'Successful debit', 'Start at 1,000 and accept a debit of 100.', 'Exactly 100 is deducted and the response balance is 900.'],
  ['WALLET-03', 'Insufficient balance', 'Start at 50 and attempt a debit of 100.', 'A non-2xx response is returned and balance remains 50.'],
  ['WALLET-04', 'Debit replay', 'Send the same debit transactionId twice.', 'The stored first response is returned and only one deduction occurs.'],
  ['WALLET-05', 'Credit replay', 'Send the same credit transactionId twice.', 'The stored first response is returned and only one credit occurs.'],
  ['WALLET-06', 'Concurrent debit', 'Send concurrent debits whose total exceeds the balance.', 'Atomic processing prevents a negative balance.'],
  ['WALLET-07', 'Retry after timeout', 'Delay the first debit/credit response so PushVault retries.', 'The retry uses the same transactionId and money moves only once.'],
  ['GAME-01', 'Game identity', 'Place one real bet in each available game.', 'Wallet payloads contain the documented gameType and gameName for that game.'],
  ['CUR-01', 'Currency propagation', 'Launch test players in every currency you support.', 'Wallet, launch response, game balance, stakes, and history use the same currency.'],
  ['UI-01', 'Iframe launch', 'Open each returned iframeBaseUrl with its signed token on desktop and mobile.', 'The game loads, resizes correctly, and no API secret appears in browser requests.'],
  ['SEC-01', 'Expired launch JWT', 'Open a game with an expired or modified PushVault token.', 'Authenticated play is rejected.'],
]

function CertificationTestsSection() {
  return (
    <div className="space-y-6">
      <section className="bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border border-emerald-500/30 rounded-lg p-6">
        <h2 className="text-2xl font-bold text-emerald-300 mb-3">Integration certification</h2>
        <p className="text-gray-300 leading-7">
          Run these cases in your test environment before requesting production activation. Keep request IDs, transaction IDs, wallet balances, and screenshots as evidence for failed-case investigation.
        </p>
      </section>

      <section className="bg-black/30 border border-slate-700 rounded-lg p-5">
        <h3 className="text-lg font-bold text-white mb-2">Automated connectivity smoke test</h3>
        <p className="text-sm text-gray-400 mb-4">Set PUSHVAULT_API_KEY, PUSHVAULT_API_SECRET, and PUSHVAULT_PARTNER_CODE, then run this with Node.js 18 or newer.</p>
        <pre className="overflow-x-auto text-xs text-green-400 bg-black/40 rounded p-4"><code>{smokeTest}</code></pre>
      </section>

      <section className="overflow-x-auto rounded-lg border border-slate-700">
        <table className="w-full min-w-[900px] text-sm text-left">
          <thead className="bg-slate-800 text-gray-200"><tr><th className="p-3">ID</th><th className="p-3">Test</th><th className="p-3">Procedure</th><th className="p-3">Expected result</th></tr></thead>
          <tbody className="divide-y divide-slate-800">
            {cases.map(([id, title, procedure, expected]) => (
              <tr key={id} className="bg-black/20 align-top">
                <td className="p-3 font-mono text-cyan-300">{id}</td>
                <td className="p-3 text-white font-semibold">{title}</td>
                <td className="p-3 text-gray-300">{procedure}</td>
                <td className="p-3 text-gray-300">{expected}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-5">
        <h3 className="text-lg font-bold text-purple-300 mb-3">Production readiness checklist</h3>
        <ul className="grid md:grid-cols-2 gap-2 text-sm text-gray-300">
          <li>□ Catalogue and launch calls originate from your backend.</li>
          <li>□ Secrets are stored in a secret manager or protected environment.</li>
          <li>□ All wallet endpoints use HTTPS.</li>
          <li>□ Debit and credit are atomic and idempotent.</li>
          <li>□ Duplicate and concurrent transaction tests pass.</li>
          <li>□ Every supported currency has been verified.</li>
          <li>□ All four games launch in real and demo modes.</li>
          <li>□ Desktop and mobile iframe behavior has been verified.</li>
          <li>□ Wallet requests and responses are logged by transactionId.</li>
          <li>□ Monitoring alerts on wallet failures and latency are enabled.</li>
        </ul>
      </section>
    </div>
  )
}

export default CertificationTestsSection
