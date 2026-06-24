import React from 'react';
import { Link } from 'react-router-dom';
import { Logo } from '@/components/Logo';
import { SiteFooter } from '@/components/SiteFooter';
import { PageShell, SHELL_NAV } from '@/components/PageShell';

interface LegalLayoutProps {
  children: React.ReactNode;
}

/** 公开信息页：顶栏 Logo + 内容 + 页脚 */
export const LegalLayout: React.FC<LegalLayoutProps> = ({ children }) => (
  <div className="min-h-screen bg-bone flex flex-col">
    <header className="border-b border-border-warm bg-surface">
      <div className={`${SHELL_NAV} mx-auto px-8 py-6`}>
        <Logo size="sm" linkToHome />
      </div>
    </header>
    <div className="flex-1">{children}</div>
    <SiteFooter />
  </div>
);

interface LegalSectionProps {
  title: string;
  children: React.ReactNode;
}

export const LegalSection: React.FC<LegalSectionProps> = ({ title, children }) => (
  <section className="mb-10 last:mb-0">
    <h2 className="text-sm uppercase tracking-widest text-muted mb-3">{title}</h2>
    <div className="text-muted font-light leading-relaxed space-y-3">{children}</div>
  </section>
);

export const LegalBackLink: React.FC = () => (
  <Link to="/" className="text-sm text-muted hover:text-ink transition-colors focus-ring">
    ← 返回首页
  </Link>
);
