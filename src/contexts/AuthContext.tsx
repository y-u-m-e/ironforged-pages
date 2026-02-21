/**
 * Auth Context for Ironforged Pages
 * Handles Discord OAuth authentication
 */

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { API_URLS } from '@/lib/api-config';

interface User {
  id: string;
  username: string;
  global_name: string | null;
  avatar: string | null;
}

interface ClanMember {
  discord_id: string;
  rsn: string;
  display_name?: string;
  rank?: string;
  join_date?: string;
}

interface AuthContextType {
  user: User | null;
  clanMember: ClanMember | null;
  loading: boolean;
  permissions: string[];
  isAdmin: boolean;
  isEventsAdmin: boolean;
  isSuperAdmin: boolean;
  hasPermission: (perm: string) => boolean;
  login: () => void;
  logout: () => void;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [clanMember, setClanMember] = useState<ClanMember | null>(null);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const getAuthHeaders = (): Record<string, string> => {
    const headers: Record<string, string> = {};
    const stagingToken = localStorage.getItem('staging_auth_token');
    if (stagingToken) {
      headers['Authorization'] = `Bearer ${stagingToken}`;
    }
    return headers;
  };

  const checkAuth = async () => {
    setLoading(true);
    
    try {
      const response = await fetch(`${API_URLS.AUTH}/auth/me`, {
        credentials: 'include',
        headers: getAuthHeaders(),
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.authenticated && data.user) {
          setUser(data.user);
          setPermissions(data.permissions || []);
          setIsSuperAdmin(data.is_super_admin || false);
          
          // Fetch clan member info based on discord ID
          try {
            const memberRes = await fetch(`${API_URLS.API}/clan/member/${data.user.id}`, {
              credentials: 'include',
              headers: getAuthHeaders(),
            });
            if (memberRes.ok) {
              const memberData = await memberRes.json();
              setClanMember(memberData || null);
            }
          } catch {
            setClanMember(null);
          }
        } else {
          clearAuth();
        }
      } else {
        clearAuth();
      }
    } catch (err) {
      console.error('Auth check failed:', err);
      clearAuth();
    }
    
    setLoading(false);
  };

  const clearAuth = () => {
    setUser(null);
    setClanMember(null);
    setPermissions([]);
    setIsSuperAdmin(false);
    const stagingToken = localStorage.getItem('staging_auth_token');
    if (stagingToken) {
      localStorage.removeItem('staging_auth_token');
    }
  };

  useEffect(() => {
    // Handle auth token from URL (after OAuth redirect)
    const urlParams = new URLSearchParams(window.location.search);
    const urlToken = urlParams.get('auth_token');
    if (urlToken) {
      localStorage.setItem('staging_auth_token', urlToken);
      window.history.replaceState({}, '', window.location.pathname);
    }
    
    checkAuth();
  }, []);

  const login = () => {
    const returnUrl = window.location.href;
    window.location.href = `${API_URLS.AUTH}/auth/login?return_url=${encodeURIComponent(returnUrl)}`;
  };

  const logout = () => {
    localStorage.removeItem('staging_auth_token');
    const returnUrl = window.location.origin;
    window.location.href = `${API_URLS.AUTH}/auth/logout?return_url=${encodeURIComponent(returnUrl)}`;
  };

  const refresh = async () => {
    await checkAuth();
  };

  const hasPermission = useCallback((perm: string): boolean => {
    if (isSuperAdmin) return true;
    return permissions.includes(perm);
  }, [permissions, isSuperAdmin]);

  // Use view_devops permission - same as emuy.gg admin dashboard
  const isAdmin = isSuperAdmin || hasPermission('view_devops');
  const isEventsAdmin = isSuperAdmin || hasPermission('events_admin') || hasPermission('view_devops');

  return (
    <AuthContext.Provider value={{
      user,
      clanMember,
      loading,
      permissions,
      isAdmin,
      isEventsAdmin,
      isSuperAdmin,
      hasPermission,
      login,
      logout,
      refresh,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
