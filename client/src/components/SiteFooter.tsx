import React from 'react';
import { Link } from 'react-router-dom';
import { SHELL_NAV } from '@/components/PageShell';

const navLinks = [
  { to: '/bible', label: '阅读' },
  { to: '/leaderboard', label: '排行' },
  { to: '/analytics', label: '分析' },
  { to: '/settings', label: '设置' },
] as const;

const legalLinks = [
  { to: '/privacy', label: '隐私政策' },
  { to: '/feedback', label: '意见反馈' },
] as const;

const year = new Date().getFullYear();

export const SiteFooter: React.FC = () => (
  <footer className="border-t border-border-warm bg-surface mt-auto">
    <div className={`${SHELL_NAV} mx-auto px-8 py-10`}>
      <div className="flex flex-col gap-8">
        <div className="flex flex-wrap gap-x-8 gap-y-2 text-sm text-muted">
          {navLinks.map(({ to, label }) => (
            <Link key={to} to={to} className="hover:text-ink transition-colors focus-ring">
              {label}
            </Link>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-6 border-t border-border-warm">
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-muted">
            {legalLinks.map(({ to, label }) => (
              <Link key={to} to={to} className="hover:text-ink transition-colors focus-ring">
                {label}
              </Link>
            ))}
          </div>
          <p className="text-xs text-muted tracking-wide">
            © {year} 圣经阅读排行榜
          </p>
        </div>
      </div>
    </div>
  </footer>
);
