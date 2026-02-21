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

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './index.css';

import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { HomePage } from '@/pages/HomePage';
import { ProfilePage } from '@/pages/ProfilePage';
import { AdminPage } from '@/pages/AdminPage';
import { Loader2 } from 'lucide-react';

function ProtectedRoute({ children, requireAdmin = false }: { children: React.ReactNode; requireAdmin?: boolean }) {
  const { user, loading, isAdmin } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-amber-400" />
        <span className="ml-3 text-gray-400">Loading...</span>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/profile" replace />;
  }

  return <>{children}</>;
}

function StagingBanner() {
  const hostname = window.location.hostname;
  const isStaging = hostname.includes('.pages.dev') || 
                    hostname.includes('staging.') || 
                    hostname.includes('localhost') ||
                    hostname.includes('127.0.0.1');
  
  if (!isStaging) return null;
  
  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-amber-500 text-black text-center py-1 text-xs font-medium">
      🚧 STAGING ENVIRONMENT - Changes here won't affect production
    </div>
  );
}

function AppRoutes() {
  const hostname = window.location.hostname;
  const isStaging = hostname.includes('.pages.dev') || 
                    hostname.includes('staging.') || 
                    hostname.includes('localhost') ||
                    hostname.includes('127.0.0.1');

  return (
    <div className={isStaging ? 'pt-6' : ''}>
      <StagingBanner />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route 
          path="/profile" 
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute requireAdmin>
              <AdminPage />
            </ProtectedRoute>
          } 
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
