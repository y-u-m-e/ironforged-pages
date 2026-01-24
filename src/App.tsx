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

import { useState, useEffect } from 'react'
import './index.css'

// Check if current URL is a staging/preview environment
function isStaging(): boolean {
  const hostname = window.location.hostname;
  return (
    hostname.includes('.pages.dev') ||
    hostname.includes('staging.') ||
    hostname.includes('localhost') ||
    hostname.includes('127.0.0.1')
  );
}

// Check for auth cookie
function hasAuthCookie(): boolean {
  return document.cookie.includes('auth_token=');
}

function StagingGate({ children }: { children: React.ReactNode }) {
  const [checking, setChecking] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    // Production - skip check
    if (!isStaging()) {
      setAuthorized(true);
      setChecking(false);
      return;
    }

    // Check for auth cookie
    if (hasAuthCookie()) {
      // Verify with auth API
      fetch('https://auth.api.emuy.gg/auth/me', { credentials: 'include' })
        .then(res => res.json())
        .then(data => {
          // Check if admin or has view_devops permission
          const hasAccess = data.user && (
            data.is_super_admin || 
            data.permissions?.includes('view_devops')
          );
          setAuthorized(hasAccess);
        })
        .catch(() => setAuthorized(false))
        .finally(() => setChecking(false));
    } else {
      setChecking(false);
      setAuthorized(false);
    }
  }, []);

  if (!isStaging()) return <>{children}</>;

  if (checking) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Checking authorization...</p>
        </div>
      </div>
    );
  }

  if (!authorized) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-6">
        <div className="max-w-md text-center">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Staging Environment</h1>
          <p className="text-gray-400 mb-6">
            This is a preview deployment. Please sign in with developer access to continue.
          </p>
          <a 
            href={`https://auth.api.emuy.gg/auth/login?return_url=${encodeURIComponent(window.location.href)}`}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-semibold transition-colors"
          >
            Sign in with Discord
          </a>
          <p className="text-xs text-gray-500 mt-4">
            Only users with DevOps access can view staging.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Staging Banner */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-amber-500 text-black text-center py-1 text-xs font-medium">
        🚧 STAGING ENVIRONMENT - Changes here won't affect production
      </div>
      <div className="pt-6">
        {children}
      </div>
    </>
  );
}

function App() {
  return (
    <StagingGate>
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
    </StagingGate>
  )
}

export default App
