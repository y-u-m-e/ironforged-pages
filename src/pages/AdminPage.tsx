/**
 * Admin Page - Configure clan point values
 */

import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { API_URLS } from '@/lib/api-config';
import { 
  Loader2, Save, ArrowLeft, Target, Swords, ScrollText,
  ChevronDown, ChevronUp, Users, Plus, Trash2, Upload, Download
} from 'lucide-react';

interface PointConfig {
  id: string;
  category: string;
  name: string;
  description?: string;
  points_per_unit: number;
  unit_type: string;
  multiplier: number;
  enabled: number;
}

interface ClanMember {
  discord_id: string;
  rsn: string;
  display_name?: string;
  rank?: string;
  join_date?: string;
  notes?: string;
}

export function AdminPage() {
  const { isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState<'points' | 'members'>('points');
  const [configs, setConfigs] = useState<PointConfig[]>([]);
  const [members, setMembers] = useState<ClanMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const [expandedCategories, setExpandedCategories] = useState({
    skill: true,
    boss: true,
    clue: true
  });

  // New member form
  const [newMember, setNewMember] = useState({ discord_id: '', rsn: '', display_name: '', rank: 'member' });
  const [showAddMember, setShowAddMember] = useState(false);

  // CSV import
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importing, setImporting] = useState(false);

  const getAuthHeaders = (): Record<string, string> => {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    const stagingToken = localStorage.getItem('staging_auth_token');
    if (stagingToken) {
      headers['Authorization'] = `Bearer ${stagingToken}`;
    }
    return headers;
  };

  const fetchConfigs = async () => {
    try {
      const res = await fetch(`${API_URLS.API}/clan/points/config`, {
        credentials: 'include',
        headers: getAuthHeaders()
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `Failed to fetch configs (${res.status})`);
      setConfigs(data.configs || []);
    } catch (err) {
      console.error('Fetch configs error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load configurations');
    }
  };

  const fetchMembers = async () => {
    try {
      const res = await fetch(`${API_URLS.API}/clan/members`, {
        credentials: 'include',
        headers: getAuthHeaders()
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `Failed to fetch members (${res.status})`);
      setMembers(data.members || []);
    } catch (err) {
      console.error('Fetch members error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load members');
    }
  };

  useEffect(() => {
    if (!authLoading) {
      if (!isAdmin) {
        navigate('/profile');
        return;
      }
      Promise.all([fetchConfigs(), fetchMembers()]).finally(() => setLoading(false));
    }
  }, [authLoading, isAdmin, navigate]);

  const updateConfig = async (config: PointConfig) => {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`${API_URLS.API}/clan/points/config/${config.id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          points_per_unit: config.points_per_unit,
          multiplier: config.multiplier,
          enabled: config.enabled
        })
      });
      if (!res.ok) throw new Error('Failed to update config');
      setSuccess('Configuration saved');
      setTimeout(() => setSuccess(null), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleConfigChange = (id: string, field: string, value: number) => {
    setConfigs(prev => prev.map(c => 
      c.id === id ? { ...c, [field]: value } : c
    ));
  };

  const addMember = async () => {
    if (!newMember.discord_id || !newMember.rsn) {
      setError('Discord ID and RSN are required');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`${API_URLS.API}/clan/members`, {
        method: 'POST',
        credentials: 'include',
        headers: getAuthHeaders(),
        body: JSON.stringify(newMember)
      });
      if (!res.ok) throw new Error('Failed to add member');
      await fetchMembers();
      setNewMember({ discord_id: '', rsn: '', display_name: '', rank: 'member' });
      setShowAddMember(false);
      setSuccess('Member added');
      setTimeout(() => setSuccess(null), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add member');
    } finally {
      setSaving(false);
    }
  };

  const deleteMember = async (discordId: string) => {
    if (!confirm('Are you sure you want to remove this member?')) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`${API_URLS.API}/clan/member/${discordId}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: getAuthHeaders()
      });
      if (!res.ok) throw new Error('Failed to delete member');
      await fetchMembers();
      setSuccess('Member removed');
      setTimeout(() => setSuccess(null), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove member');
    } finally {
      setSaving(false);
    }
  };

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => ({ 
      ...prev, 
      [category]: !prev[category as keyof typeof prev] 
    }));
  };

  // Export configs to CSV
  const exportToCsv = () => {
    const headers = ['config_key', 'category', 'name', 'points_per_unit', 'multiplier', 'unit_type'];
    const rows = configs.map(c => [
      c.id,
      c.category,
      c.name,
      c.points_per_unit,
      c.multiplier,
      c.unit_type
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'point_config.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Import configs from CSV
  const handleCsvImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setImporting(true);
    setError(null);
    
    try {
      const text = await file.text();
      const lines = text.trim().split('\n');
      
      if (lines.length < 2) {
        throw new Error('CSV must have a header row and at least one data row');
      }
      
      // Parse header
      const header = lines[0].split(',').map(h => h.trim().toLowerCase());
      const keyIndex = header.indexOf('config_key');
      const ptsIndex = header.indexOf('points_per_unit');
      const multIndex = header.indexOf('multiplier');
      
      if (keyIndex === -1 || ptsIndex === -1) {
        throw new Error('CSV must have "config_key" and "points_per_unit" columns');
      }
      
      // Parse data rows
      const updates: { config_key: string; points_per_unit: number; multiplier: number }[] = [];
      
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim());
        if (values.length <= Math.max(keyIndex, ptsIndex, multIndex)) continue;
        
        const config_key = values[keyIndex];
        const points_per_unit = parseFloat(values[ptsIndex]);
        const multiplier = multIndex !== -1 ? parseFloat(values[multIndex]) : 1;
        
        if (config_key && !isNaN(points_per_unit)) {
          updates.push({ config_key, points_per_unit, multiplier: isNaN(multiplier) ? 1 : multiplier });
        }
      }
      
      if (updates.length === 0) {
        throw new Error('No valid configurations found in CSV');
      }
      
      // Send bulk update to API
      const headers = getAuthHeaders();
      console.log('Import headers:', headers);
      console.log('Token from localStorage:', localStorage.getItem('staging_auth_token'));
      
      const res = await fetch(`${API_URLS.API}/clan/points/config/bulk`, {
        method: 'PUT',
        credentials: 'include',
        headers,
        body: JSON.stringify({ configs: updates })
      });
      
      const data = await res.json();
      console.log('Import response:', res.status, data);
      if (!res.ok) throw new Error(data.error || 'Failed to import configurations');
      
      setSuccess(`Imported ${data.updated} configurations`);
      setTimeout(() => setSuccess(null), 3000);
      
      // Refresh configs
      await fetchConfigs();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to import CSV');
    } finally {
      setImporting(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const groupedConfigs = {
    skill: configs.filter(c => c.category === 'skills'),
    boss: configs.filter(c => c.category === 'bosses'),
    clue: configs.filter(c => c.category === 'clues')
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-amber-400" />
        <span className="ml-3 text-gray-400">Loading...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <Link
            to="/profile"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Profile
          </Link>
          
          <h1 className="text-2xl font-bold">Admin Panel</h1>
          <p className="text-gray-400 text-sm mt-1">
            Configure clan point values and manage members
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-gray-900/50 border-b border-gray-800">
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex gap-1">
            <button
              onClick={() => setActiveTab('points')}
              className={`px-4 py-3 font-medium transition-colors ${
                activeTab === 'points'
                  ? 'text-amber-400 border-b-2 border-amber-400'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Point Configuration
            </button>
            <button
              onClick={() => setActiveTab('members')}
              className={`px-4 py-3 font-medium transition-colors ${
                activeTab === 'members'
                  ? 'text-amber-400 border-b-2 border-amber-400'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Members ({members.length})
            </button>
          </div>
        </div>
      </div>

      {/* Alerts */}
      <div className="max-w-4xl mx-auto px-6 pt-4">
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/20 border border-red-500/30 text-red-400 text-sm">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 p-3 rounded-lg bg-green-500/20 border border-green-500/30 text-green-400 text-sm">
            {success}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-6">
        {activeTab === 'points' ? (
          <div className="space-y-4">
            {/* Import/Export Controls */}
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">Point Values</h2>
              <div className="flex gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleCsvImport}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={importing}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 transition-colors disabled:opacity-50"
                >
                  {importing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                  Import CSV
                </button>
                <button
                  onClick={exportToCsv}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Export CSV
                </button>
              </div>
            </div>

            {/* CSV Format Help */}
            <div className="p-3 rounded-lg bg-gray-800/50 border border-gray-700 text-sm text-gray-400">
              <strong className="text-gray-300">CSV Format:</strong> config_key, category, name, points_per_unit, multiplier, unit_type
              <br />
              <span className="text-xs">Only config_key and points_per_unit are required for import. Export first to see all current values.</span>
            </div>

            {/* Skills */}
            <div className="bg-gray-900/50 rounded-xl border border-gray-800">
              <button
                onClick={() => toggleCategory('skill')}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-800/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Target className="w-5 h-5 text-green-400" />
                  <span className="font-semibold">Skills</span>
                  <span className="text-gray-400 text-sm">({groupedConfigs.skill.length})</span>
                </div>
                {expandedCategories.skill ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </button>
              
              {expandedCategories.skill && (
                <div className="p-4 pt-0 space-y-2">
                  <div className="text-xs text-gray-500 mb-2">
                    Points are calculated as: (XP / 100,000) × points_per_unit × multiplier
                  </div>
                  {groupedConfigs.skill.map(config => (
                    <ConfigRow 
                      key={config.id} 
                      config={config} 
                      onChange={handleConfigChange}
                      onSave={updateConfig}
                      saving={saving}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Bosses */}
            <div className="bg-gray-900/50 rounded-xl border border-gray-800">
              <button
                onClick={() => toggleCategory('boss')}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-800/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Swords className="w-5 h-5 text-red-400" />
                  <span className="font-semibold">Bosses</span>
                  <span className="text-gray-400 text-sm">({groupedConfigs.boss.length})</span>
                </div>
                {expandedCategories.boss ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </button>
              
              {expandedCategories.boss && (
                <div className="p-4 pt-0 space-y-2">
                  <div className="text-xs text-gray-500 mb-2">
                    Points are calculated as: kills × points_per_unit × multiplier
                  </div>
                  {groupedConfigs.boss.map(config => (
                    <ConfigRow 
                      key={config.id} 
                      config={config} 
                      onChange={handleConfigChange}
                      onSave={updateConfig}
                      saving={saving}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Clues */}
            <div className="bg-gray-900/50 rounded-xl border border-gray-800">
              <button
                onClick={() => toggleCategory('clue')}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-800/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <ScrollText className="w-5 h-5 text-purple-400" />
                  <span className="font-semibold">Clue Scrolls</span>
                  <span className="text-gray-400 text-sm">({groupedConfigs.clue.length})</span>
                </div>
                {expandedCategories.clue ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </button>
              
              {expandedCategories.clue && (
                <div className="p-4 pt-0 space-y-2">
                  <div className="text-xs text-gray-500 mb-2">
                    Points are calculated as: completions × points_per_unit × multiplier
                  </div>
                  {groupedConfigs.clue.map(config => (
                    <ConfigRow 
                      key={config.id} 
                      config={config} 
                      onChange={handleConfigChange}
                      onSave={updateConfig}
                      saving={saving}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Add Member Button */}
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">Clan Members</h2>
              <button
                onClick={() => setShowAddMember(!showAddMember)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-medium transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Member
              </button>
            </div>

            {/* Add Member Form */}
            {showAddMember && (
              <div className="p-4 rounded-xl bg-gray-900/50 border border-gray-800 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Discord ID *</label>
                    <input
                      type="text"
                      value={newMember.discord_id}
                      onChange={e => setNewMember(prev => ({ ...prev, discord_id: e.target.value }))}
                      placeholder="123456789012345678"
                      className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">RSN *</label>
                    <input
                      type="text"
                      value={newMember.rsn}
                      onChange={e => setNewMember(prev => ({ ...prev, rsn: e.target.value }))}
                      placeholder="RuneScape Name"
                      className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Display Name</label>
                    <input
                      type="text"
                      value={newMember.display_name}
                      onChange={e => setNewMember(prev => ({ ...prev, display_name: e.target.value }))}
                      placeholder="Optional"
                      className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Rank</label>
                    <select
                      value={newMember.rank}
                      onChange={e => setNewMember(prev => ({ ...prev, rank: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 focus:border-amber-500 focus:outline-none"
                    >
                      <option value="member">Member</option>
                      <option value="officer">Officer</option>
                      <option value="admin">Admin</option>
                      <option value="leader">Leader</option>
                    </select>
                  </div>
                </div>
                <div className="flex gap-2 justify-end">
                  <button
                    onClick={() => setShowAddMember(false)}
                    className="px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={addMember}
                    disabled={saving}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-medium transition-colors disabled:opacity-50"
                  >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                    Add Member
                  </button>
                </div>
              </div>
            )}

            {/* Members List */}
            <div className="bg-gray-900/50 rounded-xl border border-gray-800 overflow-hidden">
              {members.length === 0 ? (
                <div className="p-8 text-center text-gray-400">
                  <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>No members added yet</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-800">
                  {members.map(member => (
                    <div key={member.discord_id} className="flex items-center gap-4 p-4 hover:bg-gray-800/50">
                      <div className="flex-1 min-w-0">
                        <div className="font-medium">{member.display_name || member.rsn}</div>
                        <div className="text-sm text-gray-400">
                          {member.rsn} • {member.discord_id}
                        </div>
                      </div>
                      <span className="px-2 py-1 rounded bg-gray-800 text-xs text-gray-300">
                        {member.rank || 'member'}
                      </span>
                      <button
                        onClick={() => deleteMember(member.discord_id)}
                        className="p-2 rounded-lg hover:bg-red-500/20 text-red-400 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ConfigRow({ 
  config, 
  onChange, 
  onSave,
  saving 
}: { 
  config: PointConfig; 
  onChange: (id: string, field: string, value: number) => void;
  onSave: (config: PointConfig) => void;
  saving: boolean;
}) {
  const [localConfig, setLocalConfig] = useState(config);
  const hasChanges = localConfig.points_per_unit !== config.points_per_unit || 
                     localConfig.multiplier !== config.multiplier;

  return (
    <div className="flex items-center gap-4 p-3 rounded-lg bg-gray-800/50">
      <div className="flex-1 min-w-0">
        <div className="font-medium capitalize">{config.name.replace(/_/g, ' ')}</div>
        {config.description && (
          <div className="text-xs text-gray-500">{config.description}</div>
        )}
      </div>
      
      <div className="flex items-center gap-3">
        <div>
          <label className="text-xs text-gray-500 block">Points/Unit</label>
          <input
            type="number"
            step="0.1"
            value={localConfig.points_per_unit}
            onChange={e => {
              const val = parseFloat(e.target.value) || 0;
              setLocalConfig(prev => ({ ...prev, points_per_unit: val }));
              onChange(config.id, 'points_per_unit', val);
            }}
            className="w-20 px-2 py-1 rounded bg-gray-700 border border-gray-600 text-sm focus:border-amber-500 focus:outline-none"
          />
        </div>
        
        <div>
          <label className="text-xs text-gray-500 block">Multiplier</label>
          <input
            type="number"
            step="0.1"
            value={localConfig.multiplier}
            onChange={e => {
              const val = parseFloat(e.target.value) || 1;
              setLocalConfig(prev => ({ ...prev, multiplier: val }));
              onChange(config.id, 'multiplier', val);
            }}
            className="w-16 px-2 py-1 rounded bg-gray-700 border border-gray-600 text-sm focus:border-amber-500 focus:outline-none"
          />
        </div>

        <button
          onClick={() => onSave(localConfig)}
          disabled={saving || !hasChanges}
          className={`p-2 rounded-lg transition-colors ${
            hasChanges 
              ? 'bg-amber-500 hover:bg-amber-400 text-black' 
              : 'bg-gray-700 text-gray-500 cursor-not-allowed'
          }`}
          title="Save"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}
