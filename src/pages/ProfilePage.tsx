/**
 * Player Profile Page
 */

import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { API_URLS } from '@/lib/api-config';
import { 
  ArrowLeft, Loader2, RefreshCw, Trophy, Swords, ScrollText, 
  Target, ExternalLink, User, Calendar
} from 'lucide-react';

interface SkillData {
  metric: string;
  experience: number;
  level: number;
  rank: number;
}

interface BossData {
  metric: string;
  kills: number;
  rank: number;
}

interface ProfileData {
  member: {
    discord_id?: string;
    rsn: string;
    display_name?: string;
    rank?: string;
    join_date?: string;
    is_guest?: boolean;
  };
  wom: {
    id: number;
    username: string;
    displayName: string;
    type: string;
    build: string;
    combatLevel: number;
    latestSnapshot?: {
      data: {
        skills: Record<string, SkillData>;
        bosses: Record<string, BossData>;
        activities: Record<string, { score: number; rank: number }>;
      };
    };
  } | null;
  points: {
    total: number;
    breakdown: {
      skills: number;
      bosses: number;
      clues: number;
    };
  };
}

const SKILL_ORDER = [
  'attack', 'hitpoints', 'mining',
  'strength', 'agility', 'smithing',
  'defence', 'herblore', 'fishing',
  'ranged', 'thieving', 'cooking',
  'prayer', 'crafting', 'firemaking',
  'magic', 'fletching', 'woodcutting',
  'runecrafting', 'slayer', 'farming',
  'construction', 'hunter'
];

const SKILL_COLORS: Record<string, string> = {
  attack: 'bg-red-600',
  strength: 'bg-green-700',
  defence: 'bg-blue-600',
  ranged: 'bg-green-500',
  prayer: 'bg-gray-300',
  magic: 'bg-blue-400',
  runecrafting: 'bg-yellow-500',
  hitpoints: 'bg-red-400',
  crafting: 'bg-amber-700',
  mining: 'bg-cyan-600',
  smithing: 'bg-gray-500',
  fishing: 'bg-blue-300',
  cooking: 'bg-purple-500',
  firemaking: 'bg-orange-500',
  woodcutting: 'bg-green-800',
  agility: 'bg-blue-800',
  herblore: 'bg-green-600',
  thieving: 'bg-purple-700',
  fletching: 'bg-teal-500',
  slayer: 'bg-gray-800',
  farming: 'bg-lime-600',
  construction: 'bg-amber-800',
  hunter: 'bg-amber-600'
};

