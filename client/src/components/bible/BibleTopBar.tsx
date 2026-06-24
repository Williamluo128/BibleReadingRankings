import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Logo } from '@/components/Logo';
import { SHELL_WIDE } from '@/components/PageShell';

interface BibleTopBarProps {
  bookName?: string;
  chapterNumber?: number;
  onToggleSidebar: () => void;
}

export const BibleTopBar: React.FC<BibleTopBarProps> = ({
  bookName,
  chapterNumber,
  onToggleSidebar,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border-warm bg-surface">
      <div className={`${SHELL_WIDE} mx-auto px-8`}>
        <div className="flex items-center justify-between h-16 gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <Logo size="sm" linkToHome showText={false} />
            <span className="hidden sm:block w-px h-5 bg-border-warm shrink-0" />
            <button
              type="button"
              onClick={onToggleSidebar}
              className="lg:hidden text-xs uppercase tracking-wider text-muted hover:text-ink focus-ring shrink-0"
            >
              目录
            </button>
            <div className="min-w-0 truncate">
              {bookName && chapterNumber ? (
                <p className="text-sm text-ink truncate">
                  <span className="font-medium">{bookName}</span>
                  <span className="text-muted font-light"> · 第 {chapterNumber} 章</span>
                </p>
              ) : (
                <p className="text-sm text-muted">选择书卷与章节</p>
              )}
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-6 shrink-0">
            <Link to="/" className="nav-link-minimal">主页</Link>
            <Link to="/leaderboard" className="nav-link-minimal">排行</Link>
            <Link to="/analytics" className="nav-link-minimal">分析</Link>
            <Link to="/settings" className="nav-link-minimal">设置</Link>
          </nav>

          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            className="md:hidden text-xs uppercase tracking-wider text-ink focus-ring"
            aria-expanded={menuOpen}
          >
            菜单
          </button>
        </div>

        {menuOpen && (
          <div className="md:hidden border-t border-border-warm py-4 flex flex-wrap gap-4">
            <Link to="/" className="nav-link-minimal" onClick={() => setMenuOpen(false)}>主页</Link>
            <Link to="/leaderboard" className="nav-link-minimal" onClick={() => setMenuOpen(false)}>排行</Link>
            <Link to="/analytics" className="nav-link-minimal" onClick={() => setMenuOpen(false)}>分析</Link>
            <Link to="/settings" className="nav-link-minimal" onClick={() => setMenuOpen(false)}>设置</Link>
          </div>
        )}
      </div>
    </header>
  );
};
