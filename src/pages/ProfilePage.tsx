/**
 * User Profile Page - Shows points breakdown for the logged-in user
 */

import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { API_URLS } from '@/lib/api-config';
import { 
  Loader2, RefreshCw, Trophy, Swords, ScrollText, 
  Target, ExternalLink, User, Calendar, LogOut, Settings,
  ChevronDown, ChevronUp, Home
} from 'lucide-react';

interface SkillPointData {
  xp: number;
  level: number;
  points: number;
  config: { points_per_unit: number; multiplier: number };
}

interface BossPointData {
  kills: number;
  points: number;
  config: { points_per_unit: number; multiplier: number };
}

interface CluePointData {
  count: number;
  points: number;
  config: { points_per_unit: number; multiplier: number };
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
        skills: Record<string, { experience: number; level: number; rank: number }>;
        bosses: Record<string, { kills: number; rank: number }>;
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
    details: {
      skills: Record<string, SkillPointData>;
      bosses: Record<string, BossPointData>;
      clues: Record<string, CluePointData>;
    };
  };
}

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
  const { user, clanMember, loading: authLoading, logout, isAdmin, refresh } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState({
    skills: true,
    bosses: true,
    clues: true
  });
  
  // RSN linking state
  const [rsnInput, setRsnInput] = useState('');
  const [linkingRsn, setLinkingRsn] = useState(false);
  const [linkError, setLinkError] = useState<string | null>(null);

  const fetchProfile = async () => {
    if (!clanMember?.rsn) {
      setError('No RSN linked to your account');
      setLoading(false);
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const stagingToken = localStorage.getItem('staging_auth_token');
      const headers: Record<string, string> = {};
      if (stagingToken) {
        headers['Authorization'] = `Bearer ${stagingToken}`;
      }
      
      const res = await fetch(`${API_URLS.API}/clan/profile/${encodeURIComponent(clanMember.rsn)}`, {
        credentials: 'include',
        headers
      });
      
      if (!res.ok) throw new Error('Failed to fetch profile');
      const data = await res.json();
      setProfile(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const linkRsn = async () => {
    if (!rsnInput.trim() || !user) return;
    
    setLinkingRsn(true);
    setLinkError(null);
    
    try {
      const stagingToken = localStorage.getItem('staging_auth_token');
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (stagingToken) {
        headers['Authorization'] = `Bearer ${stagingToken}`;
      }
      
      console.log('Linking RSN:', rsnInput.trim(), 'to user:', user.id);
      console.log('API URL:', `${API_URLS.API}/clan/link-rsn`);
      
      const res = await fetch(`${API_URLS.API}/clan/link-rsn`, {
        method: 'POST',
        credentials: 'include',
        headers,
        body: JSON.stringify({ rsn: rsnInput.trim() })
      });
      
      console.log('Response status:', res.status);
      
      const data = await res.json();
      console.log('Response data:', data);
      
      if (!res.ok) throw new Error(data.error || `Failed to link RSN (${res.status})`);
      
      // Refresh auth context to get updated clan member info
      await refresh();
    } catch (err) {
      console.error('Link RSN error:', err);
      setLinkError(err instanceof Error ? err.message : 'Failed to link RSN');
    } finally {
      setLinkingRsn(false);
    }
  };

  useEffect(() => {
    if (!authLoading && clanMember) {
      fetchProfile();
    } else if (!authLoading && !clanMember) {
      setLoading(false);
    }
  }, [authLoading, clanMember]);

  const formatNumber = (num: number) => {
    if (num >= 1000000000) return `${(num / 1000000000).toFixed(2)}B`;
    if (num >= 1000000) return `${(num / 1000000).toFixed(2)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toLocaleString();
  };

  const toggleSection = (section: 'skills' | 'bosses' | 'clues') => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  // Sort skills by points descending
  const sortedSkills = profile?.points?.details?.skills
    ? Object.entries(profile.points.details.skills)
        .sort((a, b) => b[1].points - a[1].points)
    : [];

  // Sort bosses by points descending
  const sortedBosses = profile?.points?.details?.bosses
    ? Object.entries(profile.points.details.bosses)
        .sort((a, b) => b[1].points - a[1].points)
    : [];

  // Sort clues by points descending
  const sortedClues = profile?.points?.details?.clues
    ? Object.entries(profile.points.details.clues)
        .sort((a, b) => b[1].points - a[1].points)
    : [];

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-amber-400" />
        <span className="ml-3 text-gray-400">Loading profile...</span>
      </div>
    );
  }

  if (!clanMember) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-6">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto mb-6">
              <User className="w-8 h-8 text-amber-400" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Link Your RSN</h1>
            <p className="text-gray-400">
              Enter your Old School RuneScape name to link it to your Discord account.
            </p>
          </div>

          <div className="bg-gray-900/50 rounded-xl border border-gray-800 p-6 space-y-4">
            {linkError && (
              <div className="p-3 rounded-lg bg-red-500/20 border border-red-500/30 text-red-400 text-sm">
                {linkError}
              </div>
            )}
            
            <div>
              <label className="block text-sm text-gray-400 mb-2">RuneScape Name</label>
              <input
                type="text"
                value={rsnInput}
                onChange={e => setRsnInput(e.target.value)}
                placeholder="Enter your RSN"
                className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 focus:border-amber-500 focus:outline-none text-white placeholder-gray-500"
                onKeyDown={e => e.key === 'Enter' && linkRsn()}
              />
            </div>

            <button
              onClick={linkRsn}
              disabled={linkingRsn || !rsnInput.trim()}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {linkingRsn ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Linking...
                </>
              ) : (
                <>
                  <User className="w-5 h-5" />
                  Link RSN
                </>
              )}
            </button>

            <p className="text-xs text-gray-500 text-center">
              This will be your display name across Iron Forged
            </p>
          </div>

          <div className="flex flex-wrap gap-3 justify-center mt-6">
            {isAdmin && (
              <button 
                onClick={() => navigate('/admin')}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-white transition-colors"
              >
                <Settings className="w-4 h-4" />
                Admin Panel
              </button>
            )}
            <button 
              onClick={() => navigate('/')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-white transition-colors"
            >
              <Home className="w-4 h-4" />
              Home
            </button>
            <button 
              onClick={logout}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 mb-4">{error || 'Profile not found'}</div>
          <button
            onClick={fetchProfile}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <div className="bg-gradient-to-b from-gray-900 to-gray-950 border-b border-gray-800">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="flex items-start justify-between mb-6">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-gray-400 hover:text-white"
            >
              <Home className="w-4 h-4" />
              Home
            </Link>
            <div className="flex items-center gap-2">
              {isAdmin && (
                <button
                  onClick={() => navigate('/admin')}
                  className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors"
                  title="Admin Panel"
                >
                  <Settings className="w-5 h-5" />
                </button>
              )}
              <button
                onClick={fetchProfile}
                className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors"
                title="Refresh"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
              <button
                onClick={logout}
                className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-6">
            {/* Avatar */}
            <div className="w-20 h-20 rounded-2xl bg-gray-800 border border-gray-700 flex items-center justify-center overflow-hidden">
              {user?.avatar ? (
                <img 
                  src={`https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=128`}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-10 h-10 text-gray-600" />
              )}
            </div>

            <div className="flex-1">
              <h1 className="text-2xl font-bold">
                {profile.member.display_name || profile.member.rsn}
              </h1>
              <div className="flex items-center gap-4 mt-1 text-gray-400 text-sm">
                {profile.wom?.combatLevel && (
                  <span className="flex items-center gap-1">
                    <Swords className="w-4 h-4" />
                    Combat {profile.wom.combatLevel}
                  </span>
                )}
                {profile.member.rank && (
                  <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400">
                    {profile.member.rank}
                  </span>
                )}
              </div>
              {profile.member.join_date && (
                <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                  <Calendar className="w-3 h-3" />
                  Joined {new Date(profile.member.join_date).toLocaleDateString()}
                </div>
              )}
            </div>

            <a
              href={`https://wiseoldman.net/players/${encodeURIComponent(profile.member.rsn)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors text-sm"
            >
              <ExternalLink className="w-4 h-4" />
              WOM Profile
            </a>
          </div>

          {/* Total Points */}
          <div className="mt-8 p-6 rounded-2xl bg-gradient-to-r from-amber-500/20 to-amber-600/10 border border-amber-500/30">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-amber-400 text-sm font-medium mb-1">Total Clan Points</div>
                <div className="text-4xl font-bold text-white">{formatNumber(profile.points.total)}</div>
              </div>
              <Trophy className="w-16 h-16 text-amber-400/30" />
            </div>
            <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-amber-500/20">
              <div>
                <div className="text-gray-400 text-xs">Skills</div>
                <div className="text-lg font-semibold">{formatNumber(profile.points.breakdown.skills)}</div>
              </div>
              <div>
                <div className="text-gray-400 text-xs">Bosses</div>
                <div className="text-lg font-semibold">{formatNumber(profile.points.breakdown.bosses)}</div>
              </div>
              <div>
                <div className="text-gray-400 text-xs">Clues</div>
                <div className="text-lg font-semibold">{formatNumber(profile.points.breakdown.clues)}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">
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
            {/* Skills Section */}
            <div className="bg-gray-900/50 rounded-xl border border-gray-800">
              <button
                onClick={() => toggleSection('skills')}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-800/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Target className="w-5 h-5 text-amber-400" />
                  <span className="font-semibold">Skills</span>
                  <span className="text-gray-400 text-sm">
                    ({formatNumber(profile.points.breakdown.skills)} pts)
                  </span>
                </div>
                {expandedSections.skills ? (
                  <ChevronUp className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                )}
              </button>
              
              {expandedSections.skills && (
                <div className="p-4 pt-0 space-y-2">
                  {sortedSkills.map(([skillName, data]) => (
                    <div 
                      key={skillName}
                      className="flex items-center gap-3 p-3 rounded-lg bg-gray-800/50 hover:bg-gray-800 transition-colors"
                    >
                      <div className={`w-8 h-8 rounded ${SKILL_COLORS[skillName] || 'bg-gray-600'}`} />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium capitalize">{skillName}</div>
                        <div className="text-xs text-gray-400">
                          Level {data.level} • {formatNumber(data.xp)} XP
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-amber-400">{data.points.toFixed(1)}</div>
                        <div className="text-xs text-gray-500">
                          {data.config.points_per_unit}/100k XP
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Bosses Section */}
            {sortedBosses.length > 0 && (
              <div className="bg-gray-900/50 rounded-xl border border-gray-800">
                <button
                  onClick={() => toggleSection('bosses')}
                  className="w-full flex items-center justify-between p-4 hover:bg-gray-800/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Swords className="w-5 h-5 text-amber-400" />
                    <span className="font-semibold">Boss Kills</span>
                    <span className="text-gray-400 text-sm">
                      ({formatNumber(profile.points.breakdown.bosses)} pts)
                    </span>
                  </div>
                  {expandedSections.bosses ? (
                    <ChevronUp className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  )}
                </button>
                
                {expandedSections.bosses && (
                  <div className="p-4 pt-0 space-y-2">
                    {sortedBosses.map(([bossName, data]) => (
                      <div 
                        key={bossName}
                        className="flex items-center gap-3 p-3 rounded-lg bg-gray-800/50 hover:bg-gray-800 transition-colors"
                      >
                        <div className="w-8 h-8 rounded bg-red-900/50 flex items-center justify-center">
                          <Swords className="w-4 h-4 text-red-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium capitalize truncate">
                            {bossName.replace(/_/g, ' ')}
                          </div>
                          <div className="text-xs text-gray-400">
                            {data.kills.toLocaleString()} kills
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-amber-400">{data.points.toFixed(1)}</div>
                          <div className="text-xs text-gray-500">
                            {data.config.points_per_unit}/kill
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Clues Section */}
            {sortedClues.length > 0 && (
              <div className="bg-gray-900/50 rounded-xl border border-gray-800">
                <button
                  onClick={() => toggleSection('clues')}
                  className="w-full flex items-center justify-between p-4 hover:bg-gray-800/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <ScrollText className="w-5 h-5 text-amber-400" />
                    <span className="font-semibold">Clue Scrolls</span>
                    <span className="text-gray-400 text-sm">
                      ({formatNumber(profile.points.breakdown.clues)} pts)
                    </span>
                  </div>
                  {expandedSections.clues ? (
                    <ChevronUp className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  )}
                </button>
                
                {expandedSections.clues && (
                  <div className="p-4 pt-0 space-y-2">
                    {sortedClues.map(([clueName, data]) => (
                      <div 
                        key={clueName}
                        className="flex items-center gap-3 p-3 rounded-lg bg-gray-800/50 hover:bg-gray-800 transition-colors"
                      >
                        <div className="w-8 h-8 rounded bg-purple-900/50 flex items-center justify-center">
                          <ScrollText className="w-4 h-4 text-purple-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium capitalize">{clueName}</div>
                          <div className="text-xs text-gray-400">
                            {data.count.toLocaleString()} completed
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-amber-400">{data.points.toFixed(1)}</div>
                          <div className="text-xs text-gray-500">
                            {data.config.points_per_unit}/clue
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
