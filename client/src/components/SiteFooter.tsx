import React from 'react';
import { Link } from 'react-router-dom';
import { SHELL_NAV } from '@/components/PageShell';

export const SiteFooter: React.FC = () => (
  <footer className="border-t border-border-warm bg-surface mt-auto">
    <div className={`${SHELL_NAV} mx-auto px-8 py-10`}>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div className="flex flex-wrap gap-x-8 gap-y-2 text-sm text-muted">
          <Link to="/bible" className="hover:text-ink transition-colors focus-ring">
            阅读
          </Link>
          <Link to="/leaderboard" className="hover:text-ink transition-colors focus-ring">
            排行
          </Link>
          <Link to="/analytics" className="hover:text-ink transition-colors focus-ring">
            分析
          </Link>
          <Link to="/settings" className="hover:text-ink transition-colors focus-ring">
            设置
          </Link>
        </div>
        <p className="text-xs text-muted tracking-wide">
          圣经阅读排行榜 · {new Date().getFullYear()}
        </p>
      </div>
    </div>
  </footer>
);
