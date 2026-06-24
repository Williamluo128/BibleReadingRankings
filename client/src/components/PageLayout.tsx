import React from 'react';
import { Navigation } from '@/components/Navigation';
import { SiteFooter } from '@/components/SiteFooter';

interface PageLayoutProps {
  children: React.ReactNode;
}

/** 标准页面骨架：导航 + 内容 + 页脚 */
export const PageLayout: React.FC<PageLayoutProps> = ({ children }) => (
  <div className="min-h-screen bg-bone flex flex-col">
    <Navigation />
    <div className="flex-1">{children}</div>
    <SiteFooter />
  </div>
);
