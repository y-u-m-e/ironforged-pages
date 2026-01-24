/**
 * Events Home - Landing page for Ironforged Events
 */

import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export default function EventsHome() {
  const { user, login } = useAuth();

  return (
    <div className="text-center py-16">
      <h1 className="text-4xl font-bold text-forge-400 mb-4">
        ⚔️ Ironforged Events
      </h1>
      <p className="text-xl text-gray-300 mb-8">
        Snake-style tile progression events for OSRS clans
      </p>

      {user ? (
        <div className="space-y-4">
          <p className="text-gray-300">
            Welcome back, {user.global_name || user.username}!
          </p>
          <Link
            to="/events"
            className="inline-block px-6 py-3 bg-forge-600 text-white rounded-lg hover:bg-forge-700"
          >
            View Events
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-gray-300">
            Sign in with Discord to participate in events
          </p>
          <button
            onClick={login}
            className="px-6 py-3 bg-forge-600 text-white rounded-lg hover:bg-forge-700"
          >
            Login with Discord
          </button>
        </div>
      )}

      <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="p-6 bg-gray-800 rounded-lg border border-gray-700">
          <h3 className="text-lg font-semibold text-forge-400 mb-2">🎯 Progress Through Tiles</h3>
          <p className="text-gray-400">
            Complete tasks and submit screenshots to advance through the event path
          </p>
        </div>
        <div className="p-6 bg-gray-800 rounded-lg border border-gray-700">
          <h3 className="text-lg font-semibold text-forge-400 mb-2">📸 Screenshot Verification</h3>
          <p className="text-gray-400">
            Submit proof of completion and get verified by event admins
          </p>
        </div>
        <div className="p-6 bg-gray-800 rounded-lg border border-gray-700">
          <h3 className="text-lg font-semibold text-forge-400 mb-2">🏆 Compete for Glory</h3>
          <p className="text-gray-400">
            Race to complete the event and earn your place on the leaderboard
          </p>
        </div>
      </div>
    </div>
  );
}

