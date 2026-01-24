/**
 * Events Layout - Dark themed for Ironforged Events
 */

import { Outlet, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export default function Layout() {
  const { user, loading, login, logout, isEventsAdmin } = useAuth();

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      {/* Navigation */}
      <nav className="bg-gray-800 shadow-lg border-b border-forge-600/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-8">
              <Link to="/" className="text-xl font-bold text-forge-400">
                ⚔️ Ironforged Events
              </Link>
              
              <Link to="/events" className="text-gray-300 hover:text-forge-400">
                Events
              </Link>
              <Link to="/guide" className="text-gray-300 hover:text-forge-400">
                Guide
              </Link>
              {isEventsAdmin && (
                <Link to="/admin" className="text-gray-300 hover:text-forge-400">
                  Admin
                </Link>
              )}
            </div>

            <div className="flex items-center">
              {loading ? (
                <span className="text-gray-400">Loading...</span>
              ) : user ? (
                <div className="flex items-center space-x-4">
                  <span className="text-gray-300">
                    {user.global_name || user.username}
                  </span>
                  <button
                    onClick={logout}
                    className="px-4 py-2 text-sm text-gray-300 hover:text-forge-400"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <button
                  onClick={login}
                  className="px-4 py-2 bg-forge-600 text-white rounded-lg hover:bg-forge-700"
                >
                  Login with Discord
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 border-t border-gray-700 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-center text-gray-500 text-sm">
            Part of <a href="https://emuy.gg" className="text-forge-400 hover:underline">Yume Tools</a>
          </p>
        </div>
      </footer>
    </div>
  );
}

