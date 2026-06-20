import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth.store';
import { Button } from '@/components/ui/Button';

export const Navigation: React.FC = () => {
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <nav className="border-b border-gray-100 bg-white">
      <div className="max-w-7xl mx-auto px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo - Minimalist Text */}
          <div className="flex items-center">
            <Link to="/" className="text-xl font-light tracking-tight text-gray-900 hover:text-gray-600 transition-colors">
              圣经阅读
            </Link>
          </div>

          {/* Navigation Links - Text Only */}
          <div className="hidden md:flex items-center space-x-12">
            <Link
              to="/"
              className={isActive('/') ? 'nav-link-minimal-active' : 'nav-link-minimal'}
            >
              主页
            </Link>
            <Link
              to="/bible"
              className={isActive('/bible') ? 'nav-link-minimal-active' : 'nav-link-minimal'}
            >
              阅读
            </Link>
            <Link
              to="/leaderboard"
              className={isActive('/leaderboard') ? 'nav-link-minimal-active' : 'nav-link-minimal'}
            >
              排行
            </Link>
            <Link
              to="/friends"
              className={isActive('/friends') ? 'nav-link-minimal-active' : 'nav-link-minimal'}
            >
              好友
            </Link>
            <Link
              to="/groups"
              className={isActive('/groups') ? 'nav-link-minimal-active' : 'nav-link-minimal'}
            >
              群组
            </Link>
            <Link
              to="/analytics"
              className={isActive('/analytics') ? 'nav-link-minimal-active' : 'nav-link-minimal'}
            >
              分析
            </Link>
            {(user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN') && (
              <Link
                to="/admin"
                className={isActive('/admin') ? 'nav-link-minimal-active' : 'nav-link-minimal'}
              >
                管理
              </Link>
            )}
          </div>

          {/* User Menu - Minimalist */}
          <div className="flex items-center space-x-8">
            <div className="hidden sm:flex items-center space-x-2">
              <span className="text-sm text-gray-500">{user?.displayName}</span>
            </div>
            <Link
              to="/settings"
              className="nav-link-minimal hidden sm:block"
            >
              设置
            </Link>
            <button
              onClick={handleLogout}
              className="nav-link-minimal"
            >
              退出
            </button>

            {/* Mobile menu button - Minimalist */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="text-gray-900 hover:text-gray-600 focus:outline-none"
              >
                <span className="text-sm uppercase tracking-wider">菜单</span>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {isUserMenuOpen && (
          <div className="md:hidden border-t border-gray-100 py-4 space-y-4">
            <Link to="/" className="block nav-link-minimal px-2">主页</Link>
            <Link to="/bible" className="block nav-link-minimal px-2">阅读</Link>
            <Link to="/leaderboard" className="block nav-link-minimal px-2">排行</Link>
            <Link to="/friends" className="block nav-link-minimal px-2">好友</Link>
            <Link to="/groups" className="block nav-link-minimal px-2">群组</Link>
            <Link to="/settings" className="block nav-link-minimal px-2">设置</Link>
            {(user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN') && (
              <Link to="/admin" className="block nav-link-minimal px-2">管理</Link>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};