import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth.store';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { LoginPage } from '@/pages/Login';
import { AuthCallback } from '@/pages/AuthCallback';
import { HomePage } from '@/pages/Home';
import { BiblePage } from '@/pages/Bible';
import { FriendsPage } from '@/pages/Friends';
import { LeaderboardPage } from '@/pages/Leaderboard';
import { GroupsPage } from '@/pages/Groups';
import { SettingsPage } from '@/pages/Settings';
import { AdminPage } from '@/pages/Admin';
import { GroupManagementPage } from '@/pages/GroupManagement';
import { AnalyticsPage } from '@/pages/Analytics';

function AppRoutes() {
  const { isAuthenticated, isLoading, checkAuth, hasHydrated, user } = useAuthStore();
  const location = useLocation();
  const isAuthCallback = location.pathname === '/auth/callback';

  useEffect(() => {
    if (!hasHydrated) {
      return;
    }
    // OAuth 回调页自行处理;已有 user 时跳过,避免 checkAuth 误清刚登录的状态
    if (!isAuthCallback && !(isAuthenticated && user)) {
      void checkAuth();
    }
  }, [checkAuth, isAuthCallback, hasHydrated, isAuthenticated, user]);

  const loginElement = !hasHydrated || isLoading ? (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
    </div>
  ) : isAuthenticated ? (
    <Navigate to="/" replace />
  ) : (
    <LoginPage />
  );

  return (
    <Routes>
        {/* Public routes - redirect to home if already authenticated */}
        <Route
          path="/login"
          element={loginElement}
        />
        {/* OAuth callback - Supabase redirects here after Google login */}
        <Route
          path="/auth/callback"
          element={<AuthCallback />}
        />

        {/* Protected routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/bible"
          element={
            <ProtectedRoute>
              <BiblePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/friends"
          element={
            <ProtectedRoute>
              <FriendsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/leaderboard"
          element={
            <ProtectedRoute>
              <LeaderboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/groups"
          element={
            <ProtectedRoute>
              <GroupsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/analytics"
          element={
            <ProtectedRoute>
              <AnalyticsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <SettingsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/groups/manage/:groupId"
          element={
            <ProtectedRoute>
              <GroupManagementPage />
            </ProtectedRoute>
          }
        />

        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
  );
}

function App() {
  return (
    <Router>
      <AppRoutes />
    </Router>
  );
}

export default App;
