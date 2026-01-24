/**
 * =============================================================================
 * IRONFORGED EVENTS - Under Development
 * =============================================================================
 * 
 * Dedicated app for tile events
 * - Production: ironforged.gg
 * - Staging: ironforged.staging.emuy.gg
 * 
 * @author yume
 */

import './index.css'

function App() {
  return (
    <div 
      className="min-h-screen w-full flex flex-col items-center justify-center relative overflow-hidden"
      style={{
        backgroundImage: 'url(/Background.png)',
        backgroundSize: '120%',
        backgroundPosition: 'center center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      {/* Dark overlay for readability */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      
      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-2xl">
        {/* Logo/Icon */}
        <div className="mb-8">
          <img 
            src="/ironforged-icon.gif" 
            alt="Ironforged Logo"
            className="w-40 h-40 object-contain drop-shadow-2xl"
          />
        </div>

        {/* Title */}
        <h1 className="text-5xl font-bold text-white mb-4 tracking-tight">
          Ironforged
        </h1>
        
        {/* Subtitle */}
        <p className="text-xl text-amber-400 font-medium mb-6">
          Ironforged OSRS Clan
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
          We're working hard to bring you an amazing website experience. 
          Please check back soon!
        </p>

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
