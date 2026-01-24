/**
 * =============================================================================
 * IRONFORGED EVENTS - Under Development
 * =============================================================================
 * 
 * Dedicated app for tile events
 * - Production: ironforged.gg
 * - Staging: ironforged.staging.emuy.gg
 * 
 * @author Yume Tools Team
 */

import './index.css'

function App() {
  return (
    <div 
      className="min-h-screen w-full flex flex-col items-center justify-center relative overflow-hidden"
      style={{
        backgroundImage: 'url(/Background.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      {/* Dark overlay for readability */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      
      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-2xl">
        {/* Logo/Icon */}
        <div className="mb-8">
          <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-600/20 border border-amber-500/30 flex items-center justify-center backdrop-blur-md">
            <svg 
              className="w-16 h-16 text-amber-400" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={1.5} 
                d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" 
              />
            </svg>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-5xl font-bold text-white mb-4 tracking-tight">
          Ironforged
        </h1>
        
        {/* Subtitle */}
        <p className="text-xl text-amber-400 font-medium mb-6">
          Tile Events Tracker
        </p>

        {/* Under Development Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/30 mb-8">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
          </span>
          <span className="text-amber-400 text-sm font-medium">Under Development</span>
        </div>

        {/* Description */}
        <p className="text-gray-300 text-lg leading-relaxed mb-8">
          We're working hard to bring you an amazing tile events tracking experience. 
          Track progress, compete with clanmates, and conquer the board!
        </p>

        {/* Features Coming */}
        <div className="grid grid-cols-3 gap-4 text-sm text-gray-400 mb-10">
          <div className="flex flex-col items-center gap-2 p-3 rounded-lg bg-white/5">
            <span className="text-2xl">🎯</span>
            <span>Tile Tracking</span>
          </div>
          <div className="flex flex-col items-center gap-2 p-3 rounded-lg bg-white/5">
            <span className="text-2xl">📊</span>
            <span>Leaderboards</span>
          </div>
          <div className="flex flex-col items-center gap-2 p-3 rounded-lg bg-white/5">
            <span className="text-2xl">🏆</span>
            <span>Competitions</span>
          </div>
        </div>

        {/* Back to main site */}
        <a 
          href="https://emuy.gg"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-semibold transition-colors"
        >
          <span>Visit Main Site</span>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </a>
      </div>

      {/* Footer */}
      <div className="absolute bottom-6 text-gray-500 text-sm">
        © 2026 Ironforged • Part of the Emuy ecosystem
      </div>
    </div>
  )
}

export default App