export function ProfilePage() {
  const { rsn } = useParams<{ rsn: string }>();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = async () => {
    if (!rsn) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URLS.API}/clan/profile/${encodeURIComponent(rsn)}`);
      if (!res.ok) throw new Error('Failed to fetch profile');
      const data = await res.json();
      setProfile(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [rsn]);

  const formatNumber = (num: number) => {
    if (num >= 1000000000) return `${(num / 1000000000).toFixed(2)}B`;
    if (num >= 1000000) return `${(num / 1000000).toFixed(2)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toLocaleString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-amber-400" />
        <span className="ml-3 text-gray-400">Loading profile...</span>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 mb-4">{error || 'Profile not found'}</div>
          <Link
            to="/members"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Members
          </Link>
        </div>
      </div>
    );
  }

  const skills = profile.wom?.latestSnapshot?.data?.skills || {};
  const bosses = profile.wom?.latestSnapshot?.data?.bosses || {};
  const activities = profile.wom?.latestSnapshot?.data?.activities || {};

  // Sort bosses by KC
  const sortedBosses = Object.entries(bosses)
    .filter(([_, data]) => data.kills > 0)
    .sort((a, b) => b[1].kills - a[1].kills);

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <div className="bg-gradient-to-b from-gray-900 to-gray-950 border-b border-gray-800">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <Link
            to="/members"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Leaderboard
          </Link>

          <div className="flex items-start justify-between">
            <div className="flex items-center gap-6">
              {/* Avatar placeholder */}
              <div className="w-24 h-24 rounded-2xl bg-gray-800 border border-gray-700 flex items-center justify-center">
                <User className="w-12 h-12 text-gray-600" />
              </div>

              <div>
                <h1 className="text-3xl font-bold">
                  {profile.member.display_name || profile.member.rsn}
                </h1>
                <div className="flex items-center gap-4 mt-2 text-gray-400">
                  {profile.wom?.combatLevel && (
                    <span className="flex items-center gap-1">
                      <Swords className="w-4 h-4" />
                      Combat {profile.wom.combatLevel}
                    </span>
                  )}
                  {profile.member.rank && (
                    <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 text-sm">
                      {profile.member.rank}
                    </span>
                  )}
                  {profile.member.is_guest && (
                    <span className="px-2 py-0.5 rounded bg-gray-700 text-gray-400 text-sm">
                      Guest
                    </span>
                  )}
                </div>
                {profile.member.join_date && (
                  <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                    <Calendar className="w-3 h-3" />
                    Joined {new Date(profile.member.join_date).toLocaleDateString()}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={fetchProfile}
                className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
              <a
                href={`https://wiseoldman.net/players/${encodeURIComponent(profile.member.rsn)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                WOM
              </a>
            </div>
          </div>

          {/* Points Summary */}
          <div className="grid grid-cols-4 gap-4 mt-8">
            <div className="bg-amber-500/10 rounded-xl p-4 border border-amber-500/30">
              <div className="flex items-center gap-2 text-amber-400 text-sm">
                <Trophy className="w-4 h-4" />
                Total Points
              </div>
              <div className="text-3xl font-bold mt-1 text-amber-400">
                {formatNumber(profile.points.total)}
              </div>
            </div>
            <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
              <div className="flex items-center gap-2 text-gray-400 text-sm">
                <Target className="w-4 h-4" />
                Skills
              </div>
              <div className="text-2xl font-bold mt-1">
                {formatNumber(profile.points.breakdown.skills)}
              </div>
            </div>
            <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
              <div className="flex items-center gap-2 text-gray-400 text-sm">
                <Swords className="w-4 h-4" />
                Bosses
              </div>
              <div className="text-2xl font-bold mt-1">
                {formatNumber(profile.points.breakdown.bosses)}
              </div>
            </div>
            <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
              <div className="flex items-center gap-2 text-gray-400 text-sm">
                <ScrollText className="w-4 h-4" />
                Clues
              </div>
              <div className="text-2xl font-bold mt-1">
                {formatNumber(profile.points.breakdown.clues)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">
        {!profile.wom ? (
          <div className="text-center py-12 text-gray-400">
            <p>Player not found on Wise Old Man</p>
            <a
              href={`https://wiseoldman.net/players/${encodeURIComponent(profile.member.rsn)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 mt-4 text-amber-400 hover:underline"
            >
              Search on WOM <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        ) : (
          <>
            {/* Skills Grid */}
            <div>
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-amber-400" />
                Skills
              </h2>
              <div className="grid grid-cols-3 md:grid-cols-6 lg:grid-cols-8 gap-2">
                {SKILL_ORDER.map((skillName) => {
                  const skill = skills[skillName];
                  if (!skill) return null;
                  return (
                    <div
                      key={skillName}
                      className="bg-gray-800/50 rounded-lg p-3 border border-gray-700/50 text-center"
                    >
                      <div className={`w-8 h-8 rounded mx-auto mb-1 ${SKILL_COLORS[skillName] || 'bg-gray-600'}`} />
                      <div className="text-xs text-gray-400 capitalize truncate">{skillName}</div>
                      <div className="font-bold">{skill.level}</div>
                      <div className="text-xs text-gray-500">{formatNumber(skill.experience)}</div>
                    </div>
                  );
                })}
                {/* Overall */}
                {skills.overall && (
                  <div className="bg-amber-500/10 rounded-lg p-3 border border-amber-500/30 text-center col-span-2">
                    <div className="text-xs text-amber-400">Total Level</div>
                    <div className="text-2xl font-bold text-amber-400">{skills.overall.level}</div>
                    <div className="text-xs text-gray-400">{formatNumber(skills.overall.experience)} XP</div>
                  </div>
                )}
              </div>
            </div>

            {/* Boss Kills */}
            {sortedBosses.length > 0 && (
              <div>
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Swords className="w-5 h-5 text-amber-400" />
                  Boss Kills ({sortedBosses.length})
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
                  {sortedBosses.slice(0, 24).map(([bossName, data]) => (
                    <div
                      key={bossName}
                      className="bg-gray-800/50 rounded-lg p-3 border border-gray-700/50"
                    >
                      <div className="text-xs text-gray-400 truncate capitalize">
                        {bossName.replace(/_/g, ' ')}
                      </div>
                      <div className="font-bold text-lg">{data.kills.toLocaleString()}</div>
                    </div>
                  ))}
                </div>
                {sortedBosses.length > 24 && (
                  <p className="text-sm text-gray-500 mt-2">
                    +{sortedBosses.length - 24} more bosses
                  </p>
                )}
              </div>
            )}

            {/* Clue Scrolls */}
            {activities && (
              <div>
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <ScrollText className="w-5 h-5 text-amber-400" />
                  Clue Scrolls
                </h2>
                <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                  {['beginner', 'easy', 'medium', 'hard', 'elite', 'master'].map((tier) => {
                    const clueData = activities[`clue_scrolls_${tier}`];
                    return (
                      <div
                        key={tier}
                        className="bg-gray-800/50 rounded-lg p-3 border border-gray-700/50 text-center"
                      >
                        <div className="text-xs text-gray-400 capitalize">{tier}</div>
                        <div className="font-bold text-lg">{clueData?.score || 0}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
