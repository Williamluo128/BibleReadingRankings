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
    <nav className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center space-x-6">
            <div className="flex items-center">
              <Link to="/" className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-8 w-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <div className="ml-3">
                  <div className="text-base font-medium text-gray-800">圣经阅读排行榜</div>
                </div>
              </Link>
            </div>
            
            <nav className="hidden md:flex items-center space-x-4">
              <Link 
                to="/" 
                className={`px-3 py-2 rounded-lg ${
                  isActive('/') 
                    ? 'text-primary-600 bg-primary-50' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                主页
              </Link>
              <Link 
                to="/bible" 
                className={`px-3 py-2 rounded-lg ${
                  isActive('/bible') 
                    ? 'text-primary-600 bg-primary-50' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                圣经阅读
              </Link>
              <Link 
                to="/leaderboard" 
                className={`px-3 py-2 rounded-lg ${
                  isActive('/leaderboard') 
                    ? 'text-primary-600 bg-primary-50' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                排行榜
              </Link>
              <Link 
                to="/friends" 
                className={`px-3 py-2 rounded-lg ${
                  isActive('/friends') 
                    ? 'text-primary-600 bg-primary-50' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                好友
              </Link>
              <Link 
                to="/groups" 
                className={`px-3 py-2 rounded-lg ${
                  isActive('/groups') 
                    ? 'text-primary-600 bg-primary-50' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                群组
              </Link>
              {(user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN') && (
                <Link 
                  to="/admin" 
                  className={`px-3 py-2 rounded-lg ${
                    isActive('/admin') 
                      ? 'text-primary-600 bg-primary-50' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  管理
                </Link>
              )}
            </nav>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                <span className="text-primary-600 font-semibold text-sm">
                  {user?.displayName?.charAt(0) || 'U'}
                </span>
              </div>
              <span className="text-gray-700 text-sm hidden sm:inline">{user?.displayName}</span>
            </div>
            <Link
              to="/settings"
              className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-lg hover:bg-gray-100"
            >
              设置
            </Link>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
            >
              退出
            </Button>
          </div>
        </div>

        {/* Mobile menu */}
        <div className="md:hidden border-t border-gray-200 py-3">
          <div className="flex flex-wrap gap-2">
            <Link 
              to="/" 
              className={`px-3 py-2 rounded-lg text-sm ${
                isActive('/') 
                  ? 'text-primary-600 bg-primary-50' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              主页
            </Link>
            <Link 
              to="/bible" 
              className={`px-3 py-2 rounded-lg text-sm ${
                isActive('/bible') 
                  ? 'text-primary-600 bg-primary-50' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              圣经阅读
            </Link>
            <Link 
              to="/leaderboard" 
              className={`px-3 py-2 rounded-lg text-sm ${
                isActive('/leaderboard') 
                  ? 'text-primary-600 bg-primary-50' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              排行榜
            </Link>
            <Link 
              to="/friends" 
              className={`px-3 py-2 rounded-lg text-sm ${
                isActive('/friends') 
                  ? 'text-primary-600 bg-primary-50' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              好友
            </Link>
            <Link 
              to="/groups" 
              className={`px-3 py-2 rounded-lg text-sm ${
                isActive('/groups') 
                  ? 'text-primary-600 bg-primary-50' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              群组
            </Link>
            <Link 
              to="/settings" 
              className={`px-3 py-2 rounded-lg text-sm ${
                isActive('/settings') 
                  ? 'text-primary-600 bg-primary-50' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              设置
            </Link>
            {(user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN') && (
              <Link 
                to="/admin" 
                className={`px-3 py-2 rounded-lg text-sm ${
                  isActive('/admin') 
                    ? 'text-primary-600 bg-primary-50' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                管理
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};