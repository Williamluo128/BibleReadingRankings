import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth.store';
import { Logo } from '@/components/Logo';
import { SHELL_NAV } from '@/components/PageShell';

const primaryLinks = [
  { to: '/', label: '主页' },
  { to: '/bible', label: '阅读' },
] as const;

const socialLinks = [
  { to: '/friends', label: '好友' },
  { to: '/groups', label: '群组' },
] as const;

const dataLinks = [
  { to: '/leaderboard', label: '排行' },
  { to: '/analytics', label: '分析' },
] as const;

function NavGroup({ links, isActive }: { links: readonly { to: string; label: string }[]; isActive: (path: string) => boolean }) {
  return (
    <div className="flex items-center gap-8">
      {links.map(({ to, label }) => (
        <Link
          key={to}
          to={to}
          className={isActive(to) ? 'nav-link-minimal-active' : 'nav-link-minimal'}
        >
          {label}
        </Link>
      ))}
    </div>
  );
}

export const Navigation: React.FC = () => {
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <nav className="border-b border-border-warm bg-surface">
      <div className={`${SHELL_NAV} mx-auto px-8`}>
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center">
            <Logo size="sm" linkToHome />
          </div>

          <div className="hidden md:flex items-center gap-8">
            <NavGroup links={primaryLinks} isActive={isActive} />
            <span className="w-px h-4 bg-border-warm" aria-hidden />
            <NavGroup links={socialLinks} isActive={isActive} />
            <span className="w-px h-4 bg-border-warm" aria-hidden />
            <NavGroup links={dataLinks} isActive={isActive} />
            {(user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN') && (
              <>
                <span className="w-px h-4 bg-border-warm" aria-hidden />
                <Link
                  to="/admin"
                  className={isActive('/admin') ? 'nav-link-minimal-active' : 'nav-link-minimal'}
                >
                  管理
                </Link>
              </>
            )}
          </div>

          <div className="flex items-center space-x-8">
            <div className="hidden sm:flex items-center space-x-2">
              <span className="text-sm text-muted">{user?.displayName}</span>
            </div>
            <Link to="/settings" className="nav-link-minimal hidden sm:block">
              设置
            </Link>
            <button onClick={handleLogout} className="nav-link-minimal" type="button">
              退出
            </button>

            <div className="md:hidden flex items-center">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="text-ink hover:text-muted focus-ring"
                aria-expanded={isUserMenuOpen}
                aria-label="打开菜单"
              >
                <span className="text-sm uppercase tracking-wider">菜单</span>
              </button>
            </div>
          </div>
        </div>

        {isUserMenuOpen && (
          <div className="md:hidden border-t border-border-warm py-4 space-y-6">
            <div>
              <p className="text-xs uppercase tracking-widest text-muted px-2 mb-3">阅读</p>
              <div className="space-y-3">
                {primaryLinks.map(({ to, label }) => (
                  <Link key={to} to={to} className="block nav-link-minimal px-2">{label}</Link>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest text-muted px-2 mb-3">社交</p>
              <div className="space-y-3">
                {socialLinks.map(({ to, label }) => (
                  <Link key={to} to={to} className="block nav-link-minimal px-2">{label}</Link>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest text-muted px-2 mb-3">数据</p>
              <div className="space-y-3">
                {dataLinks.map(({ to, label }) => (
                  <Link key={to} to={to} className="block nav-link-minimal px-2">{label}</Link>
                ))}
              </div>
            </div>
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
