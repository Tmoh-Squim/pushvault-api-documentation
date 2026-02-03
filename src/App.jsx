import { useState } from 'react'
import ApiSection from './components/ApiSection'
import SocketSection from './components/SocketSection'

function App() {
  const [activeTab, setActiveTab] = useState('rest-api')

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 overflow-x-hidden relative">
      {/* Header */}
      <header className="bg-black/30 backdrop-blur-md border-b border-purple-500/20 sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex-1 min-w-0">
              <h1 className="text-lg sm:text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 break-words leading-tight">
                🎮 Game Device API
              </h1>
              <p className="text-gray-400 text-xs sm:text-sm mt-0.5 sm:mt-1">Complete reference for device integration</p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-purple-300 text-xs sm:text-sm font-mono">v1.0.0</p>
              <p className="text-gray-500 text-xs">Feb 2026</p>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs - Sticky */}
      <div className="bg-gradient-to-b from-slate-900 to-slate-900/95 backdrop-blur-md sticky top-[60px] sm:top-[81px] z-[45] border-b border-purple-500/20 will-change-transform">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex space-x-2 sm:space-x-4">
            <button
              onClick={() => setActiveTab('rest-api')}
              className={`px-4 sm:px-6 py-3 font-semibold text-sm sm:text-base transition-all duration-200 border-b-2 ${
                activeTab === 'rest-api'
                  ? 'border-purple-500 text-purple-400'
                  : 'border-transparent text-gray-400 hover:text-purple-300'
              }`}
            >
              📡 REST API
            </button>
            <button
              onClick={() => setActiveTab('socket-events')}
              className={`px-4 sm:px-6 py-3 font-semibold text-sm sm:text-base transition-all duration-200 border-b-2 ${
                activeTab === 'socket-events'
                  ? 'border-purple-500 text-purple-400'
                  : 'border-transparent text-gray-400 hover:text-purple-300'
              }`}
            >
              🔌 Socket Events
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {activeTab === 'rest-api' ? <ApiSection /> : <SocketSection />}
      </main>

      {/* Footer */}
      <footer className="bg-black/30 backdrop-blur-md border-t border-purple-500/20 mt-12 sm:mt-16">
        <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-6 text-center text-gray-500 text-xs sm:text-sm">
          <p>© 2026 PushVault Gaming Platform. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

export default App
