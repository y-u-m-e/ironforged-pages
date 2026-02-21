/**
 * Clan Members / Leaderboard Page
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { API_URLS } from '@/lib/api-config';
import { Trophy, Users, Loader2, RefreshCw, Sword, Target, ChevronRight } from 'lucide-react';

interface RankingEntry {
  position: number;
  discord_id: string;
  rsn: string;
  display_name: string;
  rank: string;
  total_points: number;
  points_breakdown: {
    skills: number;
    bosses: number;
    clues: number;
  };
  total_level?: number;
  total_xp?: number;
  combat_level?: number;
  wom_error?: string;
}

export function MembersPage() {
  const [rankings, setRankings] = useState<RankingEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRankings = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URLS.API}/clan/rankings`);
      if (!res.ok) throw new Error('Failed to fetch rankings');
      const data = await res.json();
      setRankings(data.rankings || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load rankings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRankings();
  }, []);

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toFixed(1);
  };

  const getPositionStyle = (position: number) => {
    if (position === 1) return 'bg-amber-500/20 border-amber-500/50 text-amber-400';
    if (position === 2) return 'bg-gray-400/20 border-gray-400/50 text-gray-300';
    if (position === 3) return 'bg-amber-700/20 border-amber-700/50 text-amber-600';
    return 'bg-gray-800/50 border-gray-700/50 text-gray-400';
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <div className="bg-gradient-to-b from-gray-900 to-gray-950 border-b border-gray-800">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold flex items-center gap-3">
                <Trophy className="w-10 h-10 text-amber-400" />
                Clan Leaderboard
              </h1>
              <p className="text-gray-400 mt-2">
                Rankings based on skills, boss kills, and clue scrolls
              </p>
            </div>
            <button
              onClick={fetchRankings}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>

          {/* Stats Summary */}
          {!loading && rankings.length > 0 && (
            <div className="grid grid-cols-3 gap-4 mt-8">
              <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
                <div className="flex items-center gap-2 text-gray-400 text-sm">
                  <Users className="w-4 h-4" />
                  Total Members
                </div>
                <div className="text-2xl font-bold mt-1">{rankings.length}</div>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
                <div className="flex items-center gap-2 text-gray-400 text-sm">
                  <Target className="w-4 h-4" />
                  Total Points
                </div>
                <div className="text-2xl font-bold mt-1">
                  {formatNumber(rankings.reduce((sum, r) => sum + r.total_points, 0))}
                </div>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
                <div className="flex items-center gap-2 text-gray-400 text-sm">
                  <Sword className="w-4 h-4" />
                  Avg Combat Level
                </div>
                <div className="text-2xl font-bold mt-1">
                  {Math.round(rankings.filter(r => r.combat_level).reduce((sum, r) => sum + (r.combat_level || 0), 0) / rankings.filter(r => r.combat_level).length) || '-'}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-amber-400" />
            <span className="ml-3 text-gray-400">Loading rankings...</span>
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <div className="text-red-400 mb-4">{error}</div>
            <button
              onClick={fetchRankings}
              className="px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700"
            >
              Try Again
            </button>
          </div>
        ) : rankings.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <Users className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <p className="text-xl">No clan members found</p>
            <p className="text-sm mt-2">Add members through the admin panel</p>
          </div>
        ) : (
          <div className="space-y-3">
            {rankings.map((entry) => (
              <Link
                key={entry.discord_id}
                to={`/profile/${encodeURIComponent(entry.rsn)}`}
                className="block"
              >
                <div className={`flex items-center gap-4 p-4 rounded-xl border transition-all hover:scale-[1.01] ${getPositionStyle(entry.position)}`}>
                  {/* Position */}
                  <div className="w-12 h-12 rounded-lg bg-black/30 flex items-center justify-center font-bold text-xl">
                    {entry.position}
                  </div>

                  {/* Player Info */}
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-lg text-white truncate">
                      {entry.display_name || entry.rsn}
                    </div>
                    <div className="text-sm text-gray-400 flex items-center gap-3">
                      {entry.total_level && (
                        <span>Total: {entry.total_level}</span>
                      )}
                      {entry.combat_level && (
                        <span>Combat: {entry.combat_level}</span>
                      )}
                      {entry.wom_error && (
                        <span className="text-red-400 text-xs">{entry.wom_error}</span>
                      )}
                    </div>
                  </div>

                  {/* Points Breakdown */}
                  <div className="hidden md:flex items-center gap-4 text-sm">
                    <div className="text-center">
                      <div className="text-gray-400">Skills</div>
                      <div className="font-semibold">{formatNumber(entry.points_breakdown.skills)}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-gray-400">Bosses</div>
                      <div className="font-semibold">{formatNumber(entry.points_breakdown.bosses)}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-gray-400">Clues</div>
                      <div className="font-semibold">{formatNumber(entry.points_breakdown.clues)}</div>
                    </div>
                  </div>

                  {/* Total Points */}
                  <div className="text-right">
                    <div className="text-2xl font-bold text-amber-400">
                      {formatNumber(entry.total_points)}
                    </div>
                    <div className="text-xs text-gray-400">points</div>
                  </div>

                  <ChevronRight className="w-5 h-5 text-gray-500" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
