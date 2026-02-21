/**
 * =============================================================================
 * IRONFORGED - Clan Website
 * =============================================================================
 * 
 * - Production: ironforged.gg
 * - Staging: dev.ironforged-pages.pages.dev
 * 
 * @author yume
 */

import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Home, Trophy, Menu, X } from 'lucide-react';
import './index.css';

import { MembersPage } from './pages/MembersPage';
import { ProfilePage } from './pages/ProfilePage';

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

// Get auth token from URL, localStorage, or cookie
function getAuthToken(): string | null {
  const urlParams = new URLSearchParams(window.location.search);
  const urlToken = urlParams.get('auth_token');
  if (urlToken) {
    localStorage.setItem('staging_auth_token', urlToken);
    window.history.replaceState({}, '', window.location.pathname);
    return urlToken;
  }
  
  const storedToken = localStorage.getItem('staging_auth_token');
  if (storedToken) return storedToken;
  
  const match = document.cookie.match(/auth_token=([^;]+)/);
  return match ? match[1] : null;
}

function StagingGate({ children }: { children: React.ReactNode }) {
  const [checking, setChecking] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    if (!isStaging()) {
      setAuthorized(true);
      setChecking(false);
      return;
    }

    const token = getAuthToken();
    
    if (token) {
      fetch('https://auth.api.emuy.gg/auth/me', { 
        credentials: 'include',
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          const hasAccess = data.user && (
            data.is_super_admin || 
            data.permissions?.includes('view_devops')
          );
          if (!hasAccess) localStorage.removeItem('staging_auth_token');
          setAuthorized(hasAccess);
        })
        .catch(() => {
          localStorage.removeItem('staging_auth_token');
          setAuthorized(false);
        })
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
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-50 bg-amber-500 text-black text-center py-1 text-xs font-medium">
        🚧 STAGING ENVIRONMENT - Changes here won't affect production
      </div>
      <div className="pt-6">{children}</div>
    </>
  );
}

function HomePage() {
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
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      
      <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-2xl">
        <div className="mb-8">
          <img 
            src="/ironforged-icon.gif" 
            alt="Ironforged Logo"
            className="w-40 h-40 object-contain drop-shadow-2xl"
          />
        </div>

        <h1 className="text-5xl font-bold text-white mb-4 tracking-tight">
          Iron Forged
        </h1>
        
        <p className="text-xl text-amber-400 font-medium mb-6">
          OSRS Clan
        </p>

        <p className="text-gray-300 text-lg leading-relaxed mb-8">
          Welcome to Iron Forged! Check out our clan leaderboard and member profiles.
        </p>

        <div className="flex flex-wrap gap-4 justify-center">
          <Link 
            to="/members"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-semibold transition-colors"
          >
            <Trophy className="w-5 h-5" />
            View Leaderboard
          </Link>
          <a 
            href="https://discord.gg/ironforged"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-gray-800 hover:bg-gray-700 text-white font-semibold transition-colors"
          >
            Join Discord
          </a>
        </div>
      </div>

      <div className="absolute bottom-6 text-gray-500 text-sm">
        © 2026 Iron Forged
      </div>
    </div>
  );
}

function Navigation() {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/members', label: 'Leaderboard', icon: Trophy },
  ];

  // Don't show nav on home page
  if (location.pathname === '/') return null;

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 bg-gray-900/95 backdrop-blur border-b border-gray-800">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          <Link to="/" className="flex items-center gap-2">
            <img src="/ironforged-icon.gif" alt="Logo" className="w-8 h-8" />
            <span className="font-bold text-white">Iron Forged</span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                  location.pathname === item.path
                    ? 'bg-amber-500/20 text-amber-400'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </Link>
            ))}
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-gray-400"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-800 bg-gray-900">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-2 px-4 py-3 ${
                location.pathname === item.path
                  ? 'bg-amber-500/20 text-amber-400'
                  : 'text-gray-400'
              }`}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}

function AppContent() {
  const location = useLocation();
  const showNav = location.pathname !== '/';

  return (
    <>
      <Navigation />
      <div className={showNav ? 'pt-14' : ''}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/members" element={<MembersPage />} />
          <Route path="/profile/:rsn" element={<ProfilePage />} />
        </Routes>
      </div>
    </>
  );
}

function App() {
  return (
    <StagingGate>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </StagingGate>
  );
}

export default App;
