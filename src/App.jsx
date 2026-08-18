import { useState } from 'react'
import IntegrationOverviewSection from './components/IntegrationOverviewSection'
import GameCatalogSection from './components/GameCatalogSection'
import GameLaunchSection from './components/GameLaunchSection'
import WalletApiSection from './components/WalletApiSection'
import CertificationTestsSection from './components/CertificationTestsSection'

const tabs = [
  { id: 'overview', label: 'Overview' },
  { id: 'game-catalog', label: 'Game Catalogue' },
  { id: 'game-launch', label: 'Game Launch' },
  { id: 'wallet-api', label: 'Wallet API' },
  { id: 'certification', label: 'Certification Tests' },
]

function App() {
  const [activeTab, setActiveTab] = useState('overview')

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 overflow-x-hidden">
      <header className="bg-black/30 backdrop-blur-md border-b border-purple-500/20 sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
              PushVault Games Integration
            </h1>
            <p className="text-gray-400 text-xs sm:text-sm mt-1">Hosted games, seamless wallet, and launch API</p>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-purple-300 text-xs sm:text-sm font-mono">API v1</p>
            <p className="text-gray-500 text-xs">August 2026</p>
          </div>
        </div>
      </header>

      <nav className="bg-slate-900/95 backdrop-blur-md sticky top-[69px] sm:top-[77px] z-40 border-b border-purple-500/20">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex gap-2 sm:gap-4 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 sm:px-5 py-3 whitespace-nowrap font-semibold text-sm transition-colors border-b-2 ${
                  activeTab === tab.id
                    ? 'border-purple-500 text-purple-300'
                    : 'border-transparent text-gray-400 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {activeTab === 'overview' && <IntegrationOverviewSection onNavigate={setActiveTab} />}
        {activeTab === 'game-catalog' && <GameCatalogSection />}
        {activeTab === 'game-launch' && <GameLaunchSection />}
        {activeTab === 'wallet-api' && <WalletApiSection />}
        {activeTab === 'certification' && <CertificationTestsSection />}
      </main>

      <footer className="bg-black/30 border-t border-purple-500/20 mt-12">
        <div className="container mx-auto px-4 sm:px-6 py-5 text-center text-gray-500 text-xs sm:text-sm">
          © 2026 PushVault Gaming Platform. Partner integration documentation.
        </div>
      </footer>
    </div>
  )
}

export default App
