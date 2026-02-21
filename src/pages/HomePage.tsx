/**
 * Iron Forged Homepage
 */

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Trophy, LogIn, Loader2, Shield, Settings } from 'lucide-react';

export function HomePage() {
  const { user, loading, login, isAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      navigate('/profile');
    }
  }, [user, loading, navigate]);

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
          View your clan points breakdown, track your progress, and see your rank within Iron Forged.
        </p>

        <div className="flex flex-wrap gap-4 justify-center">
          {loading ? (
            <div className="flex items-center gap-2 px-6 py-3 rounded-lg bg-gray-800 text-gray-400">
              <Loader2 className="w-5 h-5 animate-spin" />
              Loading...
            </div>
          ) : user ? (
            <>
              <button 
                onClick={() => navigate('/profile')}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-semibold transition-colors"
              >
                <Trophy className="w-5 h-5" />
                View My Profile
              </button>
              {isAdmin && (
                <button 
                  onClick={() => navigate('/admin')}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-gray-800 hover:bg-gray-700 text-white font-semibold transition-colors"
                >
                  <Settings className="w-5 h-5" />
                  Admin Panel
                </button>
              )}
            </>
          ) : (
            <button 
              onClick={login}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-semibold transition-colors"
            >
              <LogIn className="w-5 h-5" />
              Sign in with Discord
            </button>
          )}
          
          <a 
            href="https://discord.gg/ironforged"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-gray-800 hover:bg-gray-700 text-white font-semibold transition-colors"
          >
            <Shield className="w-5 h-5" />
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
